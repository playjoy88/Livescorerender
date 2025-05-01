import type { Metadata } from "next";
import { Sarabun, Prompt } from "next/font/google";
import "./globals.css";

const sarabun = Sarabun({
  variable: "--font-sarabun",
  weight: ["300", "400", "500", "700"],
  subsets: ["thai", "latin"],
});

const prompt = Prompt({
  variable: "--font-prompt",
  weight: ["400", "600", "700"],
  subsets: ["thai", "latin"],
});

export const metadata: Metadata = {
  title: "Playjoy Livescore | ผลบอลสด อัพเดทแบบเรียลไทม์",
  description: "ติดตามผลบอลสด สถิติ วิเคราะห์การแข่งขัน ทำนายผลบอล และข่าวสารวงการฟุตบอลทั้งไทยและต่างประเทศ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body
        className={`${sarabun.variable} ${prompt.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
