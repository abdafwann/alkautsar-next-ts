'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith('/admin')) {
    return null;
  }
  return (
    <footer className="bg-dark-green text-white pt-16 pb-6 border-t-[20px] border-[#183625]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* About Column */}
          <div>
            <h4 className="text-xl font-bold mb-6 text-white">About Us</h4>
            <p className="text-sm text-gray-300 mb-4 leading-relaxed">
              PT. AL-KAUTSAR PERKASA INDONESIA is a professional company to access natural and herbal and traditional medicine.
            </p>
            <p className="text-sm text-gray-300 leading-relaxed">
              Our mission is engaged to evaluate quality and promote our herbal and traditional medicine.
            </p>
            <div className="mt-6 flex gap-2">
              <img alt="Visa" className="h-6 bg-white rounded px-1" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJrIr2GVV4pj0u-9RsNXpcBu8LeXjEtlOzkIDNp80DVlnsBmIv2tu8ERUnwzzbP4Rfj6kZp0D6zJ8ZJyLQDXKVQ5PzjClRODH7AwCLleY6iN1e2bW-gPiMbG8VHU9y9EvQNMTupDfn2ADBEvACLr9bFen0mi3b6FuptRWGIZh_B6xLreks3pETas0uJBiehudRZSk3NdYzIncMZiP8oysmw81UnHtj8QDR7rE_qFR3vhZnog8BRyhV" />
              <img alt="Mastercard" className="h-6 bg-white rounded px-1" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBiibjtZQ6N4TAh2FPYcksK249qlzCT00H3jUP62jg5eNGufh2SPv1Wo1_TvRHJtEKAGCg_JrGjss5isOHU6X0syyIbB2XBbaxtnAjCegbWyHn44ar694cYgnmsqVTmNmMQmiUBkGG-LyHvEj01Sew0Ef0nP3md-6aeeWMv5E0QU9y4nCCEfkWpf1-9AER1YPvsIZy8tj1qjtVumg22_tRHouYb-vIuqAeMWb_4Rq3jOaape0nJlauO" />
              <img alt="PayPal" className="h-6 bg-white rounded px-1" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8BJW3TtI7eklxGUecdG6ffh6S0R0A0QPWGFn3BRcdOK7hGmhC4pwq3FKqf5dyNoxKx4JKk1hDnH3SA1oZzhSUho2yCowkCQn-Ycv5Moy_QHIBw5EmJUw0Lvv_B8e1IezqF_LpvBwZSnQcYpiUYpEPWYigmJAsEsDTK_AlShyvr6JKqXDxR-ds6wTAOkyymD0oxw5_8AXcVTjgBwOR1Rlz26VAHDPKtmxJUdWbbKKOUCdIX7t4pVd1" />
              <img alt="Discover" className="h-6 bg-white rounded px-1" src="https://lh3.googleusercontent.com/aida-public/AB6AXuArrfvrNRdko7_No-0lXZwyXpJjtURg3uFbc5-T1UtM8alCMqxOvSitU8IqJVMCCjyzA_chBSH39BlwCK1Hbbxj8dH3zjuzSStb1cKS7It4dFc6QkoNLLGS9pnnAFxDq_LXtPqwP0MNKIfqJ7G_6qM0rUAgzkyXQZQTeDD7Ze25X0jXjoQzdKyhVzhQcine5Cz3h9jzoGV3hgbxuFd6UXp1AMMkmmBDoS64Pccu5z81H7nnskpw_vEt" />
              <img alt="Amex" className="h-6 bg-white rounded px-1" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBinlXexhHsAmMwyRM9sMHLNzx0mFuCf4fV0OoT3tDzDL2jmblTMeXCkEOoovRydqQ4SdqL9M9y7hT8Um03T-n2QGhpyA22WiRbcx3qCDcE3gYOOvWPDq1wKLznl5YUlZWuJ8e0530QhIb4uq66hxqobnLX90NNAnjdZosvM8qoZrz83jyeuCu9pI3ROg6XOFEYwMSq0gTI9Zv_JL7eGkaklCZHVSEvNaEm3AL-u7kDyij2srgL2AWn" />
            </div>
          </div>
          {/* Quick Links Column */}
          <div>
            <h4 className="text-xl font-bold mb-6 text-white">Quick Links</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li><Link className="hover:text-white transition-colors" href="/shop">Shop</Link></li>
              <li><Link className="hover:text-white transition-colors" href="/about">About</Link></li>
              <li><Link className="hover:text-white transition-colors" href="/contact">Contact</Link></li>
              <li><Link className="hover:text-white transition-colors" href="/faqs">FAQs</Link></li>
              <li><Link className="hover:text-white transition-colors" href="/shipping">Shipping Policy</Link></li>
            </ul>
          </div>
          {/* Customer Service Column */}
          <div>
            <h4 className="text-xl font-bold mb-6 text-white">Customer Service</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li><Link className="hover:text-white transition-colors" href="/contact">Contact Us</Link></li>
              <li><Link className="hover:text-white transition-colors" href="/returns">Returns</Link></li>
              <li><Link className="hover:text-white transition-colors" href="/privacy">Privacy Policy</Link></li>
            </ul>
          </div>
          {/* Newsletter Column */}
          <div>
            <h4 className="text-xl font-bold mb-6 text-white">Newsletter</h4>
            <p className="text-sm text-gray-300 mb-4">Subscribe for updates and exclusive offers.</p>
            <form className="flex flex-col gap-3">
              <input className="w-full px-4 py-2 rounded-full text-gray-900 border-none focus:ring-2 focus:ring-primary-green" placeholder="Enter e-mail address" type="email" />
              <button className="bg-primary-green text-white font-semibold rounded-full transition-colors duration-300 hover:bg-primary-green-hover w-full py-2" type="submit">Subscribe</button>
            </form>
            <div className="mt-8 flex gap-4 text-accent-gold text-xl">
              <Link className="hover:text-white transition-colors" href="#"><i className="fab fa-facebook"></i></Link>
              <Link className="hover:text-white transition-colors" href="#"><i className="fab fa-instagram"></i></Link>
              <Link className="hover:text-white transition-colors" href="#"><i className="fab fa-youtube"></i></Link>
              <Link className="hover:text-white transition-colors" href="#"><i className="fab fa-tiktok"></i></Link>
            </div>
          </div>
        </div>
        {/* Copyright */}
        <div className="border-t border-gray-700 pt-6 text-center text-xs text-gray-400">
          <p>© 2024 PT. AL-KAUTSAR PERKASA INDONESIA. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
