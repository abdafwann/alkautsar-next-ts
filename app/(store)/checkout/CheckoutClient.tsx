'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import Link from 'next/link';
import {
  CaretRight,
  CircleNotch,
  Tag,
  X,
  ShieldCheck,
  Package,
  Lock,
  ArrowLeft,
  Truck,
  Plant
} from '@phosphor-icons/react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { getProfile } from '@/app/actions/account';
import { validateCartStock, clearDbCart } from '@/app/actions/cart';
import { checkVoucher } from '@/app/actions/voucher';

const JAVA_PROVINCES = [
  'Banten',
  'DKI Jakarta',
  'Jawa Barat',
  'Jawa Tengah',
  'DI Yogyakarta',
  'Jawa Timur'
];

const OUTSIDE_JAVA_FEE = 30000;

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
}

export default function CheckoutClient() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const getTotalItems = useCartStore((s) => s.getTotalItems);
  const getTotalPrice = useCartStore((s) => s.getTotalPrice);
  const clearCart = useCartStore((s) => s.clearCart);

  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shippingFee, setShippingFee] = useState(0);

  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<{ id: string; code: string; discountAmount: number } | null>(null);
  const [isCheckingVoucher, setIsCheckingVoucher] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    province: '',
    city: '',
    postalCode: '',
    note: ''
  });

  const totalItems = getTotalItems();
  const subtotal = getTotalPrice();

  const normalItemsTotal = items
    .filter((item) => !item.originalPrice || item.originalPrice === item.price)
    .reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    setMounted(true);
    const cartStateItems = useCartStore.getState().items;
    if (cartStateItems.length === 0) {
      router.push('/cart');
      return;
    }

    // Verify stock availability immediately on checkout mount
    const verifyStockAndProfile = async () => {
      try {
        const stockCheck = await validateCartStock(cartStateItems.map(i => ({ id: i.id, quantity: i.quantity })));
        if (!stockCheck.isValid) {
          toast.error(stockCheck.errorMessage || 'Stok produk tidak mencukupi. Silakan periksa keranjang belanja Anda.');
          router.push('/cart');
          return;
        }

        const profile = await getProfile();
        if (profile.success && profile.data) {
          setFormData((prev) => ({
            ...prev,
            name: profile.data.name || '',
            email: profile.data.email || '',
            phone: profile.data.mobile || '',
            address: profile.data.address || '',
            province: profile.data.province || '',
            city: profile.data.city || '',
            postalCode: profile.data.postalCode || ''
          }));
        }
      } catch (error) {
        console.error('Gagal memverifikasi checkout:', error);
      }
    };

    verifyStockAndProfile();
  }, [router]);

  useEffect(() => {
    if (JAVA_PROVINCES.includes(formData.province)) {
      setShippingFee(0);
    } else if (formData.province) {
      setShippingFee(OUTSIDE_JAVA_FEE);
    } else {
      setShippingFee(0);
    }
  }, [formData.province]);

  const appliedVoucherCode = appliedVoucher?.code;
  useEffect(() => {
    if (!appliedVoucherCode) return;

    checkVoucher(appliedVoucherCode, subtotal, normalItemsTotal).then((res) => {
      if (res.success && res.data) {
        setAppliedVoucher((prev) => (prev?.discountAmount === res.data.discountAmount ? prev : res.data));
      } else {
        setAppliedVoucher(null);
        toast.error(res.error || 'Voucher tidak lagi valid untuk keranjang ini.');
      }
    });
  }, [subtotal, normalItemsTotal, appliedVoucherCode]);

  if (!mounted) return null;

  const discountAmount = appliedVoucher ? appliedVoucher.discountAmount : 0;
  const grandTotal = subtotal - discountAmount + shippingFee;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return;

    setIsCheckingVoucher(true);
    try {
      const res = await checkVoucher(voucherCode, subtotal, normalItemsTotal);
      if (res.success && res.data) {
        setAppliedVoucher(res.data);
        setVoucherCode('');
        toast.success(`Voucher ${res.data.code} berhasil dipasang!`);
      } else {
        toast.error(res.error || 'Kode voucher tidak valid');
      }
    } catch {
      toast.error('Gagal memverifikasi voucher');
    } finally {
      setIsCheckingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    toast.success('Voucher dilepas');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Mohon isi Nama Lengkap');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Mohon isi Alamat Email');
      return;
    }
    if (!formData.phone.trim()) {
      toast.error('Mohon isi Nomor WhatsApp');
      return;
    }
    if (!formData.address.trim()) {
      toast.error('Mohon isi Alamat Pengiriman');
      return;
    }
    if (!formData.province) {
      toast.error('Mohon pilih Provinsi Pengiriman');
      return;
    }
    if (!formData.city.trim()) {
      toast.error('Mohon isi Kota / Kabupaten');
      return;
    }
    if (!formData.postalCode.trim()) {
      toast.error('Mohon isi Kode Pos');
      return;
    }

    if (items.length === 0) {
      toast.error('Keranjang belanja kosong');
      return;
    }

    setIsLoading(true);
    console.log('[CHECKOUT SUBMIT] Mengirim data pesanan:', { formData, shippingFee, items });

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          shippingFee,
          voucherId: appliedVoucher?.id,
          voucherCode: appliedVoucher?.code,
          discountAmount: appliedVoucher?.discountAmount,
          items: items.map((item) => ({
            id: item.id,
            quantity: item.quantity
          }))
        })
      });

      const data = await response.json();
      console.log('[CHECKOUT RESPONSE]', { status: response.status, data });

      if (!response.ok) {
        throw new Error(data.error || 'Gagal memproses pesanan.');
      }

      /*
       * Mengosongkan keranjang lokal Zustand dan database akun member segera setelah pesanan terbit 
       * sehingga dropdown navbar dan keranjang belanja langsung bersih saat pembayaran diproses
       */
      clearCart();
      clearDbCart().catch(() => {});

      toast.success('Pesanan berhasil dibuat! Mengalihkan ke pembayaran...');
      router.push(`/payment/${data.orderId}`);
    } catch (error: any) {
      console.error('[CHECKOUT ERROR]', error);
      toast.error(error.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#fcfbf9] min-h-screen">
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 text-xs text-gray-500 flex items-center gap-2">
          <Link href="/" className="hover:text-primary-green transition-colors">Beranda</Link>
          <CaretRight size={13} className="text-gray-400" />
          <Link href="/cart" className="hover:text-primary-green transition-colors">Keranjang</Link>
          <CaretRight size={13} className="text-gray-400" />
          <span className="text-gray-900 font-medium">Checkout</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Title */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <div className="flex items-baseline gap-3">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
              Checkout Pesanan
            </h1>
            <span className="text-xs font-semibold text-gray-500">
              ({totalItems} produk)
            </span>
          </div>
          <Link
            href="/cart"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary-green hover:underline"
          >
            <ArrowLeft size={13} />
            <span>Kembali ke Keranjang</span>
          </Link>
        </div>

        {/* Unified Form */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column (7 cols): Customer & Shipping Info */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5 md:p-6 shadow-2xs space-y-6">
              
              {/* Section 1: Contact */}
              <div>
                <h2 className="text-sm font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                  <span>1. Informasi Pemesan</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <Input
                    label="Nama Lengkap *"
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    inputSize="sm"
                    placeholder="Nama lengkap penerima"
                  />
                  <Input
                    label="Alamat Email *"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    type="email"
                    inputSize="sm"
                    placeholder="email@contoh.com"
                  />
                </div>

                <div>
                  <Input
                    label="Nomor WhatsApp / Telepon *"
                    required
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    type="tel"
                    inputSize="sm"
                    placeholder="08123456789"
                    helperText="Digunakan untuk koordinasi kurir saat pengantaran paket."
                  />
                </div>
              </div>

              {/* Section 2: Address */}
              <div>
                <h2 className="text-sm font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                  <span>2. Alamat Pengiriman</span>
                </h2>

                <div className="space-y-4">
                  <Textarea
                    label="Alamat Lengkap *"
                    required
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    inputSize="sm"
                    placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan..."
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                      label="Provinsi *"
                      required
                      name="province"
                      value={formData.province}
                      onChange={handleChange}
                      inputSize="sm"
                    >
                      <option value="">Pilih Provinsi</option>
                      <option value="Banten">Banten</option>
                      <option value="DKI Jakarta">DKI Jakarta</option>
                      <option value="Jawa Barat">Jawa Barat</option>
                      <option value="Jawa Tengah">Jawa Tengah</option>
                      <option value="DI Yogyakarta">DI Yogyakarta</option>
                      <option value="Jawa Timur">Jawa Timur</option>
                      <option disabled>--- Luar Pulau Jawa ---</option>
                      <option value="Sumatera Utara">Sumatera Utara</option>
                      <option value="Sumatera Selatan">Sumatera Selatan</option>
                      <option value="Bali">Bali</option>
                      <option value="Kalimantan Timur">Kalimantan Timur</option>
                      <option value="Sulawesi Selatan">Sulawesi Selatan</option>
                      <option value="Lainnya">Lainnya...</option>
                    </Select>

                    <Input
                      label="Kota / Kabupaten *"
                      required
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      inputSize="sm"
                      placeholder="Contoh: Bandung"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Kode Pos *"
                      required
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      inputSize="sm"
                      placeholder="12345"
                    />

                    <Input
                      label="Catatan Pengiriman (Opsional)"
                      name="note"
                      value={formData.note}
                      onChange={handleChange}
                      inputSize="sm"
                      placeholder="Misal: Titipkan di pos satpam"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column (5 cols): Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs sticky top-24 space-y-4">
              <h3 className="font-bold text-gray-900 text-sm pb-3 border-b border-gray-100 flex items-center justify-between">
                <span>Ringkasan Pesanan</span>
                <span className="text-xs font-normal text-gray-500">{totalItems} Item</span>
              </h3>

              {/* Items List */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1 divide-y divide-gray-50">
                {items.map((item) => (
                  <div key={item.id} className="pt-2.5 first:pt-0 flex gap-3 items-center">
                    <div className="w-12 h-12 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center shrink-0 p-1">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          width={48}
                          height={48}
                          style={{ width: 'auto', height: 'auto' }}
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <Plant size={18} className="text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 line-clamp-1">{item.title}</p>
                      <p className="text-[11px] text-gray-500">{item.quantity} x {formatRupiah(item.price)}</p>
                    </div>
                    <span className="text-xs font-bold text-gray-900 shrink-0">
                      {formatRupiah(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Voucher Box */}
              <div className="pt-2 border-t border-gray-100">
                {!appliedVoucher ? (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
                      <input
                        type="text"
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                        placeholder="Kode Voucher..."
                        className="w-full pl-7 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium uppercase focus:outline-none focus:ring-2 focus:ring-primary-green/20 focus:border-primary-green transition-all"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleApplyVoucher}
                      disabled={isCheckingVoucher || !voucherCode.trim()}
                      isLoading={isCheckingVoucher}
                      className="px-3 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-semibold"
                    >
                      Pakai
                    </Button>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-100 p-2.5 rounded-lg flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <Tag size={13} className="text-primary-green" />
                      <span className="font-bold text-primary-green">{appliedVoucher.code}</span>
                      <span className="text-[11px] text-emerald-700">(-{formatRupiah(appliedVoucher.discountAmount)})</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveVoucher}
                      className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                      aria-label="Hapus voucher"
                    >
                      <X size={13} />
                    </button>
                  </div>
                )}
              </div>

              {/* Cost Calculations */}
              <div className="space-y-2 text-xs border-t border-gray-100 pt-3 text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal Produk</span>
                  <span className="font-semibold text-gray-900">{formatRupiah(subtotal)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    <Truck size={12} className="text-gray-400" />
                    Ongkos Kirim
                  </span>
                  <span className="font-semibold text-gray-900">
                    {formData.province === '' ? (
                      <span className="text-gray-400 text-[11px]">-</span>
                    ) : shippingFee === 0 ? (
                      <span className="text-primary-green font-bold bg-green-50 px-1.5 py-0.5 rounded text-[11px] border border-green-100">
                        Gratis (Jawa)
                      </span>
                    ) : (
                      formatRupiah(shippingFee)
                    )}
                  </span>
                </div>

                {appliedVoucher && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Diskon Voucher</span>
                    <span>-{formatRupiah(appliedVoucher.discountAmount)}</span>
                  </div>
                )}
              </div>

              {/* Grand Total */}
              <div className="border-t border-gray-100 pt-3 flex justify-between items-baseline">
                <div>
                  <span className="text-xs font-bold text-gray-900 block">Total Tagihan</span>
                  <span className="text-[10px] text-gray-400">Termasuk PPN & Administrasi</span>
                </div>
                <span className="text-lg font-black text-primary-green font-mono">
                  {formatRupiah(grandTotal)}
                </span>
              </div>

              {/* Submit CTA */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isLoading}
                isLoading={isLoading}
                leftIcon={<Lock size={13} />}
                className="w-full h-11 bg-primary-green hover:bg-primary-green-hover text-white font-bold rounded-lg text-xs shadow-2xs"
              >
                Lanjut ke Pembayaran
              </Button>

              {/* Trust Badges */}
              <div className="pt-2 border-t border-gray-100 space-y-1.5 text-[11px] text-gray-500">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-primary-green shrink-0" />
                  <span>Transaksi Aman Terenkripsi via Midtrans</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Package size={13} className="text-primary-green shrink-0" />
                  <span>Garansi 100% Herbal Alami Original</span>
                </div>
              </div>

            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
