import Image from 'next/image';
import Link from 'next/link';
import { Leaf, ShieldCheck, Truck } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';

export default function Home() {
    return (
        <>
            {/* BEGIN: Hero Section */}
            <section className="relative bg-gray-50 overflow-hidden py-20 lg:py-32 flex-grow">
                <div className="absolute inset-0 z-0">
                    <img
                        alt="Herbal Ingredients"
                        className="w-full h-full object-cover opacity-80"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJmeC2kbRfQdnKbAJtU1_GLnfOR_mKNbg1ed8vLKVUEUh2eibAnoAYpBhFuPVp-Mm98xHb8BWV3g69dRkrsPnMiTQ-b2BOWicPGOTdfIoX4vlzblQIq5EVR8XEs-V64XwIHi1J5eBUOqpKiwkpeJIK7hImM6_Ng5JbEL6ChvjiZdw-OSoCT4ZMHQTRgVIfQRDvhkjS02gpKnI7uV4ybday0-fpX4BTYKwYa-QlvEGEhs6wPpwI8aOs"
                    />
                </div>
                <div className="container mx-auto px-4 relative z-10 flex h-full items-center">
                    <div className="max-w-xl">
                        <h2 className="text-4xl md:text-5xl font-bold text-dark-green mb-6 leading-tight">Premium Herbal Remedies for Your Wellness.</h2>
                        <p className="text-lg text-dark-green/80 font-medium mb-8">Discover nature's finest, ethically sourced and certified ingredients.</p>
                        <Link className="bg-primary-green text-white font-semibold rounded-full transition-colors duration-300 hover:bg-primary-green-hover text-lg px-8 py-3 inline-block border-2 border-white ring-2 ring-accent-gold shadow-lg" href="/shop">Shop Now</Link>
                    </div>
                </div>
            </section>
            {/* END: Hero Section */}

            {/* BEGIN: Featured Collections */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-center mb-10 text-dark-green relative inline-block after:content-[''] after:absolute after:-bottom-2 after:left-1/2 after:-translate-x-1/2 after:w-10 after:h-0.5 after:bg-accent-gold">Featured Collections</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                        {/* Collection Card 1 */}
                        <div className="bg-white rounded-2xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden flex flex-col items-center p-6 text-center transition-transform hover:-translate-y-1">
                            <div className="bg-gray-100 rounded-xl mb-4 p-4 flex items-center justify-center w-full h-48">
                                <img alt="Digestive Health" className="max-h-full object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9FZ-PcvOIHvYT09N58mDLcLTAZ4x-JSmRmwgwo83b1GYtqNywPWo_drPigBJCJRCK1c3nNw8CwIXAMmAdEmsQYCXovLopGkjUmt7R5oagev0fopwbHvdNVMi9O9hK4tqm0PcvX_brZ6ZC9UiA7HXgbmzeBiKd7IzH2HSunmpNqjNtRiX6MMslTZBA928NYmpgUd-xBxyrl26ER9spYTnH-doxMtfatm8sVXNwUimhEiv08GHk9vtk" />
                            </div>
                            <h3 className="text-xl font-bold text-dark-green mb-2">Digestive Health</h3>
                            <p className="text-gray-600 mb-6">Support your gut naturally.</p>
                            <Link className="bg-primary-green text-white font-semibold px-6 py-2 rounded-full transition-colors duration-300 hover:bg-primary-green-hover mt-auto text-sm" href="/category/digestive-health">Shop Collection</Link>
                        </div>
                        {/* Collection Card 2 */}
                        <div className="bg-white rounded-2xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden flex flex-col items-center p-6 text-center transition-transform hover:-translate-y-1">
                            <div className="bg-gray-100 rounded-xl mb-4 p-4 flex items-center justify-center w-full h-48">
                                <img alt="Immunity Boost" className="max-h-full object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKRwke7T8-Sj0nb4jqcncVqsHse3cssxKLXelAuzXVOQAJbknDOY4B_WvF3Vr8EbgBMU69cx3n2xjaHS9K8VnImlVz3v4Rs_jkNsbqfWpurXgNeEoRzbn4-u4Xef9JgYsi96LZBIi3MlrXnM4wC3NRBK2yIhPfIqcAaF6OMqv0BkEnGxmKrf0FLFZplAP2sPD8j0QJnTGS5qUDUiz9neBD0LoFXqTfMvMR4BnW17cJg8Qyb68Xev-t" />
                            </div>
                            <h3 className="text-xl font-bold text-dark-green mb-2">Immunity Boost</h3>
                            <p className="text-gray-600 mb-6">Strengthen your defenses.</p>
                            <Link className="bg-primary-green text-white font-semibold px-6 py-2 rounded-full transition-colors duration-300 hover:bg-primary-green-hover mt-auto text-sm" href="/category/immunity">Shop Collection</Link>
                        </div>
                        {/* Collection Card 3 */}
                        <div className="bg-white rounded-2xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden flex flex-col items-center p-6 text-center transition-transform hover:-translate-y-1">
                            <div className="bg-gray-100 rounded-xl mb-4 p-4 flex items-center justify-center w-full h-48">
                                <img alt="Stress Relief" className="max-h-full object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUpx5b4Mn-92LAAwRv3kof2UkTjYIh6jjb8mO9XlteuXSGCP_AEOrmSVk0IxP6EbniosQQwWic95VXuhoEvZa3icPFKa2tiKiAWSl74GhDwzA0Py9l9uuNSt9DF5PzoC1tWwataqD5CcphjI2WtNBizOnL3sGj99_KJ7GBa7WtVVgt7vzh-yNLiA66FdOiKl_726egCMPGYCQVppEHwU4GLxjbMPD-O6XL9QjwuX2rHng1pinRrJXW" />
                            </div>
                            <h3 className="text-xl font-bold text-dark-green mb-2">Stress Relief</h3>
                            <p className="text-gray-600 mb-6">Find calm and balance.</p>
                            <Link className="bg-primary-green text-white font-semibold px-6 py-2 rounded-full transition-colors duration-300 hover:bg-primary-green-hover mt-auto text-sm" href="/category/stress-relief">Shop Collection</Link>
                        </div>
                    </div>
                </div>
            </section>
            {/* END: Featured Collections */}

            {/* BEGIN: Best Sellers */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-end mb-10">
                        <div className="flex-1 text-center">
                            <h2 className="text-3xl font-bold text-center text-dark-green relative inline-block after:content-[''] after:absolute after:-bottom-2 after:left-1/2 after:-translate-x-1/2 after:w-10 after:h-0.5 after:bg-accent-gold mb-0">Best Sellers</h2>
                        </div>
                        <div className="flex gap-2">
                            <button className="bg-accent-gold text-white w-8 h-8 rounded-full flex items-center justify-center hover:opacity-90 transition-opacity"><i className="fas fa-chevron-left"></i></button>
                            <button className="bg-accent-gold text-white w-8 h-8 rounded-full flex items-center justify-center hover:opacity-90 transition-opacity"><i className="fas fa-chevron-right"></i></button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <ProductCard
                            id="gamat-emas"
                            title="Gamat Emas Gold"
                            price={125000}
                            imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuACxTXB20NVFzPX76viUym0bDmcnPEmx8guKMEHy1tddi-M2HLyJHM4L0IgkO3IaJtZw8ajgR1kQHc0hBYm3qHdc0z88EgQYzdnDl_HMx9hmhRw1fLksXxfPxNLBM5clYA0-mSoIY_xgZfAJO3l_rzOscarMruoOoEg2Aou_LPOZ7qJi0bbC_g-OzD3lvcSjW6tJcO91NegKnJBuSPXElF1jRfeC35FpO3Is-dejPdy5MjDWpu9n4Wb"
                            slug="gamat-emas-gold"
                        />
                        <ProductCard
                            id="sari-kurma"
                            title="Sari Kurma Madu"
                            price={85000}
                            imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuBDvgLB8AO2TQfMeeqhYNnAx2rkvmlHekfQPGOwxEOif5jzZjR67PMuzSwV6yM03NVPxMwOUe4SOg-4vpZlpD1rVs66ChvL3M3LbkyJmJ69f2Ibw4RwblOlaFD6jCVnHpqGugyCeF4AwGmZyzRmYuEBCqjsQi7dwqhNVX_u8SSDxaDZxBuKHmzZWOPRFaIvd3rkDM3id-8PxSEUxRTVvCUdf7IWjDRABmSsM11CJRxsjumfOvMXrJfU"
                            slug="sari-kurma-madu"
                        />
                        <ProductCard
                            id="minyak-zaitun"
                            title="Minyak Zaitun Extra Virgin"
                            price={95000}
                            imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuDjnL4BoSl3rloIjCYQYHrpflPJH_scoywNm1c6bCQ26e0AMB6WcqteigP6nokQKLJfNVP0QI-PJLaCNLt8qvWtaTdM2KFQzaYHpgajy3GASZtl9jIiBMayCKemNL0oohdaklK0eB8My8xDsoKOcK9CtY40UmOImO3_yzkR3XXgwUGyXaS0r5nJmkLY0j-lVdPzlX-IBD7Lz8f4FBLwJPSpkD_qocIkY9NV40-hWu5cEWgcqiJ1jHFi"
                            slug="minyak-zaitun-extra-virgin"
                        />
                        <ProductCard
                            id="herbaslim"
                            title="HerbaSlim Pelangsing"
                            price={110000}
                            imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuDM32BpveJpzG4xO3Ctd20PPbx1m_jmF9AeXcSV7W8beWUHOzVCe5eJabZTJt31Qu4A0u6Eja57bufH6FyZM5NhuHRqtFS4QRtsp51XYsqQkkQdr0FUvfp9A07FpRtsu53IloK9qPn2RNR68tlHpeYYABlhmfc6tkhEEPSlj4aJ09sZuKxQkewmn35LMZWakag-llt4govZ2_7JV85ijqVHnUjmwLb0p7sqUEQaOkQfht3DjltsMxQN"
                            slug="herbaslim-pelangsing"
                        />
                    </div>
                </div>
            </section>
            {/* END: Best Sellers */}

            {/* BEGIN: Why Choose Us */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="bg-dark-green rounded-3xl p-10 lg:p-16 text-white text-center">
                        <h2 className="text-3xl font-bold mb-12 relative inline-block text-accent-gold">
                            Why Choose Us
                            <span className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-accent-gold rounded-full"></span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            {/* Feature 1 */}
                            <div className="flex flex-col items-center">
                                <div className="text-accent-gold text-5xl mb-4">
                                    <Leaf size={48} strokeWidth={1.5} />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">100% Natural Ingredients</h3>
                                <p className="text-sm text-gray-300">Sourced from the best nature has to offer.</p>
                            </div>
                            {/* Feature 2 */}
                            <div className="flex flex-col items-center">
                                <div className="text-accent-gold text-5xl mb-4">
                                    <ShieldCheck size={48} strokeWidth={1.5} />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Certified &amp; Trusted</h3>
                                <p className="text-sm text-gray-300">Quality tested and approved for safety.</p>
                            </div>
                            {/* Feature 3 */}
                            <div className="flex flex-col items-center">
                                <div className="text-accent-gold text-5xl mb-4">
                                    <Truck size={48} strokeWidth={1.5} />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Fast &amp; Reliable Shipping</h3>
                                <p className="text-sm text-gray-300">Get your remedies delivered quickly.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* END: Why Choose Us */}
        </>
    );
}
