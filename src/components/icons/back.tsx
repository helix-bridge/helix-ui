interface Props {
  width?: number;
  height?: number;
  fill?: string;
  className?: string;
  onClick?: () => void;
}

export default function Back({ width = 20, height = 20, fill = "#ffffff", className, onClick }: Props) {
  return (
    <svg
      viewBox="0 0 1024 1024"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      className={className}
      onClick={onClick}
    >
      <path
        d="M232.727273 0h558.545454a232.727273 232.727273 0 0 1 232.727273 232.727273v558.545454a232.727273 232.727273 0 0 1-232.727273 232.727273H232.727273a232.727273 232.727273 0 0 1-232.727273-232.727273V232.727273a232.727273 232.727273 0 0 1 232.727273-232.727273z m438.178909 711.819636L471.086545 512l199.819637-199.819636L605.090909 246.365091 339.456 512 605.090909 777.634909l65.815273-65.815273z"
        fill={fill}
      />
    </svg>
  );
}
