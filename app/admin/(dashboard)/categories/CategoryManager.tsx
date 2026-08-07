'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { createCategory, updateCategory, deleteCategory } from '@/app/actions/catalog';
import { toast } from 'react-hot-toast';

export default function CategoryManager({ initialCategories }: { initialCategories: any[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [deletingCategory, setDeletingCategory] = useState<any>(null);
  
  const [formData, setFormData] = useState({ name: '' });

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({ name: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (category: any) => {
    setEditingCategory(category);
    setFormData({ name: category.name });
    setIsModalOpen(true);
  };

  const openDeleteModal = (category: any) => {
    setDeletingCategory(category);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const form = new FormData();
    form.append('name', formData.name);

    try {
      if (editingCategory) {
        const res = await updateCategory(editingCategory.id, form);
        if (res.success) {
          toast.success('Kategori berhasil diperbarui');
          setCategories(categories.map(c => c.id === res.data.id ? { ...c, name: res.data.name } : c));
          setIsModalOpen(false);
        } else {
          toast.error(res.error || 'Gagal memperbarui');
        }
      } else {
        const res = await createCategory(form);
        if (res.success) {
          toast.success('Kategori berhasil ditambahkan');
          setCategories([...categories, { ...res.data, _count: { products: 0 } }]);
          setIsModalOpen(false);
        } else {
          toast.error(res.error || 'Gagal menambahkan');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;
    setIsLoading(true);
    
    try {
      const res = await deleteCategory(deletingCategory.id);
      if (res.success) {
        toast.success('Kategori berhasil dihapus');
        setCategories(categories.filter(c => c.id !== deletingCategory.id));
        setIsDeleteOpen(false);
      } else {
        toast.error(res.error || 'Gagal menghapus kategori');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <Input 
          placeholder="Cari kategori..." 
          className="max-w-xs" 
          fullWidth={false}
        />
        <Button onClick={openAddModal} leftIcon={<Plus size={18} />}>
          Tambah Kategori
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableHead>Nama Kategori</TableHead>
          <TableHead>Jumlah Produk</TableHead>
          <TableHead className="text-right">Aksi</TableHead>
        </TableHeader>
        <TableBody>
          {categories.length === 0 ? (
            <TableRow>
              <TableCell className="text-center py-8 text-gray-500">
                Belum ada kategori
              </TableCell>
            </TableRow>
          ) : (
            categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-semibold text-gray-900">{category.name}</TableCell>
                <TableCell>
                  <Badge variant="info">{category._count?.products || 0} Produk</Badge>
                </TableCell>
                <TableCell className="text-right flex justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => openEditModal(category)}
                    className="text-gray-500 hover:text-blue-600"
                  >
                    <Edit2 size={16} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => openDeleteModal(category)}
                    className="text-gray-500 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Modal Form Tambah/Edit */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-2">
          <Input 
            label="Nama Kategori"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Misal: Minyak Herbal"
            required
          />
          <div className="flex justify-end gap-3 mt-4">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" isLoading={isLoading}>
              {editingCategory ? 'Simpan Perubahan' : 'Tambahkan'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Hapus */}
      <Modal 
        isOpen={isDeleteOpen} 
        onClose={() => setIsDeleteOpen(false)} 
        title="Hapus Kategori"
      >
        <div className="mt-2 text-gray-600">
          <p>Apakah Anda yakin ingin menghapus kategori <strong>{deletingCategory?.name}</strong>?</p>
          <p className="text-sm text-red-500 mt-2">Tindakan ini tidak dapat dibatalkan dan akan gagal jika ada produk yang terikat ke kategori ini.</p>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>Batal</Button>
          <Button variant="danger" onClick={handleDelete} isLoading={isLoading}>Ya, Hapus</Button>
        </div>
      </Modal>
    </>
  );
}
