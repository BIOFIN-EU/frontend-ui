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
      <body>
        <Providers>
          <ApiErrorBridge />
          <div className="appShell">
            <header className="header">
              <div className="headerInner">

                {/* LEFT GROUP */}
                <div className="headerLeft">

                  <Link href="/" className="brand">
                    <Image
                      src="/biofin_logo.png"
                      alt="BIOFIN Logo"
                      width={40}
                      height={40}
                      className="logo"
                    />

                    <div className="brandText">
                      <div className="brandTitle">BioFIN Dashboard</div>
                    </div>
                  </Link>

                  <nav className="nav">
                    <Link href="/" className="navLink">Home</Link>
                    <Link href="/risk-model" className="navLink">Risk Model</Link>
                    <Link href="/about" className="navLink">About</Link>
                    <Link href="/support" className="navLink">Support</Link>
                    <Link href="/workflow" className="navLink">Workflow</Link>
                  </nav>

                </div>

              {/* RIGHT GROUP: auth area (keeps dropdown + hides login/signup when authed) */}
              <div className="headerRight">
                <HeaderAuthClient />
              </div>

              </div>
            </header>
            <main className="main">
            <div className="container">
              {children}
            </div>
            </main>

            <footer className="footer">
              <div className="container footerInner">
                <p className="footerText">
                  Funded by the European Union. Views and opinions expressed are
                  however those of the author(s) only and do not necessarily
                  reflect those of the European Union or the European Research
                  Executive Agency (REA).
                </p>
                <div className="footerMeta">
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