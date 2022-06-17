#!/bin/sh

function validate() {
    if [[ $1 =~ ^[a-zA-Z]+$ ]]; then
        echo "$1 is a valid name"
    else
        echo "Invalid name $1"
        exit 1
    fi
}

read -p "Pleash enter an origin chain name: "

origin=$REPLY
validate $origin
from=$(echo ${origin:0:1} | tr a-z A-Z)${origin:1}

read -p "Pleash enter an target chain name: "

target=$REPLY
validate $target
to=$(echo ${target:0:1} | tr a-z A-Z)${target:1}

function checkExist() {
    local departure=${from}"2"${to}
    local arrival=${to}"2"${from}
    local dir=$origin'-'$target

    for cur in $(ls ./bridges/); do
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
    echo "
        export function $1() {
            return <span>$1</span>;
        }
    " >>$2'/'$1'.tsx'
}

function indexEmpty() {
    echo "export default void 0;" >>$1'/index.ts'
}

function initModel() {
    local name=${from}''${to}

    echo "
        import { ContractConfig, BridgeConfig } from 'shared/model';

        type ${name}ContractConfig = ContractConfig;

        export type $2BridgeConfig = Required<BridgeConfig<${name}ContractConfig>>;
    " >>$1'/bridge.ts'

    echo "
        import { Bridge, CrossChainPayload, CrossToken, ChainConfig } from 'shared/model';
        import { $2BridgeConfig } from './bridge';

        export type IssuingPayload = CrossChainPayload<
            Bridge<$2BridgeConfig>,
            CrossToken<ChainConfig>,
            CrossToken<ChainConfig>
        >;

        export type RedeemPayload = CrossChainPayload<
            Bridge<$2BridgeConfig>,
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
        // Move this file to shared package!
        import { ${origin}Config, ${target}Config } from 'shared/config/network';
        import { Bridge } from 'shared/model';
        import { ${from}${to}BridgeConfig } from '../model/bridge';

        const ${origin}${to}Config: ${from}${to}BridgeConfig = { 
            specVersion: 0, 
        };

        export const ${origin}${to} = new Bridge(${origin}Config, ${target}Config, ${origin}${to}Config, {});
    " >>$1'/bridge.ts'

    echo "export * from './bridge';" >>$1'/index.ts'
}

function initUitls() {
    echo "
        import { Observable, EMPTY } from 'rxjs';
        import { Tx } from 'shared/model';

        export function issuing(): Observable<Tx> {
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
           console.log('Unfinished getRedeemFee for birdge', bridge);
           return  new BN(0); 
        }

        export async function getIssuingFee(bridge: Bridge): Promise<BN | null> {
           console.log('Unfinished getIssuing for birdge', bridge);
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

function init() {
    local departure=${from}"2"${to}
    local arrival=${to}"2"${from}

    local dir=$origin'-'$target
    local path='./bridges/'$dir
    local index=$path'/index.ts'

    mkdir $path

    mkdir $path'/model'
    initModel $path'/model' $departure $arrival

    mkdir $path'/config'
    initConfig $path'/config' $departure $arrival

    mkdir $path'/utils'
    initUitls $path'/utils'

    mkdir $path'/hooks'
    initHooks $path'/hooks'

    mkdir $path'/providers'
    indexEmpty $path'/providers'

    component $departure $path
    component $arrival $path

    indexFile $departure $index
    indexFile $arrival $index

    echo "\033[32mCreate success!\033[0m"
}

checkExist

init

../../node_modules/prettier/bin-prettier.js ./bridges/${origin}'-'${target}/**/*.{ts,tsx} --write
