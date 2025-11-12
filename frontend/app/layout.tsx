import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Navbar from "@/app/components/Navbar"; // <-- add this

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Todo App",
  description: "A modern todo management application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/*
          Inline early script: some browser extensions (e.g. CRX launchers) inject
          attributes onto the <html> element (example: `crxlauncher=""`). That
          causes React hydration mismatch warnings because the server HTML
          doesn't contain those attributes. This tiny inline script removes any
          such extension-prefixed attributes from the root element before React
          hydrates. It's a defensive, low-risk dev-time fix to reduce noisy
          hydration errors coming from extensions.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
              try {
                const root = document && document.documentElement;
                if (!root || !root.attributes) return;
                // Remove a known attribute and any attributes that look like
                // extension-injected (start with 'crx' or 'ext-')
                const toRemove = [];
                for (let i = 0; i < root.attributes.length; i++) {
                  const name = root.attributes[i].name;
                  if (
                    name === 'crxlauncher' ||
                    name.startsWith('crx') ||
                    name.startsWith('ext-')
                  ) {
                    toRemove.push(name);
                  }
                }
                toRemove.forEach(n => root.removeAttribute(n));
              } catch (e) {
                // ignore safe-fail
              }
            })();`,
          }}
        />
        <Navbar />   {/* now visible on login/register/todos/etc. */}
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
