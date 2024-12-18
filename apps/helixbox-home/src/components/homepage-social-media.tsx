const data: { label: string; link: string; icon: string; width: number; height: number }[] = [
  { label: "Github", link: "https://github.com/helix-bridge", icon: "images/social/github.svg", width: 18, height: 18 },
  { label: "X", link: "https://x.com/HelixboxLabs", icon: "images/social/x.svg", width: 16, height: 16 },
  {
    label: "Discord",
    link: "https://discord.gg/6XyyNGugdE",
    icon: "images/social/discord.svg",
    width: 21.79,
    height: 16,
  },
  { label: "Email", link: "mailto:hello@helix.box", icon: "images/social/email.svg", width: 19, height: 14 },
];

export default function HomepageSocialMedia({
  className,
  dataAos,
  dataAosDelay,
}: {
  className?: string;
  dataAos?: string;
  dataAosDelay?: number;
}) {
  return (
    <div className={`flex items-center ${className}`} data-aos={dataAos} data-aos-delay={dataAosDelay}>
      {data.map((item) => (
        <a
          key={item.label}
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-transform hover:-translate-y-1"
        >
          <img width={item.width} height={item.height} alt={item.label} src={item.icon} />
        </a>
      ))}
    </div>
  );
}
