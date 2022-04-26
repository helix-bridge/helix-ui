#!/bin/sh

function validate() {
    if [[ $1 =~ ^[a-zA-Z]+$ ]]; then
        echo "$1 is a valid name"
    else
        echo "Invalid name $1"
        exit 1
    fi
}

read -p "Pleash enter an target chain name: "

origin=$REPLY
validate $origin
from=$(echo ${origin:0:1} | tr a-z A-Z)${origin:1}

read -p "Pleash enter an origin chain name: "

target=$REPLY
validate $target
to=$(echo ${target:0:1} | tr a-z A-Z)${target:1}

function checkExist() {
    local departure=${from}"2"${to}
    local arrival=${to}"2"${from}
    local dir=$origin'-'$target

    for cur in $(ls ./src/bridges/); do
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
    echo "export {};" >>$1'/index.ts'
}

function initModel() {
    local name=${from}''${to}

    echo "
        import { ContractConfig, BridgeConfig, Api, ApiKeys } from '../../../model';

        interface ${name}ContractConfig extends ContractConfig { }

        export type $2BridgeConfig = Required<BridgeConfig<${name}ContractConfig, Api<ApiKeys>>>;
    " >>$1'/bridge.ts'

    echo "
        import { CommonPayloadKeys, DeepRequired } from '../../../model';
        import { CrossChainAsset, CrossChainParty, CrossChainPayload } from '../../../model/bridge';

        export type Issuing${from}TxPayload = CrossChainPayload<
            DeepRequired<$2Payload, ['sender' | 'assets' | 'recipient']>
        >;

        export type Redeem${from}TxPayload = CrossChainPayload<DeepRequired<$3Payload, [CommonPayloadKeys]>>;

        export interface $2Payload extends CrossChainParty, CrossChainAsset { }

        export interface $3Payload extends CrossChainParty, CrossChainAsset { }
    " >>$1'/cross-chain.ts'

    echo "
        export interface $2Record {}
        export interface $3Record {}
        export interface $2RecordRes {}
        export interface $3RecordRes {}
        export interface $2RecordsRes {}
        export interface $3RecordsRes {}
    " >>$1'/record.ts'

    echo "
        export * from './bridge';
        export * from './cross-chain';
        export * from './record';
    " >>$1'/index.ts'
}

function initConfig() {
    echo "
        import { ${origin}Config, ${target}Config } from '../../../config/network';
        import { Bridge } from '../../../model';
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
        import { Observable } from 'rxjs';
        import { Tx } from '../../../model';

        export function issuing(): Observable<Tx> {}

        export function redeem(): Observable<Tx> {}
    " >>$1'/tx.ts'

    echo "export * from './tx';" >>$1'/index.ts'
}

function initHooks() {
    echo "
        import { useCallback } from 'react';
        import { ChainConfig, RecordsHooksResult, RecordList } from '../../../model';

        export function useRecords(departure: ChainConfig, arrival: ChainConfig): RecordsHooksResult<RecordList<unknown>> {
            const fetchIssuingRecords = useCallback(() => { }, []);
            const fetchRedeemRecords = useCallback(() => { }, []);

            return {
                fetchRedeemRecords,
                fetchIssuingRecords,
            }
        }
    " >>$1'/records.ts'

    echo "export * from './records';" >>$1'/index.ts'
}

function init() {
    local departure=${from}"2"${to}
    local arrival=${to}"2"${from}

    local departureRecord=$departure'Record'
    local arrivalRecord=$arrival'Record'

    local dir=$origin'-'$target
    local path='./src/bridges/'$dir
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
    component $departureRecord $path
    component $arrivalRecord $path

    indexFile $departure $index
    indexFile $arrival $index
    indexFile $departureRecord $index
    indexFile $arrivalRecord $index

    echo "\033[32mCreate success!\033[0m"
}

checkExist

init

./node_modules/prettier/bin-prettier.js ./src/bridges/${origin}'-'${target}/**/*.{ts,tsx} --write
