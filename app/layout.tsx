import type { Metadata, Viewport } from "next";
import "@fontsource/original-surfer/400.css"; // headings (single weight)
import "@fontsource-variable/manrope"; // body + numbers (variable 200–800, tabular figures)

import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jewel Calc — Item Pricing",
  description: "Item cost, selling price and MRP calculator for jewellery exporters.",
};

export const viewport: Viewport = {
  themeColor: "#f6f3ff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* suppressHydrationWarning: browser extensions (e.g. ColorZilla) inject attributes on <body>. Only affects this tag, not children. */}
      <body className="font-sans" suppressHydrationWarning>
        {children}
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  );
}
