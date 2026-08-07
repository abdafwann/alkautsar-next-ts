'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Edit2, Trash2, MoreVertical, Tag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { deleteProduct } from '@/app/actions/catalog';
import { toast } from 'react-hot-toast';

export default function ProductList({ initialProducts }: { initialProducts: any[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState('');
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activePopover, setActivePopover] = useState<string | null>(null);

  const openDeleteModal = (product: any) => {
    setDeletingProduct(product);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;
    setIsLoading(true);
    
    try {
      const res = await deleteProduct(deletingProduct.id);
      if (res.success) {
        toast.success('Produk berhasil dihapus');
        setProducts(products.filter(p => p.id !== deletingProduct.id));
        setIsDeleteOpen(false);
      } else {
        toast.error(res.error || 'Gagal menghapus produk');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.category?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="mb-6">
        <Input 
          placeholder="Cari produk atau kategori..." 
          className="max-w-md" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth={false}
        />
      </div>

      <Table>
        <TableHeader>
          <TableHead>Produk</TableHead>
          <TableHead>Kategori</TableHead>
          <TableHead>Sediaan</TableHead>
          <TableHead>Harga</TableHead>
          <TableHead>Stok</TableHead>
          <TableHead className="text-right">Aksi</TableHead>
        </TableHeader>
        <TableBody>
          {filteredProducts.length === 0 ? (
            <TableRow>
              <TableCell className="text-center py-12 text-gray-500" colSpan={6}>
                Tidak ada produk yang ditemukan
              </TableCell>
            </TableRow>
          ) : (
            filteredProducts.map((product) => {
              const image = product.images?.[0]?.url || 'https://via.placeholder.com/80';
              const formattedPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(product.price);
              
              return (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                        <img src={image} alt={product.title} className="max-h-full object-contain" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{product.title}</p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                          {product.isPromo && (
                            <Badge variant="danger" className="text-[9px] py-0 px-1.5 uppercase tracking-wider">Promo</Badge>
                          )}
                          {/* New Release (created < 7 days ago) */}
                          {new Date(product.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000 && (
                            <Badge variant="success" className="text-[9px] py-0 px-1.5 uppercase tracking-wider">New</Badge>
                          )}
                          {/* Best Seller (dummy threshold > 20 sold for now) */}
                          {product.sold > 20 && (
                            <Badge variant="warning" className="text-[9px] py-0 px-1.5 uppercase tracking-wider">Best Seller</Badge>
                          )}
                          <span className="text-xs text-gray-400 ml-1 block">{product.slug}</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">{product.category?.name || 'Tanpa Kategori'}</Badge>
                  </TableCell>
                  <TableCell>
                    {product.productForm ? (
                      <Badge variant="info" className="text-[10px] py-0">{product.productForm}</Badge>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell className="font-semibold text-primary-green">
                    {formattedPrice}
                  </TableCell>
                  <TableCell>
                    {product.quantity > 10 ? (
                      <span className="text-gray-700">{product.quantity}</span>
                    ) : product.quantity > 0 ? (
                      <Badge variant="warning">{product.quantity} (Menipis)</Badge>
                    ) : (
                      <Badge variant="danger">Habis</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right relative">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setActivePopover(activePopover === product.id ? null : product.id)}
                      className="text-gray-500 hover:bg-gray-100 p-1"
                    >
                      <MoreVertical size={18} />
                    </Button>
                    
                    {activePopover === product.id && (
                      <>
                        {/* Invisible overlay to close popover when clicking outside */}
                        <div 
                          className="fixed inset-0 z-30"
                          onClick={() => setActivePopover(null)}
                        />
                        <div className="absolute right-6 top-10 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-40 py-2 animate-in fade-in zoom-in duration-200 origin-top-right">
                          <Link href={`/admin/products/form?id=${product.id}`}>
                            <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors group">
                              <Edit2 size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                              Edit Produk
                            </button>
                          </Link>
                          <Link href={`/admin/products/form?id=${product.id}#promo`}>
                            <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors group">
                              <Tag size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                              Tambah Diskon
                            </button>
                          </Link>
                          <div className="h-px bg-gray-100 my-1"></div>
                          <button 
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 flex items-center gap-3 transition-colors group"
                            onClick={() => {
                              setActivePopover(null);
                              openDeleteModal(product);
                            }}
                          >
                            <Trash2 size={16} className="text-gray-400 group-hover:text-red-500 transition-colors" />
                            Hapus Produk
                          </button>
                        </div>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Modal Hapus */}
      <Modal 
        isOpen={isDeleteOpen} 
        onClose={() => setIsDeleteOpen(false)} 
        title="Hapus Produk"
      >
        <div className="mt-2 text-gray-600">
          <p>Apakah Anda yakin ingin menghapus produk <strong>{deletingProduct?.title}</strong>?</p>
          <p className="text-sm text-red-500 mt-2">Tindakan ini permanen dan tidak dapat dikembalikan.</p>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>Batal</Button>
          <Button variant="danger" onClick={handleDelete} isLoading={isLoading}>Ya, Hapus</Button>
        </div>
      </Modal>
    </>
  );
}
