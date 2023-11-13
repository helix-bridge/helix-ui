import CopyIcon from "@/ui/copy-icon";
import Tooltip from "@/ui/tooltip";
import { toShortAdrress } from "@/utils/address";

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
        <Tooltip enabledSafePolygon content={address}>
          <span className={className}>{toShortAdrress(address)}</span>
        </Tooltip>
      ) : (
        <>
          <Tooltip enabledSafePolygon content={address} className={`lg:hidden ${className}`}>
            <span>{toShortAdrress(address)}</span>
          </Tooltip>
          <span className={`hidden lg:inline ${className}`}>{address}</span>
        </>
      )}

      {copyable ? <CopyIcon text={address} /> : null}
    </div>
  );
}
