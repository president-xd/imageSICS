import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                border: "var(--border)",
                accent: "var(--accent)",
                "accent-hover": "var(--accent-hover)",
                "bg-panel": "var(--bg-panel)",
                "bg-card": "var(--bg-card)",
                "bg-input": "var(--bg-input)",
                "text-primary": "var(--text-primary)",
                "text-secondary": "var(--text-secondary)",
                "text-muted": "var(--text-muted)",
            },
        },
    },
    plugins: [],
};
export default config;
