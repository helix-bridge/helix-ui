interface Props {
  content: string;
  img: string;
  color: string;
  dataAos?: string;
  dataAosDelay?: number;
}

export default function SolverpageFeature({ content, img, color, dataAos, dataAosDelay }: Props) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-[40px] bg-[#010744] p-10 pb-[260px] lg:w-[374px]"
      style={{ boxShadow: "0px 4px 44px 0px #00000040" }}
      data-aos={dataAos}
      data-aos-delay={dataAosDelay}
    >
      <p className="text-[30px] font-semibold leading-[39px] text-white">{content}</p>

      <div className="p-medium absolute -bottom-[30px] -right-[30px] flex items-center justify-center">
        <div
          className="absolute left-0 top-0 h-full w-full rounded-full blur-[100px]"
          style={{ backgroundColor: color }}
        />
        <img src={img} alt="feature" width={210} height={210} className="z-10 h-[210px] w-[210px]" />
      </div>
    </div>
  );
}

// box-shadow: 0px 0px 196px 0px rgba(139, 82, 229, 1);
// background: linear-gradient(180deg, #5C00A3 0%, #8B52E5 100%);
