import { GetTransferConfigsRequest, GetTransferConfigsResponse } from './cBridge/ts-proto/gateway/gateway_pb';
import { WebClient } from './cBridge/ts-proto/gateway/GatewayServiceClientPb';

const request = new GetTransferConfigsRequest();
const client = new WebClient(`https://cbridge-v2-test.celer.network`, null, null);

export function getTransferConfigs() {
  client.getTransferConfigs(request, null).then((res: GetTransferConfigsResponse) => {
    console.log(
      '🚀 ~ file: test.ts ~ line 7 ~ client.getTransferConfigs ~ res',
      res.getChainTokenMap(),
      res.getChainsList(),
      res.toObject()
    );
  });
}
