'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface Category {
  id: string;
  name: string;
  description: string;
}

interface FeaturedCategoriesClientProps {
  categories: Category[];
}

export default function FeaturedCategoriesClient({ categories }: FeaturedCategoriesClientProps) {
  const dummyImages = [
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80',
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80',
    'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=800&q=80',
  ];

  return (
    <section className="py-16 md:py-24 bg-bg-light overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8">

        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-md"
          >
            <h2 className="text-3xl md:text-5xl font-heading font-extrabold text-text-main tracking-tight mb-4 flex items-center gap-4">
              <span className="w-8 h-[3px] bg-accent-brown rounded-full"></span>
              Kategori Unggulan
            </h2>
            <p className="text-gray-600">
              Jelajahi koleksi terbaik kami untuk mendukung gaya hidup sehat dan alami Anda setiap hari.
            </p>
          </motion.div>
        </div>

        {/* Asymmetric Bento Grid for 3 items */}
        {categories.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 h-auto md:h-[700px]">

            {/* Cell 1: Large Left Tile */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="md:col-span-7 relative rounded-[32px] overflow-hidden group h-[500px] md:h-full shadow-2xl"
            >
              <div className="absolute inset-0 bg-secondary-green/20 z-0">
                <Image
                  src={dummyImages[0]}
                  alt={categories[0].name}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 60vw"
                  className="object-cover mix-blend-multiply opacity-90 transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-dark-green/90 via-dark-green/30 to-transparent z-10 flex flex-col justify-end p-8 md:p-12">
                <h3 className="text-3xl md:text-4xl font-heading font-bold text-white mb-3">{categories[0].name}</h3>
                <p className="text-white/80 mb-6 max-w-sm">{categories[0].description}</p>
                <div>
                  <Link
                    href={`/shop?category=${categories[0].id}`}
                    className="inline-flex bg-primary-green text-white font-semibold px-8 py-3 rounded-full hover:bg-accent-brown transition-colors active:scale-[0.98]"
                  >
                    Eksplorasi
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Cell 2 & 3: Stacked Right Tiles */}
            <div className="md:col-span-5 flex flex-col gap-6 md:gap-8 h-full">

              {/* Cell 2: Top Right */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="flex-1 relative rounded-[32px] overflow-hidden group min-h-[320px] shadow-2xl"
              >
                <div className="absolute inset-0 bg-secondary-green/20 z-0">
                  <Image
                    src={dummyImages[1]}
                    alt={categories[1].name}
                    fill
                    sizes="(max-width: 768px) 100vw, 40vw"
                    className="object-cover mix-blend-multiply opacity-90 transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-dark-green/90 to-transparent z-10 flex flex-col justify-end p-6 md:p-8">
                  <h3 className="text-2xl font-heading font-bold text-white mb-2">{categories[1].name}</h3>
                  <p className="text-white/80 text-sm mb-4 line-clamp-2">{categories[1].description}</p>
                  <div>
                    <Link
                      href={`/shop?category=${categories[1].id}`}
                      className="inline-flex bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-accent-brown hover:border-accent-brown transition-all active:scale-[0.98]"
                    >
                      Beli
                    </Link>
                  </div>
                </div>
              </motion.div>

              {/* Cell 3: Bottom Right */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="flex-1 relative rounded-[32px] overflow-hidden group min-h-[320px] bg-dark-green"
              >
                <div className="absolute inset-0 bg-[#e4ecf0] z-0">
                  <Image
                    src={dummyImages[2]}
                    alt={categories[2].name}
                    fill
                    sizes="(max-width: 768px) 100vw, 40vw"
                    className="object-cover mix-blend-multiply opacity-80 transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-dark-green/90 to-transparent z-10 flex flex-col justify-end p-6 md:p-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{categories[2].name}</h3>
                  <p className="text-white/80 text-sm mb-4 line-clamp-2">{categories[2].description}</p>
                  <div>
                    <Link
                      href={`/shop?category=${categories[2].id}`}
                      className="inline-flex bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-accent-brown hover:border-accent-brown transition-all active:scale-[0.98]"
                    >
                      Beli
                    </Link>
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        )}
      </div>
    </section>
  );
}
