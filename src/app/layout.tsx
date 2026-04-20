import type { Metadata } from "next";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "./globals.css";
import "ol/ol.css";

import { Inter } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import Providers from "./providers";
import ApiErrorBridge from "@/components/ApiErrorBridge";
import HeaderAuthClient from "@/components/HeaderAuthClient";
import NavClient from "@/components/NavClient";

export const metadata: Metadata = {
  title: "BIOFIN Dashboard",
  description: "Unlocking finance to protect and restore biodiversity",
};

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-main",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-[#06131a] font-sans text-white antialiased">
        <Providers>
          <ApiErrorBridge />

          <div className="relative flex min-h-screen flex-col overflow-x-clip bg-[linear-gradient(180deg,#07141b_0%,#081821_48%,#07141b_100%)]">
            {/* Background glow */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.10),transparent_24%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.10),transparent_22%),radial-gradient(circle_at_bottom,rgba(168,85,247,0.08),transparent_26%)]" />
            </div>

            {/* HEADER */}
            <header className="relative z-20 border-b border-white/10 bg-[#08151d]/80 backdrop-blur-xl">
              <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

                {/* LEFT GROUP */}
                <div className="flex items-center gap-8">
                  <Link
                    href="/"
                    className="flex items-center gap-3 transition-opacity duration-200 hover:opacity-90"
                  >
                    <Image
                      src="/biofin_logo.jpg"
                      alt="BIOFIN"
                      width={48}
                      height={48}
                      priority
                      className="h-9 w-auto object-contain"
                    />

                    <div className="flex flex-col leading-tight">
                      <span className="text-white font-semibold text-sm tracking-wide">
                        BioFIN Dashboard
                      </span>
                    </div>
                  </Link>

                  <NavClient />
                </div>

                {/* RIGHT GROUP */}
                <div className="flex items-center">
                  <HeaderAuthClient />
                </div>
              </div>
            </header>

            {/* MAIN */}
            <main className="relative z-10 flex-1">
              <div className="mx-auto max-w-7xl px-6 py-6">
                {children}
              </div>
            </main>

            {/* FOOTER */}
            <footer className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-md">
              <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 text-sm">
                <p className="text-white/70 leading-relaxed">
                  Funded by the European Union. Views and opinions expressed are
                  however those of the author(s) only and do not necessarily
                  reflect those of the European Union or the European Research
                  Executive Agency (REA).
                </p>

                <div className="text-white/50">
                  © {new Date().getFullYear()} ® BIOFIN-EU
                </div>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}