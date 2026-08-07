const { resolve } = require('path');
require('dotenv').config({ path: resolve(__dirname, '.env') });
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function test() {
  try {
    const cats = await prisma.category.findMany();
    
    // Simulate what catalog.ts does
    const data = {
      title: 'Dummy Product 2',
      slug: 'dummy-product-2',
      uses: 'test uses',
      price: "15000",
      categoryId: cats.length > 0 ? cats[0].id : '',
      productForm: 'Kapsul',
      composition: 'test comp',
      directions: 'test dir',
      warnings: 'test warn',
      certificate: 'test cert',
      quantity: "50",
      isPromo: false,
      promoPercentage: "",
      promoPrice: "",
      promoExpiry: "",
      images: []
    };
    
    const { title, slug, uses, price, categoryId, productForm, composition, directions, warnings, certificate, quantity, images, isPromo, promoPercentage, promoPrice, promoExpiry } = data;

    const payload = {
      title,
      slug,
      uses,
      price: parseFloat(price),
      categoryId,
      productForm,
      composition,
      directions,
      certificate,
      quantity: parseInt(quantity),
      isPromo: isPromo === true || isPromo === 'true',
      promoPercentage: promoPercentage ? parseFloat(promoPercentage) : null,
      promoPrice: promoPrice ? parseFloat(promoPrice) : null,
      promoExpiry: promoExpiry ? new Date(promoExpiry) : null,
    };

    console.log("Payload:", payload);
    const product = await prisma.product.create({
      data: {
        ...payload,
        images: {
          create: []
        }
      }
    });

    console.log("Created successfully:", product.id);
  } catch (err) {
    console.error("Save Product Error:", err);
  } finally {
    await prisma.$disconnect();
    pool.end();
  }
}

test();
