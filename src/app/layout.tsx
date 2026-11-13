import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Favour Michael",
  description:
    "Favour Michael is a software engineer in Kigali, Rwanda, who builds and ships AI-powered products for African users.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
