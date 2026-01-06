/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{ts,tsx}"],
    prefix: "ui-",
    theme: {
        extend: {
            colors: {
                background: "#FDFBF7", // Creamy off-white
                foreground: "#2D2A26", // Warm charcoal
                primary: {
                    DEFAULT: "#E88D72", // Soft Coral
                    foreground: "#FFFFFF",
                    hover: "#D67C61",
                },
                secondary: {
                    DEFAULT: "#8FB3B0", // Muted Teal
                    foreground: "#FFFFFF",
                    hover: "#7A9E9B",
                },
                muted: {
                    DEFAULT: "#F2EFE9", // Warm light gray
                    foreground: "#75706B",
                },
                card: {
                    DEFAULT: "#FFFFFF",
                    foreground: "#2D2A26",
                },
            },
            borderRadius: {
                lg: "1rem",
                xl: "1.5rem",
                "2xl": "2rem",
                "3xl": "3rem",
            },
            fontFamily: {
                sans: ["var(--font-sans)", "sans-serif"],
            },
        },
    },
    plugins: [],
}
