#!/bin/sh

function validate() {
    if [[ $1 =~ ^[a-zA-Z]+$ ]]; then
        echo "$1 is a valid name"
    else
        echo "Invalid name $1"
        exit 1
    fi
}

function validate_folder() {
    if [ -d './bridges/'$2'/'$1 ]; then
        echo "bridge $1 of $2 exist"
        exit 1
    fi
}

read -p "Origin chain(backing chain): " origin

validate $origin
from=$(echo ${origin:0:1} | tr a-z A-Z)${origin:1}

read -p "Target chain(issuing chain): " target

validate $target
to=$(echo ${target:0:1} | tr a-z A-Z)${target:1}

options=("helix" "helixLpBridge" "cBridge" "XCM" "l1tol2")

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
    l1tol2)
        echo "The bridge category set to l1tol2"
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
elif [ $category = "l1tol2" ]; then
    subdir="l1tol2"
else
    subdir="helix"
fi

validate_folder $origin'-'$target $subdir

function check_exist() {
    local departure=${from}"2"${to}
    local arrival=${to}"2"${from}
    local dir=$origin'-'$target

    for cur in $(ls ./bridges/$subdir'/'); do
        if [ $cur = $dir ]; then
            echo "\033[31mCreate Failed!\033[0m Bridge $origin <-> $target exist"
            exit 1
        fi
    done
}

function index_file() {
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

            export function $1$3(props: CrossChainComponentProps<${from}${to}Bridge, CrossToken<ChainConfig>, CrossToken<ChainConfig>>) {
                return <Bridge {...props} />;
            }
        " >>$2'/'$1$3'.tsx'
    fi
}

function init_model() {
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
            Bridge<${name}BridgeConfig, $2ChainConfig, $2ChainConfig>,
            CrossToken<$2ChainConfig>,
            CrossToken<$2ChainConfig>
        >;
    " >>$1'/bridge.ts'

    echo "
        export * from './bridge';
    " >>$1'/index.ts'
}

function init_config() {
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

function init_uitls() {
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

function update_supports() {
    local BRGS=$(sed -r 's/(.*);/\1/' ../shared/model/bridge/supports.ts)

    echo "
    $BRGS
    | '${origin}-${target}';
   " >'../shared/model/bridge/supports.ts'
}

function update_bridges_indexer() {
    echo "
        export { $1, $2 } from './$3';
    " >>'./bridges/index.ts'
}

function create_record() {
    echo "
        import type { GetServerSidePropsContext, NextPage } from 'next';
        import { useMemo } from 'react';
        import { RecordStatus } from 'shared/config/constant';
        import { HelixHistoryRecord } from 'shared/model';
        import { revertAccount } from 'shared/utils/helper/address';
        import { getBridge } from 'utils/bridge';
        import {
            getDirectionFromHelixRecord,
            getReceivedAmountFromHelixRecord,
            getSentAmountFromHelixRecord,
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
    local dvm_flag='DVM'
    local category_flag=''

    mkdir $path

    if [ "$category" != "cBridge" ]; then
        mkdir $path'/utils'
        init_uitls $path'/utils' $departure $arrival
    fi

    # if [ "$category" == "helixLpBridge" ]; then
    #     mkdir './pages/records/'$dir
    #     create_record './pages/records/'$dir 'helixLpBridge'
    #     category_flag='Ln'
    # fi

    # if [ "$category" == "l1tol2" ]; then
    #     mkdir './pages/records/'$dir
    #     create_record './pages/records/'$dir 'l1tol2'
    #     category_flag='L2'
    # fi

    if [ "$category" == "helix" ]; then
        mkdir './pages/records/'$dir
        create_record './pages/records/'$dir 'helix'
    fi

    if [ ! -d $path'/model' ]; then
        mkdir $path'/model'
    fi
    init_model $path'/model' $dvm_flag

    if [ ! -d $path'/config' ]; then
        mkdir $path'/config'
    fi
    init_config $path'/config' $departure $arrival

    component $departure $path $category_flag
    component $arrival $path $category_flag

    index_file $departure$category_flag $index
    index_file $arrival$category_flag $index

    update_bridges_indexer $departure$category_flag $arrival$category_flag $dir

    update_supports

    echo "\033[32mCreate success!\033[0m"
}

check_exist

init

../../node_modules/prettier/bin-prettier.js ./bridges/${subdir}/${origin}'-'${target}/**/*.{ts,tsx} --write
../../node_modules/prettier/bin-prettier.js ../shared/config/**/*.ts --write
../../node_modules/prettier/bin-prettier.js ../shared/model/**/*.ts --write
../../node_modules/prettier/bin-prettier.js ./utils/bridge/predicates.ts --write
cd ../../
yarn eslint
