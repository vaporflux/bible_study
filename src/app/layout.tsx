import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bible Study Agent",
  description:
    "An AI-powered Bible study assistant grounded in Reformed theology, hermeneutics, and biblical archaeology.",
  openGraph: {
    title: "Bible Study Agent",
    description:
      "An AI-powered Bible study assistant grounded in Reformed theology, hermeneutics, and biblical archaeology.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-serif">{children}</body>
    </html>
  );
}
