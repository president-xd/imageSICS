import type { Metadata } from 'next';
import './globals.css';
import { clsx } from 'clsx';

export const metadata: Metadata = {
    title: 'imageSICS',
    description: 'Advanced Image Forensics Suite',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={clsx("min-h-screen bg-background")}>
                {children}
            </body>
        </html>
    );
}
