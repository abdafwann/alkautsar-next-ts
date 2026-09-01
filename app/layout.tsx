import type { Metadata } from "next";
import { Inter, Playfair_Display, Alex_Brush } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import FooterClient from "@/components/layout/FooterClient";
import ToasterProvider from "@/components/ui/ToasterProvider";
import FloatingWhatsAppClient from "@/components/store/FloatingWhatsAppClient";
import { getStoreSettings } from '@/app/actions/settings';

const inter = Inter({
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["600", "700", "800"],
  style: ["normal", "italic"],
});

const alexBrush = Alex_Brush({
  subsets: ["latin"],
  variable: "--font-latin",
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "PT. AL-KAUTSAR PERKASA INDONESIA - Premium Herbal Remedies",
  description: "Premium Herbal Remedies for Your Wellness.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settingsResponse = await getStoreSettings();

  // Transform Prisma settings to FooterClient format
  const footerSettings = settingsResponse.success && settingsResponse.data ? {
    storeName: settingsResponse.data.storeName || 'PT. AL-KAUTSAR',
    description: settingsResponse.data.description || null,
    address: settingsResponse.data.address || null,
    email: settingsResponse.data.email || null,
    whatsapp: settingsResponse.data.whatsapp || null,
    logoUrl: settingsResponse.data.logoUrl || null,
    facebook: null,
    instagram: null,
    twitter: null,
    youtube: null,
  } : {
    storeName: 'PT. AL-KAUTSAR',
    description: null,
    address: null,
    email: null,
    whatsapp: null,
    facebook: null,
    instagram: null,
    twitter: null,
    youtube: null,
  };

  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning className={`${inter.className} ${playfair.variable} ${alexBrush.variable} min-h-screen flex flex-col bg-white text-gray-900`}>
        <Navbar storeSettings={settingsResponse.data} />
        <main className="flex-grow">
          {children}
        </main>
        <FooterClient settings={footerSettings} />
        <FloatingWhatsAppClient whatsappNumber={settingsResponse.data?.whatsapp} />
        <ToasterProvider />
      </body>
    </html>
  );
}
