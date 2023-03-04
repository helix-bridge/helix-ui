#!/bin/sh

function validate() {
    if [[ $1 =~ ^[a-zA-Z]+$ ]]; then
        echo "$1 is a valid name"
    else
        echo "Invalid name $1"
        exit 1
    fi
}

function validateFloder() {
    if [ -d './bridges/'$2'/'$1 ]; then
        echo "bridge $1 of $2 exist"
        exit 1
    fi
}

read -p "Origin chain(backing chain): "

origin=$REPLY
validate $origin
from=$(echo ${origin:0:1} | tr a-z A-Z)${origin:1}

read -p "Target chain(issuing chain): "

target=$REPLY
validate $target
to=$(echo ${target:0:1} | tr a-z A-Z)${target:1}

options=("helix" "helixLpBridge" "cBridge" "XCM")

echo "Input the bridge category index"

select category in "${options[@]}"; do
    case $category in
    helix)
        echo "The bridge category set to helix"
        break
        ;;
    cBridge)
        echo "The bridge category set to cBridge"
        break
        ;;
    XCM)
        echo "The bridge category set to XCM"
        break
        ;;
    helixLpBridge)
        echo "The bridge category set to helixLpBridge"
        break
        ;;
    quit)
        break
        ;;
    *)
        echo "Invalid option $REPLY"
        ;;
    esac
done

subdir="helix"

if [ $category = "cBridge" ]; then
    subdir="cbridge"
elif [ $category = "XCM" ]; then
    subdir="xcm"
elif [ $category = "helixLpBridge" ]; then
    subdir="helixlp"
else
    subdir="helix"
fi

validateFloder $origin'-'$target $subdir

function checkExist() {
    local departure=${from}"2"${to}
    local arrival=${to}"2"${from}
    local dir=$category'/'$origin'-'$target

    for cur in $(ls ./bridges/$subdir'/'); do
        if [ $cur = $dir ]; then
            echo "\033[31mCreate Failed!\033[0m Bridge $origin <-> $target exist"
            exit 1
        fi
    done
}

function indexFile() {
    echo "export * from './$1';" >>$2
}

function component() {
    if [ "$category" = "cBridge" ]; then
        echo "
            import { CBridge } from '../cBridge/CBridge';

            export const $1 = CBridge;
        " >>$2'/'$1'.tsx'
    elif [ "$category" = "helixLpBridge" ]; then
        echo "
            import { CrossToken, DVMChainConfig } from 'shared/model';
            import { Bridge } from '../../../components/bridge/Bridge';
            import { CrossChainComponentProps } from '../../../model/component';
            import { ${from}${to}Bridge } from './utils/bridge';
            
            export function $1$3(
              props: CrossChainComponentProps<${from}${to}Bridge, CrossToken<DVMChainConfig>, CrossToken<DVMChainConfig>>
            ) {
              return <Bridge {...props} hideRecipient />;
            }
        " >>$2'/'$1$3'.tsx'
    else
        echo "
            import { ChainConfig, CrossToken } from 'shared/model';
            import { Bridge } from '../../../components/bridge/Bridge';
            import { CrossChainComponentProps } from '../../../model/component';
            import { ${from}${to}Bridge } from './utils';

            export function $1(props: CrossChainComponentProps<${from}${to}Bridge, CrossToken<ChainConfig>, CrossToken<ChainConfig>>) {
                return <Bridge {...props} />;
            }
        " >>$2'/'$1'.tsx'
    fi
}

function initModel() {
    local name=${from}''${to}

    echo "
        import { BridgeConfig } from 'shared/model';
        import { ContractConfig } from 'shared/model';
        import { CrossToken, $2ChainConfig } from 'shared/model';
        import { Bridge } from '../../../../core/bridge';
        import { CrossChainPayload } from '../../../../model/tx';

        type ${name}ContractConfig = ContractConfig;

        export type ${name}BridgeConfig = Required<BridgeConfig<${name}ContractConfig>>;

        export type IssuingPayload = CrossChainPayload<
            Bridge<${name}BridgeConfig, $2ChainConfig, $2ChainConfig>,
            CrossToken<$2ChainConfig>,
            CrossToken<$2ChainConfig>
        >;

        export type RedeemPayload = CrossChainPayload<
            Bridge<${name}BridgeConfig, DVMChainConfig, DVMChainConfig>,
            CrossToken<$2ChainConfig>,
            CrossToken<$2ChainConfig>
        >;
    " >>$1'/bridge.ts'

    echo "
        export * from './bridge';
    " >>$1'/index.ts'
}

