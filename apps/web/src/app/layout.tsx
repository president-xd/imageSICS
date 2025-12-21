import type { Metadata } from "next";
import "./globals.css";
import "flexlayout-react/style/dark.css";

export const metadata: Metadata = {
    title: "imageSICS",
    description: "Advanced Image Foreman Tool",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="h-screen w-screen overflow-hidden bg-[var(--bg-app)] text-[var(--text-primary)]" suppressHydrationWarning>
                {children}
            </body>
        </html>
    );
}
