import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "FreelanceAlert - Never Miss a Client Opportunity",
  description:
    "FreelanceAlert monitors freelance platforms and alerts you the moment a new job matching your keywords is posted. Be the first to apply and win more clients.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#0f172a] text-white">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
