import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-background -mt-16">
      {/* HERO SECTION - SPLIT SCREEN MINIMALIST */}
      <section className="relative bg-background overflow-hidden border-b border-border">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 bg-background pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32 pt-16 sm:pt-24 lg:pt-32 px-4 sm:px-6 lg:px-8">
            <main className="mx-auto max-w-7xl">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-5xl tracking-tight font-black text-foreground sm:text-6xl md:text-7xl leading-tight">
                  <span className="block xl:inline">Premium goods.</span>{' '}
                  <span className="block text-neutral-400 xl:inline">Minimal effort.</span>
                </h1>
                <p className="mt-4 text-base text-neutral-500 sm:mt-6 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-6 md:text-xl lg:mx-0 leading-relaxed">
                  Discover curated products, build custom subscription packages, and unlock exclusive rewards with every purchase. Experience e-commerce redefined.
                </p>
                <div className="mt-8 sm:flex sm:justify-center lg:justify-start gap-4">
                  <div className="rounded-full">
                    <Link href="/product" className="w-full flex items-center justify-center px-8 py-4 border border-transparent text-base font-semibold rounded-full text-white bg-foreground hover:bg-neutral-800 transition-all shadow-md hover:shadow-lg md:text-lg">
                      Shop Collection
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0">
                    <Link href="/subscriptions" className="w-full flex items-center justify-center px-8 py-4 border border-border text-base font-semibold rounded-full text-foreground bg-transparent hover:bg-neutral-50 transition-colors md:text-lg">
                      Explore Subscriptions
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 bg-neutral-100 flex items-center justify-center border-l border-border">
           {/* Abstract Minimalist Right Side */}
           <div className="relative w-full h-80 sm:h-96 lg:h-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-neutral-50 to-neutral-200">
             {/* Decorative Elements */}
             <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
             <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-accent-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
             
             {/* Floating Premium Card */}
             <div className="relative z-10 bg-white/60 backdrop-blur-xl border border-white/60 p-6 rounded-3xl shadow-2xl transform lg:rotate-3 hover:rotate-0 transition-all duration-700 hover:scale-105 group">
               <div className="w-64 h-80 bg-foreground rounded-2xl flex flex-col items-center justify-center text-white relative overflow-hidden shadow-inner">
                 <div className="absolute inset-0 bg-gradient-to-tr from-neutral-800 to-neutral-900 opacity-90"></div>
                 <div className="absolute -inset-1 bg-gradient-to-r from-primary-400 to-accent-400 opacity-0 group-hover:opacity-30 blur transition-opacity duration-700"></div>
                 <span className="text-8xl relative z-10 mb-4 drop-shadow-lg transition-transform duration-700 group-hover:-translate-y-2">✨</span>
                 <span className="text-sm font-semibold tracking-widest uppercase relative z-10 text-neutral-300">Edition 2026</span>
               </div>
             </div>
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
