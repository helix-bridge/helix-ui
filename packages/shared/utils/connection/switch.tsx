import { Button, message, notification } from 'antd';
import { DebouncedFunc, throttle } from 'lodash';
import { Trans } from 'react-i18next';
import { Observable, Observer } from 'rxjs';
import Web3 from 'web3';
import { SHORT_DURATION } from '../../config/constant';
import { EthereumChainConfig, MetamaskError, Network } from '../../model';
import { findNetworkConfig, isNativeMetamaskChain } from '../network/network';

async function switchEthereumChain(network: Network): Promise<null> {
  const chain = findNetworkConfig(network) as EthereumChainConfig;
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
async function addEthereumChain(network: Network): Promise<null> {
  // TODO check the chaiId field, store in decimal in configuration but may be required hexadecimal in metamask side.
  const chain = findNetworkConfig(network) as EthereumChainConfig;
  const chainId = Web3.utils.toHex(+chain.ethereumChain.chainId);

  const result = await window.ethereum.request({
    method: 'wallet_addEthereumChain',
    params: [{ ...chain.ethereumChain, chainId }],
  });

  return result;
}

export const switchMetamaskNetwork: DebouncedFunc<(network: Network) => Observable<null>> = throttle((network) => {
  const key = `key${Date.now()}`;

  return new Observable((observer: Observer<null>) => {
    notification.error({
      message: <Trans>Incorrect network</Trans>,
      description: (
        <Trans
          i18nKey="Network mismatch, you can switch network manually in metamask or do it automatically by clicking the button below"
          tOptions={{ type: network }}
        ></Trans>
      ),
      btn: (
        <Button
          type="primary"
          onClick={async () => {
            try {
              const isNative = isNativeMetamaskChain(network);
              const action = isNative ? switchEthereumChain : addEthereumChain;
              const res = await action(network);

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
              });
            }
          }}
        >
          <Trans i18nKey="Switch to {{ network }}" tOptions={{ network }}></Trans>
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
}, SHORT_DURATION);
