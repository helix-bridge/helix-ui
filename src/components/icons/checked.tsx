interface Props {
  width?: number;
  height?: number;
  fill?: string;
}

export default function Checked({ width = 32, height = 32, fill = "#52C41A" }: Props) {
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
        d="M864.554667 268.501333a42.666667 42.666667 0 0 1 0 60.330667L412.032 781.397333a42.453333 42.453333 0 0 1-22.613333 11.818667l-5.034667 0.597333H379.306667a42.496 42.496 0 0 1-27.648-12.416l-211.2-211.2a42.666667 42.666667 0 1 1 60.330666-60.330666l180.992 180.992 422.4-422.4a42.666667 42.666667 0 0 1 60.330667 0z"
        fill={fill}
      />
    </svg>
  );
}
