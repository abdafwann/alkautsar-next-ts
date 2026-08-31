'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo2,
  Redo2,
  Image as ImageIcon,
  Loader2,
  Code
} from 'lucide-react';
import { useRef, useState } from 'react';
import { uploadImage } from '@/app/actions/upload';
import toast from 'react-hot-toast';

const MenuBar = ({ editor }: { editor: any }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  if (!editor) {
    return null;
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar (JPG, PNG, atau WEBP)');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran gambar maksimal 2MB');
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading('Mengunggah gambar inline...');

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('folder', 'articles/inline');

      const res = await uploadImage(formDataUpload);

      if (res.success && res.data) {
        editor.chain().focus().setImage({ src: res.data.url }).run();
        toast.success('Gambar berhasil disisipkan ke artikel', { id: toastId });
      } else {
        toast.error(res.error || 'Gagal mengunggah gambar', { id: toastId });
      }
    } catch {
      toast.error('Terjadi kesalahan saat mengunggah gambar', { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const buttonClass = (isActive: boolean) =>
    `p-1.5 rounded-md text-xs transition-colors cursor-pointer inline-flex items-center justify-center ${
      isActive
        ? 'bg-gray-900 text-white font-semibold shadow-xs'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/70'
    }`;

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-gray-200/80 bg-gray-50/80 text-gray-700">
      {/* Format Teks */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={buttonClass(editor.isActive('bold'))}
        title="Tebal (Ctrl+B)"
      >
        <Bold size={14} />
      </button>
      
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={buttonClass(editor.isActive('italic'))}
        title="Miring (Ctrl+I)"
      >
        <Italic size={14} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={buttonClass(editor.isActive('strike'))}
        title="Coret"
      >
        <Strikethrough size={14} />
      </button>

      <div className="w-px h-4 bg-gray-300 mx-1 self-center" />

      {/* Headings */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={buttonClass(editor.isActive('heading', { level: 2 }))}
        title="Subjudul Besar (H2)"
      >
        <Heading2 size={14} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={buttonClass(editor.isActive('heading', { level: 3 }))}
        title="Subjudul Sedang (H3)"
      >
        <Heading3 size={14} />
      </button>

      <div className="w-px h-4 bg-gray-300 mx-1 self-center" />

      {/* Lists & Quote */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={buttonClass(editor.isActive('bulletList'))}
        title="Daftar Poin"
      >
        <List size={14} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={buttonClass(editor.isActive('orderedList'))}
        title="Daftar Nomor"
      >
        <ListOrdered size={14} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={buttonClass(editor.isActive('blockquote'))}
        title="Kutipan / Dalil"
      >
        <Quote size={14} />
      </button>

      <div className="w-px h-4 bg-gray-300 mx-1 self-center" />

      {/* Inline Image Upload */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="p-1.5 rounded-md text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-200/70 transition-colors disabled:opacity-50 cursor-pointer inline-flex items-center gap-1"
        title="Sisipkan Foto dalam Artikel"
      >
        {isUploading ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={14} />}
        <span className="text-[11px] font-medium hidden sm:inline">Sisip Foto</span>
      </button>
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/png, image/jpeg, image/webp" 
        onChange={handleImageUpload} 
      />

      <div className="w-px h-4 bg-gray-300 mx-1 self-center" />

      {/* Undo / Redo */}
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="p-1.5 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-200/70 transition-colors disabled:opacity-30 cursor-pointer"
        title="Undo"
      >
        <Undo2 size={14} />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="p-1.5 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-200/70 transition-colors disabled:opacity-30 cursor-pointer"
        title="Redo"
      >
        <Redo2 size={14} />
      </button>
    </div>
  );
};

export default function RichTextEditor({ 
  value, 
  onChange 
}: { 
  value: string; 
  onChange: (value: string) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-lg max-h-[480px] object-cover my-4 border border-gray-200',
        },
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose prose-slate max-w-none p-4 sm:p-5 min-h-[380px] focus:outline-none text-gray-800 text-sm leading-relaxed',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  return (
    <div className="border border-gray-200/80 rounded-xl overflow-hidden focus-within:border-gray-900 transition-colors bg-white shadow-xs">
      <MenuBar editor={editor} />
      <div className="bg-white">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
