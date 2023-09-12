import CopyIcon from "@/ui/copy-icon";
import { toShortAdrress } from "@/utils";

interface Props {
  address: string;
  copyable?: boolean;
  className?: string;
  forceShort?: boolean;
}

export default function PrettyAddress({ address, copyable, className, forceShort }: Props) {
  return (
    <div className="gap-small inline-flex items-center">
      {forceShort ? (
        <span className={className}>{toShortAdrress(address)}</span>
      ) : (
        <>
          <span className={`lg:hidden ${className}`}>{toShortAdrress(address)}</span>
          <span className={`hidden lg:inline`}>{address}</span>
        </>
      )}

      {copyable ? <CopyIcon text={address} /> : null}
    </div>
  );
}
