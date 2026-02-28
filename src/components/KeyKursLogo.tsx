interface KeyKursLogoProps {
  size?: number;
  color?: string;
}

export default function KeyKursLogo({ size = 32, color = '#14b8a6' }: KeyKursLogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill={color} fillOpacity="0.1" />
      <path
        d="M30 30 L30 70 M30 50 L55 30 M30 50 L55 70"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="70" cy="35" r="5" fill={color} />
      <circle cx="70" cy="65" r="5" fill={color} />
    </svg>
  );
}
