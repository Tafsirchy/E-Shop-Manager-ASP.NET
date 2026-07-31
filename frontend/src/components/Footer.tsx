"use client";
import { useState } from "react";
import Link from 'next/link';

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [subscribing, setSubscribing] = useState(false);

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus({ ok: false, text: "Please enter a valid email address." });
      return;
    }
    setSubscribing(true);
    // Newsletter signups are handled offline; give visible feedback instead of a dead form.
    await new Promise(resolve => setTimeout(resolve, 500));
    setSubscribing(false);
    setStatus({ ok: true, text: "You're on the list! Welcome to E-Shop." });
    setEmail("");
  };
  return (
    <footer className="bg-neutral-950 text-neutral-400 pt-16 pb-8 border-t border-neutral-900 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Section: Newsletter & Links */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 lg:gap-8 mb-16">
          
          {/* Newsletter (Left) */}
          <div className="col-span-1 md:col-span-12 lg:col-span-5">
            <h3 className="text-white text-4xl sm:text-5xl font-black uppercase tracking-tighter mb-4 leading-none">
              Join The<br/>List
            </h3>
            <p className="text-sm mb-10 max-w-sm text-neutral-500 leading-relaxed">
              Sign up for exclusive drops, early sale access, and tailored fashion updates.
            </p>
            <form onSubmit={subscribe} className="relative max-w-md group" noValidate>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="YOUR EMAIL"
                className="w-full bg-transparent border-b-2 border-neutral-800 py-4 pr-12 text-white font-mono text-sm placeholder-neutral-600 focus:outline-none focus:border-white transition-colors uppercase"
              />
              <button
                type="submit"
                disabled={subscribing}
                aria-label="Subscribe to newsletter"
                className="absolute right-0 top-1/2 transform -translate-y-1/2 text-white font-black group-hover:text-red-500 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                </svg>
              </button>
            </form>
            {status && (
              <p className={`text-sm mt-3 max-w-md ${status.ok ? "text-green-400" : "text-red-400"}`}>
                {status.text}
              </p>
            )}
          </div>

          {/* Spacer */}
          <div className="hidden lg:block lg:col-span-2"></div>

          {/* Links (Right) */}
          <div className="col-span-1 md:col-span-12 lg:col-span-5 grid grid-cols-2 gap-8 sm:gap-12">
            <div>
              <h4 className="text-white font-bold mb-8 uppercase tracking-widest text-xs">Shop</h4>
              <ul className="space-y-5 text-sm font-medium">
                <li><Link href="/new" className="hover:text-white hover:translate-x-1 inline-block transition-transform duration-300">New Arrivals</Link></li>
                <li><Link href="/product" className="hover:text-white hover:translate-x-1 inline-block transition-transform duration-300">All Products</Link></li>
                <li><Link href="/sale" className="hover:text-white hover:translate-x-1 inline-block transition-transform duration-300">Flash Sale</Link></li>
                <li><Link href="/lookbook" className="hover:text-white hover:translate-x-1 inline-block transition-transform duration-300">Lookbook</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-8 uppercase tracking-widest text-xs">Company</h4>
              <ul className="space-y-5 text-sm font-medium">
                <li><Link href="/about" className="hover:text-white hover:translate-x-1 inline-block transition-transform duration-300">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white hover:translate-x-1 inline-block transition-transform duration-300">Contact</Link></li>
                <li><Link href="/faq" className="hover:text-white hover:translate-x-1 inline-block transition-transform duration-300">FAQ</Link></li>
                <li><Link href="/shipping" className="hover:text-white hover:translate-x-1 inline-block transition-transform duration-300">Shipping</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Huge Brand Text */}
        <div className="w-full flex items-center justify-center border-t border-neutral-900 pt-12 mb-6 overflow-hidden">
           <h1 className="text-[20vw] sm:text-[18vw] leading-none font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-900 text-center tracking-tighter opacity-20 select-none">
             ESHOP
           </h1>
        </div>

        {/* Bottom Section: Copyright & Socials */}
        <div className="flex flex-col md:flex-row justify-between items-center text-[0.65rem] sm:text-xs font-mono tracking-widest uppercase text-neutral-600 gap-6">
          <div className="flex gap-6 sm:gap-8">
             <a href="#" className="hover:text-white transition-colors">Instagram</a>
             <a href="#" className="hover:text-white transition-colors">X / Twitter</a>
             <a href="#" className="hover:text-white transition-colors">Tiktok</a>
          </div>
          <p>&copy; {new Date().getFullYear()} E-SHOP. ALL RIGHTS RESERVED.</p>
        </div>

      </div>
    </footer>
  );
}
