import { Schibsted_Grotesk } from "next/font/google";

// Downloaded at build and served from this site, so visitors never request
// Google Fonts (no third-party requests on public pages).
export const schibsted = Schibsted_Grotesk({
  subsets: ["latin"],
  // Variable font: one file covers every weight the design uses (400 to 800).
  weight: "variable",
  display: "swap",
  variable: "--font-schibsted",
});
