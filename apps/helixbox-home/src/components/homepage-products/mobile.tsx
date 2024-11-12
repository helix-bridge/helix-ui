import { Link } from "react-router-dom";

interface Props {
  title: string;
  description: string;
  link: string;
  video: string;
}

export default function Mobile({ title, description, link, video }: Props) {
  return (
    <div className="flex flex-col items-center gap-5" data-aos="fade-up">
      <video src={video} autoPlay muted loop playsInline />
      <h5 className="font-[KronaOne] text-[30px] font-normal leading-[37.5px] tracking-[1px] text-white">{title}</h5>
      <p className="p-5 text-center text-[16px] font-normal leading-[20.8px] text-white/80">{description}</p>
      {link.startsWith("http") ? (
        <a
          rel="noopener noreferrer"
          target="_blank"
          href={link}
          className="text-primary inline-flex h-[38px] w-[165px] items-center justify-center rounded-[10px] bg-white text-sm font-bold leading-[18.2px]"
        >
          Explore Now
        </a>
      ) : (
        <Link
          to={link}
          className="text-primary inline-flex h-[38px] w-[165px] items-center justify-center rounded-[10px] bg-white text-sm font-bold leading-[18.2px]"
        >
          Explore Now
        </Link>
      )}
    </div>
  );
}
