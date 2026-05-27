import * as React from "react";

// ============================================================
// 装飾用SVGコンポーネント
// ヒーローや背景に散りばめて、水彩風の柔らかい装飾を加える
// ============================================================

type DecorProps = React.SVGProps<SVGSVGElement> & {
  className?: string;
};

// 紫陽花風の小さな花クラスタ
export function HydrangeaCluster({ className, ...rest }: DecorProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={className}
      {...rest}
    >
      <g opacity="0.85">
        <Petal cx={40} cy={40} fill="#B8D9EA" />
        <Petal cx={62} cy={36} fill="#C9E4F0" />
        <Petal cx={80} cy={50} fill="#9CC6DC" />
        <Petal cx={50} cy={60} fill="#D6EBF5" />
        <Petal cx={70} cy={70} fill="#A8D4E5" />
        <Petal cx={35} cy={75} fill="#C9E4F0" />
        <Petal cx={88} cy={78} fill="#B8D9EA" />
        <Petal cx={55} cy={85} fill="#9CC6DC" />
      </g>
    </svg>
  );
}

function Petal({ cx, cy, fill }: { cx: number; cy: number; fill: string }) {
  // 4枚の花弁
  const r = 7;
  return (
    <g transform={`translate(${cx},${cy})`}>
      {[0, 90, 180, 270].map((deg) => (
        <ellipse
          key={deg}
          cx={r}
          cy={0}
          rx={r}
          ry={r * 0.7}
          fill={fill}
          transform={`rotate(${deg})`}
        />
      ))}
      <circle cx={0} cy={0} r={2} fill="#FFE38C" />
    </g>
  );
}

// 細長い葉
export function Leaf({ className, ...rest }: DecorProps) {
  return (
    <svg
      viewBox="0 0 80 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={className}
      {...rest}
    >
      <path
        d="M40 5 C 60 30, 70 80, 40 115 C 10 80, 20 30, 40 5 Z"
        fill="#B8DCD0"
        opacity="0.7"
      />
      <path
        d="M40 10 L 40 110"
        stroke="#9DC6BB"
        strokeWidth="1.2"
        opacity="0.7"
      />
    </svg>
  );
}

// 水滴
export function Droplet({ className, ...rest }: DecorProps) {
  return (
    <svg
      viewBox="0 0 24 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={className}
      {...rest}
    >
      <path
        d="M12 2 C 18 12, 22 18, 22 24 C 22 28, 17 31, 12 31 C 7 31, 2 28, 2 24 C 2 18, 6 12, 12 2 Z"
        fill="#C9E4F0"
        opacity="0.85"
      />
      <ellipse cx="9" cy="22" rx="2.5" ry="3.5" fill="#FFFFFF" opacity="0.6" />
    </svg>
  );
}

// やわらかいブロブ（背景の水彩風シミ）
export function SoftBlob({
  className,
  color = "#D6EBF5",
  ...rest
}: DecorProps & { color?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={className}
      {...rest}
    >
      <defs>
        <radialGradient id={`g-${color}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="100" rx="100" ry="90" fill={`url(#g-${color})`} />
    </svg>
  );
}

// 装飾用バッジ（特典あり、少人数制 など）
export function FeatureBadge({
  emoji,
  title,
  description,
  variant = "peach",
  className = "",
}: {
  emoji: string;
  title: string;
  description?: string;
  variant?: "peach" | "mint" | "blue";
  className?: string;
}) {
  const styles: Record<string, string> = {
    peach: "bg-accent-peach/80 text-accent",
    mint: "bg-mint-soft/80 text-mint",
    blue: "bg-brand-pale/90 text-brand-deep",
  };

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-full px-4 py-3 text-center shadow-card backdrop-blur ${styles[variant]} ${className}`}
    >
      <span className="text-xl leading-none">{emoji}</span>
      <span className="mt-1 text-[11px] font-bold leading-tight md:text-xs">
        {title}
      </span>
      {description && (
        <span className="text-[10px] leading-tight text-ink-mute md:text-[11px]">
          {description}
        </span>
      )}
    </div>
  );
}
