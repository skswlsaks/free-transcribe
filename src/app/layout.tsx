import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConfigProvider } from "antd";
import { GoogleAnalytics } from "@next/third-parties/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Free Audio Transcription",
  description: "Free Audio Transcription for Everyone!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <link rel="icon" href="/icon.png" sizes="any" />
      <body className={inter.className}>
        <ConfigProvider
          theme={{
            components: {
              Button: {
                defaultHoverBg: "#CCC",
                defaultHoverBorderColor: "#FFFFFF",
                defaultHoverColor: "#FFFFFF"
              },
            },
          }}
        >
          {children}
        </ConfigProvider>
      </body>
      <GoogleAnalytics gaId="G-N3F3DSVMW0" />
    </html>
  );
}
