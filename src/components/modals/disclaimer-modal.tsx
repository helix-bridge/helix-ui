"use client";

import { useToggle } from "@/hooks/use-toggle";
import Button from "@/ui/button";
import dynamic from "next/dynamic";
import { useEffect } from "react";

const KEY = "disclaimer";
const Modal = dynamic(() => import("@/ui/modal"), { ssr: false });

export default function DisclaimerModal() {
  const { state: isOpen, setState: setIsOpen, setFalse: setIsOpenFalse } = useToggle(false);

  useEffect(() => {
    setIsOpen(!localStorage.getItem(KEY));
  }, [setIsOpen]);

  return (
    <Modal title="Disclaimer" className="w-full lg:w-[30rem]" isOpen={isOpen} onClose={setIsOpenFalse}>
      <div className="flex flex-col gap-medium">
        <Paragraph content="By using Helix, I agree to the following:" />
        <Paragraph content="I understand that Helix is a bridge aggregator and is only responsible for routing the transfer to the selected bridge. Helix does not hold any funds in custody at any point." />
        <Paragraph content="I understand that the fees shown in a route are estimations and may vary." />
        <Paragraph content="I understand that the bridging time shown in a route is an estimation. Helix has no control over the bridging time. The bridge or protocol being used may sometimes take more time than the estimated time." />
        <Paragraph content="I understand that the app is in Beta and all risks associated with using it." />
        <Paragraph content="I am lawfully permitted to access this site and use Helix under the laws of the jurisdiction in which I reside and am located." />
      </div>

      <div />

      <Button
        className="mx-auto w-fit rounded-medium px-large py-small"
        kind="primary"
        onClick={() => {
          setIsOpenFalse();
          localStorage.setItem(KEY, "agree");
        }}
      >
        <span className="text-sm font-semibold text-white">Agree and Continue</span>
      </Button>
    </Modal>
  );
}

function Paragraph({ content }: { content: string }) {
  return <p className="text-sm font-medium text-white">{content}</p>;
}
