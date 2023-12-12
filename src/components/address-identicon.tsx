import Jazzicon, { jsNumberForAddress } from "react-jazzicon";

interface Props {
  diameter: number;
  address: string;
}

export default function AddressIdenticon({ diameter, address }: Props) {
  return <Jazzicon diameter={diameter} seed={jsNumberForAddress(address)} />;
}
