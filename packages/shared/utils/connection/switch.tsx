import { Button, message, notification } from 'antd';
import { DebouncedFunc, throttle } from 'lodash';
import { Trans } from 'react-i18next';
import { Observable, Observer } from 'rxjs';
import Web3 from 'web3';
import { SHORT_DURATION } from '../../config/constant';
import { EthereumChainConfig, MetamaskError } from '../../model';
import { isNativeMetamaskChain } from '../network/network';

async function switchEthereumChain(chain: EthereumChainConfig): Promise<null> {
  const chainId = Web3.utils.toHex(+chain.ethereumChain.chainId);

  const res: null = await window.ethereum.request({
    method: 'wallet_switchEthereumChain',
    params: [{ chainId }],
  });

  return res;
}

/**
 * @description add chain in metamask
 */
async function addEthereumChain(chain: EthereumChainConfig): Promise<null> {
  // TODO check the chaiId field, store in decimal in configuration but may be required hexadecimal in metamask side.
  const chainId = Web3.utils.toHex(+chain.ethereumChain.chainId);

  const result = await window.ethereum.request({
    method: 'wallet_addEthereumChain',
    params: [{ ...chain.ethereumChain, chainId }],
  });

  return result;
}

export const switchMetamaskNetwork: DebouncedFunc<(chain: EthereumChainConfig) => Observable<null>> = throttle(
  (chain) => {
    const key = `key${Date.now()}`;

    return new Observable((observer: Observer<null>) => {
      return notification.error({
        message: <Trans>Incorrect network</Trans>,
        description: (
          <Trans
            i18nKey="Network mismatch, you can switch network manually in metamask or do it automatically by clicking the button below"
            tOptions={{ type: chain }}
          ></Trans>
        ),
        btn: (
          <Button
            type="primary"
            onClick={async () => {
              try {
                const isNative = isNativeMetamaskChain(chain);
                const action = isNative ? switchEthereumChain : addEthereumChain;
                const res = await action(chain);

                notification.close(key);
                observer.next(res);
              } catch (err: unknown) {
                message.error({
                  content: (
                    <span>
                      <Trans>Network switch failed, please switch it in the metamask plugin!</Trans>
                      <span className="ml-2">{(err as MetamaskError).message}</span>
                    </span>
                  ),
                  duration: 5,
                  type: 'error',
                });
              }
            }}
          >
            <Trans i18nKey="Switch to {{ network }}" tOptions={{ network: chain }}></Trans>
          </Button>
        ),
        key,
        onClose: () => {
          notification.close(key);
          observer.complete();
        },
        duration: null,
      });
    });
  },
  SHORT_DURATION
);
