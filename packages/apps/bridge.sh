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
            export function $1() {
                return <span>$1</span>;
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
        import { ContractConfig, BridgeConfig } from 'shared/model';

        type ${name}ContractConfig = ContractConfig;

        export type ${name}BridgeConfig = Required<BridgeConfig<${name}ContractConfig>>;
    " >>$1'/bridge.ts'

    echo "
        import { Bridge, CrossChainPayload, CrossToken, ChainConfig } from 'shared/model';
        import { ${name}BridgeConfig } from './bridge';

        export type IssuingPayload = CrossChainPayload<
            Bridge<${name}BridgeConfig>,
            CrossToken<ChainConfig>,
            CrossToken<ChainConfig>
        >;

        export type RedeemPayload = CrossChainPayload<
            Bridge<${name}BridgeConfig>,
            CrossToken<ChainConfig>,
            CrossToken<ChainConfig>
        >;
    " >>$1'/tx.ts'

    echo "
        export * from './bridge';
        export * from './tx';
    " >>$1'/index.ts'
}

function initConfig() {
    echo "
        import { ${origin}Config, ${target}Config } from 'shared/config/network';
        import { Bridge } from 'shared/model';
        import { ${from}${to}BridgeConfig } from '../model';

        const ${origin}${to}Config: ${from}${to}BridgeConfig = { 
            contracts: {
                backing: '',
                issuing: ''
            } 
        };

        export const ${origin}${to} = new Bridge(${origin}Config, ${target}Config, ${origin}${to}Config, {
            name: '${origin}-${target}',
            category: '${category}',
        });
    " >>$1'/bridge.ts'

    echo "
        export * from './bridge';
    " >>$1'/index.ts'
}

function initUitls() {
    echo "
        import { Observable, EMPTY } from 'rxjs';
        import { Tx } from 'shared/model';

        export function issue(): Observable<Tx> {
            return EMPTY;
        }

        export function redeem(): Observable<Tx> {
            return EMPTY;
        }
    " >>$1'/tx.ts'

    echo "
        import BN from 'bn.js';
        import { Bridge } from 'shared/model';


        export async function getRedeemFee(bridge: Bridge): Promise<BN | null> {
           console.log('Unfinished getRedeemFee for bridge', bridge);
           return  new BN(0); 
        }

        export async function getIssuingFee(bridge: Bridge): Promise<BN | null> {
           console.log('Unfinished getIssuing for bridge', bridge);
           return  new BN(0); 
        }
    " >>$1'/fee.ts'

    echo "
        export * from './tx';
        export * from './fee';
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
        initUitls $path'/utils'

        mkdir $path'/hooks'
        initHooks $path'/hooks'

        mkdir $path'/providers'
        indexEmpty $path'/providers'
    fi

    mkdir $path'/model'
    initModel $path'/model' $departure $arrival

    mkdir $path'/config'
    initConfig $path'/config' $departure $arrival

    component $departure $path
    component $arrival $path

    indexFile $departure $index
    indexFile $arrival $index

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
