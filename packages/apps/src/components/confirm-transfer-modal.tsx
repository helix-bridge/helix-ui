import Modal from "@/ui/modal";
import Image from "next/image";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmTransferModal({ isOpen, onClose, onCancel, onConfirm }: Props) {
  return (
    <Modal
      title="Confirm Transfer"
      isOpen={isOpen}
      className="w-full lg:w-[38rem]"
      okText="Confirm"
      onClose={onClose}
      onCancel={onCancel}
      onOk={onConfirm}
    >
      {/* from-to */}
      <div className="gap-small flex flex-col">
        <SourceTarget type="source" />
        <div className="relative">
          <div className="absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center">
            <Image width={36} height={36} alt="Transfer to" src="images/transfer-to.svg" className="shrink-0" />
          </div>
        </div>
        <SourceTarget type="target" />
      </div>

      {/* information */}
      <div className="gap-middle flex flex-col">
        <span className="text-sm font-normal text-white">Information</span>
        <Information />
      </div>
    </Modal>
  );
}

function SourceTarget({ type }: { type: "source" | "target" }) {
  return (
    <div className="bg-app-bg p-middle flex items-center justify-between rounded lg:p-5">
      {/* left */}
      <div className="gap-middle flex items-center">
        <Image
          width={36}
          height={36}
          alt="Chain"
          src="/images/network/ethereum.png"
          className="shrink-0 rounded-full"
        />
        <div className="flex flex-col items-start">
          <span className="text-base font-medium text-white">Ethereum</span>
          <span className="text-sm font-medium text-white/40">
            {type === "source" ? "Source Chain" : "Target Chain"}
          </span>
        </div>
      </div>

      {/* right */}
      <div className="flex flex-col items-end">
        <span className={`text-base font-medium ${type === "source" ? "text-app-red" : "text-app-green"}`}>
          {type === "source" ? "-100.234" : "+50.234"}
        </span>
        <span className="text-sm font-medium text-white">RING</span>
      </div>
    </div>
  );
}

function Information() {
  return (
    <div className="p-middle bg-app-bg gap-small flex flex-col rounded">
      <Item label="Bridge" value="Helix" />
      <Item label="From" value="0xe59261f6D4088BcD69985A3D369Ff14cC54EF1E5" />
      <Item label="To" value="0xe59261f6D4088BcD69985A3D369Ff14cC54EF1E5" />
      <Item label="Transaction Fee" value="50 RING" />
      <Item label="Estimated Arrival Time" value="50 Mins" />
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div className="gap-middle flex items-center justify-between text-sm font-medium text-white">
      <span>{label}</span>
      <span className="truncate">{value}</span>
    </div>
  );
}
