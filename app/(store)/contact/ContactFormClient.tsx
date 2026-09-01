'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { createInquiry } from '@/app/actions/inquiries';

export default function ContactFormClient() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const toastId = toast.loading('Mengirim pesan...');

    const res = await createInquiry(formData);
    
    if (res.success) {
      toast.success('Pesan berhasil terkirim! Kami akan segera merespons.', { id: toastId });
      setFormData({ name: '', email: '', subject: '', message: '' }); // Reset form
    } else {
      toast.error(res.error || 'Gagal mengirim pesan', { id: toastId });
    }
    
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 relative">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-1">Kirim Pesan Langsung</h3>
        <p className="text-gray-500 text-sm">Kami akan membalas ke email Anda secepatnya.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
        <div>
          <label htmlFor="name" className="block text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-2">Nama Lengkap *</label>
          <input
            type="text"
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-0 py-3 border-b border-gray-200 focus:outline-none focus:border-primary-green transition-all bg-transparent text-gray-900 placeholder:text-gray-300"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-2">Alamat Email *</label>
          <input
            type="email"
            id="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-0 py-3 border-b border-gray-200 focus:outline-none focus:border-primary-green transition-all bg-transparent text-gray-900 placeholder:text-gray-300"
            placeholder="john@example.com"
          />
        </div>
      </div>

      <div className="relative z-10">
        <label htmlFor="subject" className="block text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-2">Subjek Pesan</label>
        <input
          type="text"
          id="subject"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          className="w-full px-0 py-3 border-b border-gray-200 focus:outline-none focus:border-primary-green transition-all bg-transparent text-gray-900 placeholder:text-gray-300"
          placeholder="Misal: Pertanyaan Produk Herbal"
        />
      </div>

      <div className="relative z-10">
        <label htmlFor="message" className="block text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-2">Isi Pesan *</label>
        <textarea
          id="message"
          required
          rows={5}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full px-0 py-3 border-b border-gray-200 focus:outline-none focus:border-primary-green transition-all bg-transparent text-gray-900 placeholder:text-gray-300 resize-none"
          placeholder="Tuliskan pertanyaan atau pesan Anda secara detail..."
        ></textarea>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full md:w-auto relative z-10 flex items-center justify-center gap-3 bg-gray-900 text-white font-medium py-3.5 px-8 rounded-full hover:bg-primary-green hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSubmitting ? (
            <span className="animate-pulse">Mengirim...</span>
          ) : (
            <>
              <span>Kirim Pesan</span>
              <Send size={16} />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
