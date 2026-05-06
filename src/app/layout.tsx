import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "@/components/ui/sonner";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider, theme } from "antd";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MulApps Hub",
  description: "AI-powered automation hub",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-slate-900">
        <AntdRegistry>
          <ConfigProvider
            theme={{
              algorithm: theme.defaultAlgorithm,
              token: {
                colorPrimary: "#2563eb",
                colorInfo: "#2563eb",
                colorSuccess: "#10b981",
                colorWarning: "#f59e0b",
                colorError: "#ef4444",
                colorBgBase: "#ffffff",
                colorBgLayout: "#f8fafc",
                colorBgContainer: "#ffffff",
                colorBgElevated: "#ffffff",
                colorBorder: "#e2e8f0",
                colorBorderSecondary: "#f1f5f9",
                borderRadius: 8,
                fontFamily: "var(--font-geist-sans)",
              },
              components: {
                Layout: {
                  bodyBg: "#f8fafc",
                  headerBg: "#ffffff",
                  siderBg: "#ffffff",
                  triggerBg: "#f1f5f9",
                },
                Menu: {
                  itemBg: "transparent",
                  subMenuItemBg: "transparent",
                  itemSelectedBg: "#eff6ff",
                  itemSelectedColor: "#2563eb",
                  itemHoverBg: "#f1f5f9",
                },
                Card: {
                  colorBgContainer: "#ffffff",
                },
              },
            }}
          >
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
