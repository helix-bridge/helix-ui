interface Props {
  width?: number;
  height?: number;
  fill?: string;
}

export default function Pending({ width = 32, height = 32, fill = "#FFFFFF" }: Props) {
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
        d="M511.9 183.4c-181.8 0-329.1 147.4-329.1 329.1 0 181.8 147.4 329.1 329.1 329.1 181.8 0 329.1-147.4 329.1-329.1 0-181.8-147.4-329.1-329.1-329.1z m120.2 428l-20.7 20.7c-8.6 8.6-22.4 8.6-31 0l-105-105v-176c0-12.1 9.8-21.9 21.9-21.9h29.3c12.1 0 21.9 9.8 21.9 21.9v145.8l83.5 83.5c8.6 8.5 8.6 22.4 0.1 31z"
        fill={fill}
      />
    </svg>
  );
}
