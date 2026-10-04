import type { Metadata } from "next";
import "./globals.css";
import { Noto_Sans, Playfair_Display } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toast";
import { Header } from "@/components/layout/AppHeader";
import { AppHeaderProvider } from "@/store/components/AppHeader";

const playfairDisplayHeading = Playfair_Display({ subsets: ["latin"], variable: "--font-heading" });

const notoSans = Noto_Sans({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: {
    default: "CWAD Image Resizer & Converter & Cloud Uploader",
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
      <AppHeaderProvider>
        <body>
          <Header />
          {children}
          <Toaster />
        </body>
      </AppHeaderProvider>
    </html>
  );
}
