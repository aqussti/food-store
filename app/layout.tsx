import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { StoreProvider } from '@/components/store-provider';
import { StoreShell } from '@/components/store-shell';
import "./store.css";

export const metadata: Metadata = {
  title: "Food Store",
  description: "Tu tienda de todos los días. Explorá Food Store y armá tu carrito.",
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#ff5b20' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body><StoreProvider><StoreShell>{children}</StoreShell></StoreProvider></body>
    </html>
  );
}
