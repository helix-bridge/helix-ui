import { typeRegistryFactory } from './huge';

export async function encodeBlockHeader(blockHeaderStr: string) {
  const blockHeaderObj = JSON.parse(blockHeaderStr);
  const TypeRegistry = await typeRegistryFactory();
  const registry = new TypeRegistry();

  return registry.createType('Header', {
    parentHash: blockHeaderObj.parent_hash,
    // eslint-disable-next-line id-denylist
    number: blockHeaderObj.block_number,
    stateRoot: blockHeaderObj.state_root,
    extrinsicsRoot: blockHeaderObj.extrinsics_root,
    digest: {
      logs: blockHeaderObj.digest,
    },
  });
}
