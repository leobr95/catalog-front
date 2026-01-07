import type { Metadata } from "next";
import "antd/dist/reset.css";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Catalog Front",
  description: "Next.js + Ant Design + Redux Toolkit (Prueba técnica)",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
