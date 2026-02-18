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
    type: "website",
    siteName: "Bible Study Agent",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bible Study Agent",
    description:
      "An AI-powered Bible study assistant grounded in Reformed theology, hermeneutics, and biblical archaeology.",
  },
  other: {
    "apple-mobile-web-app-title": "Bible Study",
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
