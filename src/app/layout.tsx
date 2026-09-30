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
import ThemeToggle, { themeInitScript } from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "BIOFIN-EU Dashboard",
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
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen bg-canvas font-sans text-fg antialiased">
        <Providers>
          <ApiErrorBridge />

          <div className="relative flex min-h-screen flex-col overflow-x-clip bg-app">
            {/* Background glow */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-0 bg-app-glow" />
            </div>

            {/* HEADER */}
            {/* Sticky: stays at the top while the page scrolls. Works because the
                wrapper uses overflow-x-clip, which (unlike overflow-hidden) does
                not create a scroll container. */}
            <header className="sticky top-0 z-20 border-b border-fg/10 bg-header/80 backdrop-blur-xl">
              <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

                {/* LEFT GROUP */}
                  <div className="flex items-center gap-4">

                    <Link href="/" className="navLink">

                      <Image
                          src="/biofin-logo-final.png"
                          alt="BIOFIN-EU"
                          width={100}
                          height={50}
                          priority
                          className="h-11 w-auto object-contain"
                      />
                      </Link>


                    <div className="flex flex-col leading-tight">
                    </div>

                  <NavClient />
                </div>

                {/* RIGHT GROUP */}
                <div className="flex items-center gap-3">
                  <ThemeToggle />
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
            <footer className="relative z-10 border-t border-fg/10 bg-shade/20 backdrop-blur-md">
              <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 text-sm">
                <div className="flex items-start gap-4">
                  <Image
                    src="/eu-flag.svg"
                    alt="Flag of the European Union"
                    width={48}
                    height={32}
                    className="h-8 w-12 flex-none rounded-sm object-cover"
                  />
                  <p className="text-fg/70 leading-relaxed">
                    Funded by the European Union. Views and opinions expressed are
                    however those of the author(s) only and do not necessarily
                    reflect those of the European Union or the European Research
                    Executive Agency (REA).
                  </p>
                </div>

                <div className="text-fg/50">
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