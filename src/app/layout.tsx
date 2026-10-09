import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { ThemeProvider } from "./theme-provider";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "TripWise — plan real trips across India, on a real budget",
  description: "Day-by-day India itineraries from real places, your own checklist, honest expense tracking — no invented facts.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf7f0" },
    { media: "(prefers-color-scheme: dark)", color: "#14181f" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <Providers>
            <Nav />
            <main className="max-w-5xl mx-auto px-4 sm:px-6">{children}</main>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
