import type { Config } from "tailwindcss";

/**
 * كل القيم هنا تشير إلى متغيرات CSS مولَّدة من design-system/tokens.json
 * عبر scripts/build-tokens.mjs — لا تُكتب قيم hex أو مقاسات أو مدد حركة يدوياً في هذا الملف.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: "var(--brand)",
        "brand-hover": "var(--brand-hover)",
        "brand-2": "var(--brand-2)",
        "on-brand": "var(--on-brand)",
        surface: "var(--surface)",
        "surface-raised": "var(--surface-raised)",
        "surface-overlay": "var(--surface-overlay)",
        "surface-sunken": "var(--surface-sunken)",
        border: "var(--border)",
        "border-focus": "var(--border-focus)",
        hairline: "var(--hairline)",
        glass: "var(--glass-border)",
        ink: "var(--ink)",
        "ink-muted": "var(--ink-muted)",
        "ink-subtle": "var(--ink-subtle)",
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
        "display-xl": ["56px", { lineHeight: "66px", fontWeight: "700" }],
        "display-lg": ["40px", { lineHeight: "52px", fontWeight: "700" }],
        "display-sm": ["30px", { lineHeight: "40px", fontWeight: "700" }],
        h1: ["24px", { lineHeight: "32px", fontWeight: "700" }],
        h2: ["20px", { lineHeight: "28px", fontWeight: "700" }],
        h3: ["16px", { lineHeight: "24px", fontWeight: "600" }],
        "body-lg": ["17px", { lineHeight: "30px" }],
        body: ["15px", { lineHeight: "26px" }],
        "body-sm": ["13px", { lineHeight: "21px" }],
        caption: ["12px", { lineHeight: "16px", fontWeight: "500" }],
        code: ["13px", { lineHeight: "20px" }],
        /* الأرقام الكبيرة — تُستخدم مع font-mono دائماً */
        "metric-xl": ["60px", { lineHeight: "62px", fontWeight: "500" }],
        metric: ["40px", { lineHeight: "44px", fontWeight: "500" }],
        "metric-sm": ["28px", { lineHeight: "32px", fontWeight: "500" }]
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
        card: "var(--shadow-card)",
        hover: "var(--shadow-hover)",
        glow: "var(--shadow-glow)",
        none: "none"
      },
      backdropBlur: {
        glass: "var(--glass-blur)"
      },
      backgroundImage: {
        "gradient-brand": "var(--gradient-brand)",
        "gradient-mesh": "var(--gradient-mesh)",
        "gradient-panel": "var(--gradient-panel)",
        "gradient-hero": "var(--gradient-hero)",
        "edge-top": "var(--edge-top)",
        "rule-brand": "var(--rule-brand)",
        sheen: "var(--sheen)"
      },
      zIndex: {
        sticky: "10",
        dropdown: "20",
        overlay: "30",
        modal: "40",
        toast: "50"
      },
      /* مدد الحركة ومنحنياتها — نفس أسماء tokens.json حرفياً */
      transitionDuration: {
        1: "var(--dur-1)",
        2: "var(--dur-2)",
        3: "var(--dur-3)",
        4: "var(--dur-4)",
        5: "var(--dur-5)"
      },
      transitionTimingFunction: {
        out: "var(--ease-out)",
        inout: "var(--ease-in-out)",
        spring: "var(--ease-spring)",
        smooth: "var(--ease-smooth)"
      },
      keyframes: {
        "motif-spin": { to: { transform: "rotate(360deg)" } },
        "toast-in": {
          from: { opacity: "0", transform: "translateY(-12px) scale(0.97)" },
          to: { opacity: "1", transform: "none" }
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "none" }
        },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "none" }
        },
        /* الانزلاق من الحافة المنطقية: موجب = من جهة البداية في RTL */
        "slide-start": {
          from: { opacity: "0", transform: "translateX(12px)" },
          to: { opacity: "1", transform: "none" }
        },
        sheen: {
          from: { transform: "translateX(120%)" },
          to: { transform: "translateX(-120%)" }
        },
        shimmer: {
          from: { backgroundPosition: "200% 0" },
          to: { backgroundPosition: "-200% 0" }
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.85)", opacity: "0.7" },
          "70%": { transform: "scale(1.9)", opacity: "0" },
          "100%": { transform: "scale(1.9)", opacity: "0" }
        },
        "bar-grow": { from: { transform: "scaleX(0)" }, to: { transform: "scaleX(1)" } },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" }
        },
        "gradient-pan": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" }
        },
        "draw-ring": { from: { strokeDashoffset: "var(--ring-circumference)" } },
        "caret-blink": { "0%, 100%": { opacity: "1" }, "50%": { opacity: "0" } }
      },
      animation: {
        "motif-spin": "motif-spin 2.2s linear infinite",
        "toast-in": "toast-in var(--dur-4) var(--ease-spring)",
        "fade-up": "fade-up var(--dur-4) var(--ease-out) both",
        "fade-in": "fade-in var(--dur-3) var(--ease-out) both",
        "scale-in": "scale-in var(--dur-3) var(--ease-out) both",
        "slide-start": "slide-start var(--dur-3) var(--ease-out) both",
        sheen: "sheen 900ms var(--ease-smooth)",
        shimmer: "shimmer 1.6s linear infinite",
        "pulse-ring": "pulse-ring 2.4s var(--ease-smooth) infinite",
        "bar-grow": "bar-grow var(--dur-5) var(--ease-out) both",
        float: "float 6s ease-in-out infinite",
        "gradient-pan": "gradient-pan 8s ease-in-out infinite",
        "draw-ring": "draw-ring var(--dur-5) var(--ease-out) both",
        "caret-blink": "caret-blink 1.1s steps(1) infinite"
      }
    }
  },
  plugins: []
};

export default config;
