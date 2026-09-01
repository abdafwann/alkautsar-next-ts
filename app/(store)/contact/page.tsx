import { getStoreSettings } from '@/app/actions/settings';
import ContactFormClient from './ContactFormClient';
import { Mail, MapPin, Phone } from 'lucide-react';

export const metadata = {
  title: 'Hubungi Kami | PT. AL-KAUTSAR',
  description: 'Hubungi tim PT. AL-KAUTSAR untuk pertanyaan produk herbal dan kemitraan.',
};

export default async function ContactPage() {
  const settingsResponse = await getStoreSettings();
  const storeData = settingsResponse.data;

  return (
    <div className="bg-gray-50 min-h-screen pt-12 lg:pt-14">
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-green-50 via-white to-green-50 overflow-hidden border-b border-gray-100">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary-green/5 rounded-full blur-[100px] -z-0" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-black mb-6 font-heading tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary-green to-green-700 animate-in fade-in slide-in-from-bottom-4 duration-700">
              Hubungi Kami
            </h1>
            <p className="text-lg text-gray-600 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both">
              Kami siap membantu Anda. Jangan ragu untuk menghubungi tim kami terkait produk, konsultasi, maupun peluang kemitraan bersama PT. AL-KAUTSAR.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
          
          {/* Left Column: Contact Info Minimalist */}
          <div className="lg:col-span-2 space-y-2 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both pt-4">
            
            <div className="mb-8">
              <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Mari Berbincang.</h3>
              <p className="text-gray-500">Pilih saluran komunikasi yang paling nyaman bagi Anda.</p>
            </div>

            {/* Email Minimalist */}
            <div className="group flex items-start gap-5 p-4 -ml-4 hover:bg-white/60 rounded-2xl transition-all duration-300">
              <div className="mt-1 text-gray-300 group-hover:text-primary-green transition-colors">
                <Mail size={22} strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-1">Email</h4>
                <a href={`mailto:${storeData?.email || 'admin@al-kautsar.com'}`} className="text-gray-900 text-lg font-medium hover:text-primary-green transition-colors">
                  {storeData?.email || 'admin@al-kautsar.com'}
                </a>
              </div>
            </div>

            {/* Phone/WA Minimalist */}
            <div className="group flex items-start gap-5 p-4 -ml-4 hover:bg-white/60 rounded-2xl transition-all duration-300">
              <div className="mt-1 text-gray-300 group-hover:text-primary-green transition-colors">
                <Phone size={22} strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-1">Telepon & WhatsApp</h4>
                <a href={`https://wa.me/${(storeData?.whatsapp || '628123456789').replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="text-gray-900 text-lg font-medium hover:text-primary-green transition-colors">
                  {storeData?.whatsapp || '+62 812 3456 789'}
                </a>
              </div>
            </div>

            {/* Address Minimalist */}
            <div className="group flex items-start gap-5 p-4 -ml-4 hover:bg-white/60 rounded-2xl transition-all duration-300">
              <div className="mt-1 text-gray-300 group-hover:text-primary-green transition-colors">
                <MapPin size={22} strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-1">Lokasi Kami</h4>
                <p className="text-gray-900 text-lg font-medium whitespace-pre-line">
                  {storeData?.address || 'Jl. Herbal Alami No. 123, Jakarta Selatan, 12345'}
                </p>
              </div>
            </div>
            
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-3 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500 fill-mode-both">
            <ContactFormClient />
          </div>

        </div>
      </div>
    </div>
  );
}
