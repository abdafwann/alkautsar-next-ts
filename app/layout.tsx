import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ToastContainer from "@/components/ui/ToastContainer";
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PT. AL-KAUTSAR PERKASA INDONESIA - Premium Herbal Remedies",
  description: "Premium Herbal Remedies for Your Wellness.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet" />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col bg-white text-gray-900`}>
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        <ToastContainer />
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
