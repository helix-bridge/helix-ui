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

options=("helix" "cBridge" "XCM")

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
    subdir="celer"
elif [ $category = "XCM" ]; then
    subdir="xcm"
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
    else
        echo "
            import { BN } from '@polkadot/util';
            import { useEffect } from 'react';
            import { useTranslation } from 'react-i18next';
            import { mergeMap } from 'rxjs/internal/operators/mergeMap';
            import { ChainConfig, CrossToken } from 'shared/model';
            import { toWei } from 'shared/utils/helper/balance';
            import { applyModalObs, createTxWorkflow } from 'shared/utils/tx';
            import { RecipientItem } from '../../../components/form-control/RecipientItem';
            import { TransferConfirm } from '../../../components/tx/TransferConfirm';
            import { TransferDone } from '../../../components/tx/TransferDone';
            import { CrossChainInfo } from '../../../components/widget/CrossChainInfo';
            import { useAfterTx } from '../../../hooks';
            import { CrossChainComponentProps } from '../../../model/component';
            import { TxObservableFactory } from '../../../model/tx';
            import { $3 } from './model';
            import { ${from}${to}Bridge } from './utils';

            export function $1({
                form,
                direction,
                bridge,
                onFeeChange,
                balances,
                setTxObservableFactory,
            }: CrossChainComponentProps<${from}${to}Bridge, CrossToken<ChainConfig>, CrossToken<ChainConfig>>) {
                const { t } = useTranslation();
                const { afterCrossChain } = useAfterTx<$3>();
                const [balance] = (balances ?? []) as BN[];

                useEffect(() => {
                    const fn = () => (data: $3) => {
                    const validateObs = data.bridge.validate([balance], {
                        balance,
                        amount: new BN(toWei(data.direction.from)),
                    });

                    return createTxWorkflow(
                        validateObs.pipe(mergeMap(() => applyModalObs({ content: <TransferConfirm value={data} fee={null} /> }))),
                        data.bridge.burn(data),
                        afterCrossChain(TransferDone, { payload: data })
                    );
                    };

                    setTxObservableFactory(fn as unknown as TxObservableFactory);
                }, [afterCrossChain, balance, setTxObservableFactory, t]);

                useEffect(() => {
                    if (onFeeChange) {
                    onFeeChange({
                        amount: 0,
                        symbol: direction.from.meta.tokens.find((item) => item.symbol === '?' )!.symbol,
                    });
                    }
                }, [direction.from.meta.tokens, onFeeChange]);

                return (
                    <>
                    <RecipientItem
                        form={form}
                        direction={direction}
                        bridge={bridge}
                        extraTip={t(
                        'Please make sure you have entered the correct {{type}} address. Entering wrong address will cause asset loss and cannot be recovered!',
                        { type: 'Substrate' }
                        )}
                    />

                    <CrossChainInfo bridge={bridge} fee={null} hideFee></CrossChainInfo>
                    </>
                );
            }
        " >>$2'/'$1'.tsx'
    fi
}

function indexEmpty() {
    echo "export default void 0;" >>$1'/index.ts'
}

function initModel() {
    local name=${from}''${to}

    echo "
        import { BridgeConfig } from 'shared/model';
        import { ContractConfig } from 'shared/model';
        import { CrossToken, ChainConfig } from 'shared/model';
        import { Bridge } from '../../../../core/bridge';
        import { CrossChainPayload } from '../../../../model/tx';

        type ${name}ContractConfig = ContractConfig;

        export type ${name}BridgeConfig = Required<BridgeConfig<${name}ContractConfig>>;

        export type IssuingPayload = CrossChainPayload<
            Bridge<${name}BridgeConfig, ChainConfig, ChainConfig>,
            CrossToken<ChainConfig>,
            CrossToken<ChainConfig>
        >;

        export type RedeemPayload = CrossChainPayload<
            Bridge<${name}BridgeConfig, ChainConfig, ChainConfig>,
            CrossToken<ChainConfig>,
            CrossToken<ChainConfig>
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
        import { BN } from '@polkadot/util';
        import { ChainConfig, Tx } from 'shared/model';
        import { EMPTY } from 'rxjs/internal/observable/empty';
        import type { Observable } from 'rxjs';
        import { IssuingPayload, RedeemPayload, ${name}BridgeConfig } from '../model';
        import { Bridge } from '../../../../core/bridge';
        import { TxValidation } from '../../../../model';

        export class ${name}Bridge extends Bridge<
            ${name}BridgeConfig,
            ChainConfig,
            ChainConfig
        > {
            static readonly alias: string = '${name}Bridge';

            back(payload: IssuingPayload, fee: BN): Observable<Tx> {
                console.log(payload, fee);
                return EMPTY;
            }

            burn(payload: RedeemPayload, fee: BN): Observable<Tx> {
                console.log(payload, fee);
                return EMPTY;
            }

            genTxParamsValidations(params: TxValidation): [boolean, string][] {
                console.log(params);
                return [];
            }
        }
    " >>$1'/bridge.ts'

    echo "
        export * from './bridge';
    " >>$1'/index.ts'
}

function initHooks() {
    echo "export default void 0;" >>$1'/index.ts'
}

function updateSupports() {
    local BRGS=$(sed -r 's/(.*);/\1/' ../shared/model/bridge/supports.ts)

    echo "
    $BRGS
    | '${origin}-${target}';
   " >'../shared/model/bridge/supports.ts'
}

function updatePredicateFns() {
    echo "
        export const is${departure} = predicate('${origin}', '${target}');
        export const is${arrival} = predicate('${target}', '${origin}');
        export const is${from}${to} = or(is${departure}, is${arrival});
    " >>'./utils/bridge/predicates.ts'
}

function updateBridgesIndexer() {
    echo "
        export { $1, $2 } from './$3';
    " >>'./bridges/index.ts'
}

function init() {
    local departure=${from}"2"${to}
    local arrival=${to}"2"${from}

    local dir=$subdir'/'$origin'-'$target
    local path='./bridges/'$dir
    local index=$path'/index.ts'

    mkdir $path

    if [ "$category" != "cBridge" ]; then
        mkdir $path'/config'

        mkdir $path'/utils'
        initUitls $path'/utils' $departure $arrival

        mkdir $path'/hooks'
        initHooks $path'/hooks'

        mkdir $path'/providers'
        indexEmpty $path'/providers'
    fi

    mkdir $path'/model'
    initModel $path'/model' $departure $arrival

    mkdir $path'/config'
    initConfig $path'/config' $departure $arrival

    component $departure $path 'IssuingPayload'
    component $arrival $path 'RedeemPayload'

    indexFile $departure $index
    indexFile $arrival $index

    updateBridgesIndexer $departure $arrival $dir

    updateSupports
    updatePredicateFns $departure $arrival

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
