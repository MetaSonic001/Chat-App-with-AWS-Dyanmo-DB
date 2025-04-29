
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Simple Chat App",
  description: "A simple chat application using Next.js and DynamoDB",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}