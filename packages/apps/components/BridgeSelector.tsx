import Image from 'next/image';

const TokenOnChain = ({ token, chain }: { token: string; chain: string }) => (
  <div className="relative w-14 h-14">
    <Image src={token} alt='...' layout='fill' />
    <span className="w-7 h-7 absolute top-auto bottom-1 left-auto -right-3">
      <Image  src={chain} alt='...' layout="fill" />
    </span>
  </div>
)

export function BridgeSelector() {
  return (
    <div className="dark:bg-antDark p-5 w-auto">
      <TokenOnChain token='/image/ring.svg' chain='/image/darwinia.png' />
      <TokenOnChain token='/image/ring.svg' chain='/image/ethereum.png' />
    </div>
  )
}
