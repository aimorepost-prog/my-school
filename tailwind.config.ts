import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // メインカラー：パウダーブルー（柔らかく、優しく）
        brand: {
          DEFAULT: "#A8D4E5",
          dark: "#5FA9C2",
          deep: "#3D8AA8",
          light: "#D6EBF5",
          pale: "#EDF6FB",
          bg: "#F8FBFD",
        },
        // 文字色：硬すぎない、やわらかネイビー
        ink: {
          DEFAULT: "#3A5675",
          soft: "#5C7A99",
          mute: "#92A8C0",
        },
        // 差し色：ピーチコーラル（特典バッジ、CTA装飾用）
        accent: {
          DEFAULT: "#F5A99E",
          soft: "#FCD7CE",
          peach: "#FFE4D9",
        },
        // 補助：ミント（CTAグラデーション用）
        mint: {
          DEFAULT: "#B8DCD0",
          soft: "#DCEDE6",
        },
      },
      fontFamily: {
        sans: [
          "Hiragino Maru Gothic ProN",
          "Hiragino Kaku Gothic ProN",
          "Hiragino Sans",
          "Noto Sans JP",
          "Yu Gothic",
          "Meiryo",
          "system-ui",
          "sans-serif",
        ],
        serif: [
          "Hiragino Mincho ProN",
          "Yu Mincho",
          "Noto Serif JP",
          "serif",
        ],
      },
      backgroundImage: {
        "hero-fade":
          "linear-gradient(180deg, #F8FBFD 0%, #EDF6FB 40%, #FFFFFF 100%)",
        "cta-gradient":
          "linear-gradient(135deg, #A8D4E5 0%, #C9E4F0 50%, #F5A99E 130%)",
        "cta-section-gradient":
          "linear-gradient(135deg, #3D8AA8 0%, #5FA9C2 45%, #D9786B 100%)",
        "cta-gradient-hover":
          "linear-gradient(135deg, #5FA9C2 0%, #A8D4E5 50%, #F5A99E 130%)",
        "soft-radial":
          "radial-gradient(circle at 30% 20%, #D6EBF5 0%, transparent 60%), radial-gradient(circle at 80% 70%, #FCD7CE 0%, transparent 60%)",
      },
      boxShadow: {
        soft: "0 12px 32px -10px rgba(95,169,194,0.30)",
        card: "0 6px 20px -6px rgba(95,169,194,0.18)",
        cta: "0 14px 30px -8px rgba(95,169,194,0.45), 0 6px 12px -4px rgba(245,169,158,0.30)",
        "cta-hover":
          "0 18px 40px -10px rgba(95,169,194,0.55), 0 8px 16px -4px rgba(245,169,158,0.40)",
      },
      borderRadius: {
        "4xl": "2rem",
        blob: "60% 40% 70% 30% / 50% 60% 40% 50%",
      },
    },
  },
  plugins: [],
};

export default config;
