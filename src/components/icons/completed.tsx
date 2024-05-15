interface Props {
  width?: number;
  height?: number;
  fill?: string;
}

export default function Completed({ width = 32, height = 32, fill = "#52C41A" }: Props) {
  return (
    <svg
      viewBox="0 0 1024 1024"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      className="shrink-0"
    >
      <path
        d="M512 64a448 448 0 1 0 0 896A448 448 0 0 0 512 64z m265.6 271.744L514.944 691.84a52.16 52.16 0 0 1-41.856 21.12H472.96a52.16 52.16 0 0 1-41.92-21.312L275.84 478.72a8 8 0 0 1 6.4-12.736h69.376c2.56 0 4.928 1.28 6.4 3.328l115.2 157.824 221.952-300.864a8 8 0 0 1 6.4-3.264h69.632a8 8 0 0 1 6.4 12.8z"
        fill={fill}
      />
    </svg>
  );
}