function initConfig() {
    echo "
        import { ${origin}Config, ${target}Config } from 'shared/config/network';
        import { BridgeBase } from 'shared/core/bridge';
        import { ${from}${to}BridgeConfig } from '../model';

        const ${origin}${to}Config: ${from}${to}BridgeConfig = { 
            contracts: {
                backing: '',
                issuing: ''
            } 
        };

        export const ${origin}${to} = new BridgeBase(${origin}Config, ${target}Config, ${origin}${to}Config, {
            name: '${origin}-${target}',
            category: '${category}',
        });
    " >>$1'/bridge.ts'

    echo "
        export * from './bridge';
    " >>$1'/index.ts'
}

function initUitls() {
    local name=${from}''${to}

    echo "
        import { BN, BN_ZERO } from '@polkadot/util';
        import omit from 'lodash/omit';
        import { ChainConfig, CrossChainDirection, CrossToken, Tx } from 'shared/model';
        import { EMPTY } from 'rxjs/internal/observable/empty';
        import type { Observable } from 'rxjs';
        import { IssuingPayload, RedeemPayload, ${name}BridgeConfig } from '../model';
        import { Bridge, TokenWithAmount } from '../../../../core/bridge';

        export class ${name}Bridge extends Bridge<
            ${name}BridgeConfig,
            ChainConfig,
            ChainConfig
        > {
            static readonly alias: string = '${name}Bridge';

            back(_payload: IssuingPayload, _fee: BN): Observable<Tx> {
                return EMPTY;
            }

            burn(_payload: RedeemPayload, _fee: BN): Observable<Tx> {
                return EMPTY;
            }

            async getFee(
                direction: CrossChainDirection<CrossToken<ChainConfig>, CrossToken<ChainConfig>>
            ): Promise<TokenWithAmount | null> {
                return { ...omit(direction.from, ['meta', 'amount']), amount: BN_ZERO };
            }
        }
    " >>$1'/bridge.ts'

    echo "
        export * from './bridge';
    " >>$1'/index.ts'
}

function updateSupports() {
    local BRGS=$(sed -r 's/(.*);/\1/' ../shared/model/bridge/supports.ts)

    echo "
    $BRGS
    | '${origin}-${target}';
   " >'../shared/model/bridge/supports.ts'
}

function updateBridgesIndexer() {
    echo "
        export { $1, $2 } from './$3';
    " >>'./bridges/index.ts'
}

