import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Open File Picker Dev Server",
  description: "Created with OpenInt",
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
