import type { Metadata } from "next";
import "./globals.css";
import { bricolage, jetbrainsMono } from "./fonts";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Agent Skills",
  description:
    "Write, keep and share SKILL.md files for your AI coding agents. Keep them private or publish them to a public gallery.",
  openGraph: {
    title: "Agent Skills",
    description: "Write, keep and share SKILL.md files for your AI coding agents.",
    type: "website",
  },
};

// Runs before first paint so a saved theme choice doesn't flash the wrong colors.
const themeScript = `try{var t=localStorage.getItem("skills-theme");if(t==="skillslight"||t==="skillsdark"){document.documentElement.setAttribute("data-theme",t)}}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // No fixed data-theme here: the theme comes from the saved choice,
    // or from the visitor's system setting on their first visit.
    <html
      lang="en"
      suppressHydrationWarning
      className={`${bricolage.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