function createRecord() {
    echo "
        import type { GetServerSidePropsContext, NextPage } from 'next';
        import { useMemo } from 'react';
        import { RecordStatus } from 'shared/config/constant';
        import { HelixHistoryRecord } from 'shared/model';
        import { revertAccount } from 'shared/utils/helper/address';
        import { getBridge } from 'utils/bridge';
        import { getChainConfig } from 'utils/network';
        import {
            getDirectionFromHelixRecord,
            getReceivedAmountFromHelixRecord,
            getSentAmountFromHelixRecord,
            getTokenConfigFromHelixRecord,
        } from 'utils/record';
        import { CrabDVMDarwiniaDVMBridgeConfig } from '../../../../bridges/$2/crabDVM-darwiniaDVM/model';
        import { DarwiniaDVMCrabDVMBridgeConfig } from '../../../../bridges/$2/darwiniaDVM-crabDVM/model';
        import { Detail } from '../../../../components/transaction/Detail';
        import { ZERO_ADDRESS } from '../../../../config';
        import { useUpdatableRecord } from '../../../../hooks';
        import { TransferStep } from '../../../../model/transfer';
        import { getServerSideRecordProps } from '../../../../utils/getServerSideRecordProps';

        export async function getServerSideProps(context: GetServerSidePropsContext<{ id: string }, HelixHistoryRecord>) {
            return getServerSideRecordProps(context);
        }

        const Page: NextPage<{
            id: string;
        }> = ({ id }) => {
            const { record } = useUpdatableRecord(id);

            // eslint-disable-next-line complexity
            const transfers = useMemo(() => {
                if (!record) {
                    return [];
                }

                const departure = getChainConfig(record.fromChain);
                const arrival = getChainConfig(record.toChain);
                const direction = getDirectionFromHelixRecord(record);

                if (!direction) {
                    return [];
                }

                const bridge = getBridge<DarwiniaDVMCrabDVMBridgeConfig | CrabDVMDarwiniaDVMBridgeConfig>(direction);
                const { from: fromToken, to: toToken } = direction;
                const departure = fromToken.meta;
                const arrival = toToken.meta;
                const isBack = bridge.isIssue(departure, arrival);
                const sendAmount = getSentAmountFromHelixRecord(record);
                const recvAmount = getReceivedAmountFromHelixRecord(record);
                const { backing } = bridge.config.contracts;
                const sender = revertAccount(record.sender, departure);
                const recipient = revertAccount(record.recipient, arrival);
                const issuing = ZERO_ADDRESS;

                const start: TransferStep = {
                    chain: departure,
                    sender,
                    recipient: isBack ? backing : issuing,
                    token: fromToken,
                    amount: sendAmount,
                };

                const success: TransferStep = {
                    chain: arrival,
                    sender: isBack ? issuing : backing,
                    recipient,
                    token: toToken,
                    amount: recvAmount,
                };

                const fail: TransferStep = {
                    chain: departure,
                    sender: isBack ? backing : issuing,
                    recipient: sender,
                    token: fromToken,
                    amount: sendAmount,
                };

                if (record.result === RecordStatus.pending) {
                    return [start];
                }

                return [start, record.result === RecordStatus.success ? success : fail];
            }, [record]);

            return record && <Detail record={record} transfers={transfers} />;
        };

        export default Page;
    " >>$1'/[id].tsx'
}

function init() {
    local departure=${from}"2"${to}
    local arrival=${to}"2"${from}

    local dir=$subdir'/'$origin'-'$target
    local path='./bridges/'$dir
    local index=$path'/index.ts'
    local dvmFlag='DVM'
    local categoryFlag=''

    mkdir $path

    if [ "$category" != "cBridge" ]; then
        mkdir $path'/config'

        mkdir $path'/utils'
        initUitls $path'/utils' $departure $arrival
    fi

    if [ "$category" != "helixLpBridge" ]; then
        mkdir $path'/config'
        mkdir $path'/utils'
        initUitls $path'/utils' $departure $arrival
        mkdir './pages/records/'$dir
        createRecord './pages/records/'$dir 'helixLpBridge'
    else
        categoryFlag='Ln'
    fi

    if [ "$category" == "helix" ]; then
        mkdir './pages/records/'$dir
        createRecord './pages/records/'$dir 'helix'
        dvmFlag = ''
    fi

    mkdir $path'/model'
    initModel $path'/model' $dvmFlag

    mkdir $path'/config'
    initConfig $path'/config' $departure $arrival

    component $departure $path $categoryFlag
    component $arrival $path $categoryFlag

    indexFile $departure$categoryFlag $index
    indexFile $arrival$categoryFlag $index

    updateBridgesIndexer $departure$categoryFlag $arrival$categoryFlag $dir

    updateSupports

    echo "\033[32mCreate success!\033[0m"
}

checkExist

init

../../node_modules/prettier/bin-prettier.js ./bridges/${subdir}/${origin}'-'${target}/**/*.{ts,tsx} --write
../../node_modules/prettier/bin-prettier.js ../shared/config/**/*.ts --write
../../node_modules/prettier/bin-prettier.js ../shared/model/**/*.ts --write
../../node_modules/prettier/bin-prettier.js ./utils/bridge/predicates.ts --write
cd ../../
yarn eslint
