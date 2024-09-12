import Tooltip from "../../../ui/tooltip";
import { toShortAdrress } from "../../../utils";

interface Props {
  signers: string | null;
  heartbeatTimestamp: number | null;
}

export default function Status({ signers, heartbeatTimestamp }: Props) {
  const signersStatus = parseSigners(signers);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onlineSigners = signersStatus.filter(([_, isOnline]) => isOnline);
  const online = isOnline(heartbeatTimestamp);

  return signersStatus.length > 0 ? (
    <Tooltip
      content={
        <div className="flex flex-col items-start gap-2">
          <span className="text-xs font-semibold">{`Total: ${onlineSigners.length} / ${signersStatus.length}`}</span>
          {signersStatus.map(([address, isOnline]) => (
            <div key={address} className="flex items-center gap-2">
              <div className={`h-[8px] w-[8px] rounded-full ${isOnline ? "bg-app-green" : "bg-white/50"}`} />
              <span className="text-xs font-semibold">{toShortAdrress(address, 10, 8)}</span>
            </div>
          ))}
        </div>
      }
      className="mx-auto w-fit"
    >
      <div
        className={`h-[8px] w-[8px] rounded-full ${onlineSigners.length === signersStatus.length ? "bg-app-green" : onlineSigners.length > 0 ? "bg-app-orange" : "bg-white/50"}`}
      />
    </Tooltip>
  ) : (
    <Tooltip content={online ? "Online" : "Offline"} className="mx-auto w-fit">
      <div className={`h-[8px] w-[8px] rounded-full ${online ? "bg-app-green" : "bg-white/50"}`} />
    </Tooltip>
  );
}

function isOnline(heartbeat: number | null) {
  return Date.now() - (heartbeat ?? 0) * 1000 < 5 * 60 * 1000; // 5 Minutes
}

function parseSigners(signers: string | null) {
  return (
    signers?.split(",").reduce(
      (acc, cur) => {
        const [address, heartbeat] = cur.split("-");
        acc.push([address, isOnline(Number(heartbeat))]);
        return acc;
      },
      [] as [string, boolean][],
    ) || []
  );
}
