import type { Config } from "tailwindcss";

/**
 * كل القيم هنا تشير إلى متغيرات CSS مولَّدة من design-system/tokens.json
 * عبر scripts/build-tokens.mjs — لا تُكتب قيم hex أو مقاسات يدوياً في هذا الملف.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: "var(--brand)",
        "brand-hover": "var(--brand-hover)",
        "on-brand": "var(--on-brand)",
        surface: "var(--surface)",
        "surface-raised": "var(--surface-raised)",
        "surface-overlay": "var(--surface-overlay)",
        border: "var(--border)",
        "border-focus": "var(--border-focus)",
        ink: "var(--ink)",
        "ink-muted": "var(--ink-muted)",
        success: "var(--success)",
        "on-success": "var(--on-success)",
        warning: "var(--warning)",
        "on-warning": "var(--on-warning)",
        danger: "var(--danger)",
        "on-danger": "var(--on-danger)",
        info: "var(--info)",
        "on-info": "var(--on-info)"
      },
      fontFamily: {
        display: "var(--font-display)",
        body: "var(--font-body)",
        mono: "var(--font-mono)"
      },
      fontSize: {
        "display-lg": ["36px", { lineHeight: "44px", fontWeight: "700" }],
        "display-sm": ["28px", { lineHeight: "36px", fontWeight: "700" }],
        h1: ["24px", { lineHeight: "32px", fontWeight: "700" }],
        h2: ["20px", { lineHeight: "28px", fontWeight: "700" }],
        h3: ["16px", { lineHeight: "24px", fontWeight: "600" }],
        "body-lg": ["16px", { lineHeight: "26px" }],
        body: ["15px", { lineHeight: "24px" }],
        "body-sm": ["13px", { lineHeight: "20px" }],
        caption: ["12px", { lineHeight: "16px", fontWeight: "500" }],
        code: ["13px", { lineHeight: "20px" }]
      },
      borderRadius: {
        none: "0",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        full: "var(--radius-full)"
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        none: "none"
      },
      zIndex: {
        sticky: "10",
        dropdown: "20",
        overlay: "30",
        modal: "40",
        toast: "50"
      },
      keyframes: {
        "motif-spin": { to: { transform: "rotate(360deg)" } },
        "toast-in": {
          from: { opacity: "0", transform: "translateY(-8px)" },
          to: { opacity: "1", transform: "none" }
        }
      },
      animation: {
        "motif-spin": "motif-spin 2.2s linear infinite",
        "toast-in": "toast-in 180ms ease-out"
      }
    }
  },
  plugins: []
};

export default config;
