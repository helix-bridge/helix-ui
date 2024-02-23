"use client";

import { useRef } from "react";

type Version = "v2" | "v3";

interface Props {
  value: Version;
  onChange: (value: Version) => void;
}

export default function VersionSwitch({ value, onChange }: Props) {
  const targetRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className="relative h-4 w-12 rounded-middle bg-component hover:cursor-pointer"
      ref={thumbRef}
      onClick={() => onChange(value === "v2" ? "v3" : "v2")}
    >
      <div
        className="absolute left-0 top-1/2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary transition-transform"
        ref={targetRef}
        style={{
          transform:
            value === "v3"
              ? "translate(0, -50%)"
              : `translate(${(thumbRef.current?.clientWidth ?? 0) - (targetRef.current?.clientWidth ?? 0)}px, -50%)`,
        }}
      >
        <span className="text-sm font-medium capitalize">{value}</span>
      </div>
    </div>
  );
}
