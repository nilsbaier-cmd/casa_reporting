import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/authContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CASA Reporting Dashboard | SEM",
  description: "Staatssekretariat für Migration - INAD & Passagier-Datenanalyse zur Überwachung von Luftverkehrsunternehmen",
  keywords: ["SEM", "INAD", "Migration", "Luftverkehr", "Schweiz", "Sanktionen"],
  authors: [{ name: "Staatssekretariat für Migration SEM" }],
  robots: "noindex, nofollow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de-CH">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
