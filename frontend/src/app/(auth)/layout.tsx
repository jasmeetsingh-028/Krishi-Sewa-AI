import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KrishiSewa – Authentication",
  description: "Sign in or create your agricultural assistant account",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
