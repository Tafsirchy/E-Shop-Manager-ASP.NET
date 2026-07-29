import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 text-white py-24 sm:py-32">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-6">
            Welcome to <span className="text-accent-400">E-Shop</span>
          </h1>
          <p className="mt-4 text-xl sm:text-2xl text-primary-100 max-w-3xl mx-auto mb-10">
            Discover premium products, exclusive subscriptions, and earn rewards on every purchase.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 items-center">
            <Link href="/product" className="px-8 py-4 bg-accent-500 hover:bg-accent-600 text-white font-bold rounded-full transition-transform transform hover:scale-105 shadow-lg shadow-accent-500/30 w-full sm:w-auto text-center">
              Shop Now
            </Link>
            <Link href="/subscriptions" className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-full backdrop-blur-sm transition-transform transform hover:scale-105 w-full sm:w-auto text-center">
              View Packages
            </Link>
          </div>
        </div>
      </section>

      {/* TRUST BADGES */}
      <section className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-4 text-2xl">
                🚀
              </div>
              <h3 className="text-lg font-semibold text-foreground">Fast Delivery</h3>
              <p className="text-neutral-500 text-sm mt-1">Nationwide shipping within 48 hours.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-4 text-2xl">
                🛡️
              </div>
              <h3 className="text-lg font-semibold text-foreground">Secure Payments</h3>
              <p className="text-neutral-500 text-sm mt-1">100% safe & secure checkout process.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-4 text-2xl">
                🔄
              </div>
              <h3 className="text-lg font-semibold text-foreground">Easy Returns</h3>
              <p className="text-neutral-500 text-sm mt-1">Hassle-free 7-day return policy.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground">Shop by Category</h2>
            <p className="text-neutral-500 mt-2">Find exactly what you are looking for</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link href="/product?category=Electronics" className="group block relative h-64 rounded-2xl overflow-hidden shadow-md">
              <div className="absolute inset-0 bg-neutral-800 transition-transform group-hover:scale-105 duration-500"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
              <div className="absolute bottom-0 left-0 p-6 z-20">
                <h3 className="text-2xl font-bold text-white group-hover:text-accent-400 transition-colors">Electronics</h3>
                <p className="text-neutral-300 text-sm mt-1">Latest gadgets & devices</p>
              </div>
            </Link>
            <Link href="/product?category=Clothing" className="group block relative h-64 rounded-2xl overflow-hidden shadow-md">
              <div className="absolute inset-0 bg-neutral-700 transition-transform group-hover:scale-105 duration-500"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
              <div className="absolute bottom-0 left-0 p-6 z-20">
                <h3 className="text-2xl font-bold text-white group-hover:text-accent-400 transition-colors">Clothing</h3>
                <p className="text-neutral-300 text-sm mt-1">Trending fashion wear</p>
              </div>
            </Link>
            <Link href="/product?category=Books" className="group block relative h-64 rounded-2xl overflow-hidden shadow-md">
              <div className="absolute inset-0 bg-neutral-600 transition-transform group-hover:scale-105 duration-500"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
              <div className="absolute bottom-0 left-0 p-6 z-20">
                <h3 className="text-2xl font-bold text-white group-hover:text-accent-400 transition-colors">Books</h3>
                <p className="text-neutral-300 text-sm mt-1">Bestsellers & new releases</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* SUBSCRIPTION PROMO */}
      <section className="py-20 bg-card border-t border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1">
              <h2 className="text-4xl font-bold text-foreground mb-4">Subscribe & Save More</h2>
              <p className="text-lg text-neutral-600 mb-8 leading-relaxed">
                Build your own custom package with our advanced Subscription System. Choose what you need, set your delivery frequency, and enjoy dynamic pricing discounts!
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-neutral-700"><span className="text-success-500 mr-3 text-xl">✔️</span> Monthly or Yearly Plans</li>
                <li className="flex items-center text-neutral-700"><span className="text-success-500 mr-3 text-xl">✔️</span> Flexible Custom Package Builder</li>
                <li className="flex items-center text-neutral-700"><span className="text-success-500 mr-3 text-xl">✔️</span> Priority Support</li>
              </ul>
              <Link href="/subscriptions" className="inline-block px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors shadow-md">
                Explore Subscriptions
              </Link>
            </div>
            <div className="flex-1 w-full relative">
              <div className="aspect-video bg-neutral-100 rounded-2xl shadow-inner border border-border flex items-center justify-center overflow-hidden relative">
                {/* Decorative Elements */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-200 rounded-full blur-3xl opacity-60"></div>
                <div className="text-primary-600 text-8xl relative z-10 animate-bounce" style={{ animationDuration: '3s' }}>📦</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MEMBERSHIP PROMO */}
      <section className="py-20 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-accent-500 to-accent-600 rounded-3xl p-10 sm:p-16 shadow-2xl text-white relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white opacity-10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white opacity-10 rounded-full blur-2xl"></div>
            <h2 className="text-4xl font-bold mb-4 relative z-10">Join Our VIP Club</h2>
            <p className="text-xl mb-8 relative z-10 max-w-2xl mx-auto opacity-90">
              Earn Reward Points on every purchase. Upgrade your role automatically based on lifetime spending and unlock exclusive discounts!
            </p>
            <Link href="/membership" className="inline-block px-8 py-4 bg-white text-accent-600 font-bold rounded-full hover:bg-neutral-50 transition-colors shadow-lg relative z-10">
              Discover Rewards
            </Link>
          </div>
        </div>
      </section>
      
      {/* FOOTER */}
      <footer className="bg-neutral-900 text-neutral-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-white text-2xl font-black tracking-tight mb-4">E-Shop<span className="text-primary-400">Manager</span></h3>
            <p className="text-sm max-w-sm leading-relaxed mb-6">
              A comprehensive E-Commerce platform built with modern technologies, featuring custom subscription packages and a dynamic reward system.
            </p>
            <div className="flex gap-4">
              {/* Social Icons Placeholders */}
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
    </main>
  );
}
