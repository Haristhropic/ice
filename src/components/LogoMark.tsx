type LogoMarkProps = {
  size?: number;
  className?: string;
};

export function LogoMark({ size = 26, className }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M16 2.5 28.5 9.75v14.5L16 31.5 3.5 24.25V9.75L16 2.5Z" fill="currentColor" opacity="0.22" />
      <path d="M16 2.5 28.5 9.75 16 17 3.5 9.75 16 2.5Z" fill="currentColor" opacity="0.5" />
      <path d="M3.5 9.75 16 17v14.5L3.5 24.25V9.75Z" fill="currentColor" opacity="0.34" />
      <path
        d="M16 2.5 28.5 9.75v14.5L16 31.5 3.5 24.25V9.75L16 2.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        opacity="0.85"
      />
    </svg>
  );
}

export default LogoMark;
