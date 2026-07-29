import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-400 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <h3 className="text-white text-2xl font-black tracking-tight mb-4">E-Shop<span className="text-primary-400">Manager</span></h3>
          <p className="text-sm max-w-sm leading-relaxed mb-6">
            A comprehensive E-Commerce platform built with modern technologies, featuring custom subscription packages and a dynamic reward system.
          </p>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-primary-600 transition-colors cursor-pointer text-white">X</div>
            <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-primary-600 transition-colors cursor-pointer text-white">f</div>
            <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-primary-600 transition-colors cursor-pointer text-white">in</div>
          </div>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-6">Quick Links</h4>
          <ul className="space-y-3 text-sm">
            <li><Link href="/product" className="hover:text-white transition">Products</Link></li>
            <li><Link href="/subscriptions" className="hover:text-white transition">Subscriptions</Link></li>
            <li><Link href="/membership" className="hover:text-white transition">Membership Rewards</Link></li>
            <li><Link href="/cart" className="hover:text-white transition">Cart</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-6">Contact</h4>
          <ul className="space-y-3 text-sm">
            <li>Email: support@eshop.com</li>
            <li>Phone: +880 1234 567 890</li>
            <li>Address: Dhaka, Bangladesh</li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-neutral-800 text-sm flex flex-col sm:flex-row justify-between items-center">
        <p>&copy; {new Date().getFullYear()} E-Shop Manager. All rights reserved.</p>
        <div className="flex gap-4 mt-4 sm:mt-0">
          <span className="hover:text-white cursor-pointer transition">Privacy Policy</span>
          <span className="hover:text-white cursor-pointer transition">Terms of Service</span>
        </div>
      </div>
    </footer>
  );
}
