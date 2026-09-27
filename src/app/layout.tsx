import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "muse. — Dresses with feeling",
  description:
    "Meet your new favourite dress. Shop feel-good styles for every version of you and all the moments in between.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-US">
      <body>{children}</body>
    </html>
  );
}
