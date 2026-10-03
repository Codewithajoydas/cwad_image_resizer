import type { Metadata } from "next";
import "./globals.css";
import { Noto_Sans, Playfair_Display } from "next/font/google";
import { cn } from "@/lib/utils";

const playfairDisplayHeading = Playfair_Display({subsets:['latin'],variable:'--font-heading'});

const notoSans = Noto_Sans({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: {
    default: "CWAD Next.js Monorepo",
    template: "%s | CWAD",
  },
  description: "Professional Next.js monorepo foundation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", notoSans.variable, playfairDisplayHeading.variable)}>
      <body>
        {children}
      </body>
    </html>
  );
}