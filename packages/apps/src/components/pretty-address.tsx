import CopyIcon from "@/ui/copy-icon";
import Tooltip from "@/ui/tooltip";
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
        <Tooltip content={<span className="text-xs font-normal text-white">{address}</span>}>
          <span className={className}>{toShortAdrress(address)}</span>
        </Tooltip>
      ) : (
        <>
          <Tooltip content={<span className="text-xs font-normal text-white">{address}</span>}>
            <span className={`lg:hidden ${className}`}>{toShortAdrress(address)}</span>
          </Tooltip>
          <span className={`hidden lg:inline ${className}`}>{address}</span>
        </>
      )}

      {copyable ? <CopyIcon text={address} /> : null}
    </div>
  );
}
