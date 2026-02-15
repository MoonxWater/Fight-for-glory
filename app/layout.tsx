import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Fight for Glory 2026 - MACET",
    description: "The premier athletic showcase of MACET.",
    icons: {
        icon: '/favicon.png',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
            </head>
            <body className="antialiased">
                {children}
            </body>
        </html>
    );
}
