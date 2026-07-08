import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/ToastProvider";

export const metadata: Metadata = {
  title: "Crown | Content Creator Platform",
  description: "The ultimate platform for content creators to manage, schedule, and analyze their digital presence.",
  icons: {
    icon: "/tiktok-app-icon.png",
    shortcut: "/tiktok-app-icon.png",
    apple: "/tiktok-app-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <body suppressHydrationWarning>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
