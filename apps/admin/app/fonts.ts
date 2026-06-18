import {
  Hanken_Grotesk,
  Source_Serif_4,
  Noto_Sans_Georgian,
  Noto_Serif_Georgian,
} from "next/font/google";

export const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-hanken",
  display: "swap",
});
export const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-source-serif",
  display: "swap",
});
export const notoSansGeorgian = Noto_Sans_Georgian({
  subsets: ["georgian"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-noto-sans-georgian",
  display: "swap",
});
export const notoSerifGeorgian = Noto_Serif_Georgian({
  subsets: ["georgian"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-serif-georgian",
  display: "swap",
});

export const fontVariables = [
  hanken.variable,
  sourceSerif.variable,
  notoSansGeorgian.variable,
  notoSerifGeorgian.variable,
].join(" ");
