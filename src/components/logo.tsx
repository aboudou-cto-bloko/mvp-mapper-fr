type LogoProps = {
  size?: number;
  className?: string;
};

/** Logo MVP Mapper (identique à public/logo.svg), décoratif : le nom est en texte à côté. */
export function Logo({ size = 36, className }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <rect width="256" height="256" rx="64" fill="#0B6B4D" />
      <path
        d="M64 196V104l64 68 64-68v92"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="24"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="192" cy="56" r="18" fill="#DDF0E6" />
    </svg>
  );
}
