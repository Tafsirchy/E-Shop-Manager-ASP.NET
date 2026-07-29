"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

export default function Navbar() {
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const isHovered = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(true);
      setIsScrolled(window.scrollY > 20);
      
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
      
      scrollTimeout.current = setTimeout(() => {
        if (!isHovered.current && window.scrollY > 20) {
          setIsVisible(false);
        }
      }, 1500);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientY <= 100) { 
        isHovered.current = true;
        setIsVisible(true);
        if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      } else {
        if (isHovered.current) {
           isHovered.current = false;
           if (window.scrollY > 20) {
             if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
             scrollTimeout.current = setTimeout(() => {
               setIsVisible(false);
             }, 1500);
           }
        }
      }
    };

    setIsScrolled(window.scrollY > 20);
    if (window.scrollY > 20) {
      scrollTimeout.current = setTimeout(() => {
        setIsVisible(false);
      }, 1500);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, []);

  return (
    <div className="sticky top-0 z-50 w-full">
      <header 
        className={`transition-transform duration-500 ease-in-out ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        } ${
          isScrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-neutral-100" : "bg-white"
        }`}
      >
      <nav className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 h-24 flex items-center justify-between">
        
        {/* LEFT: Logo */}
        <div className="flex-shrink-0 flex items-center">
          <Link href="/" className="flex items-center -ml-2" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src="/Asset/Logo.png" alt="E-Shop Logo" className="h-24 sm:h-[140px] w-auto object-contain mix-blend-multiply drop-shadow-xl" />
          </Link>
        </div>
        
        {/* CENTER: Links */}
        <div className="hidden md:flex flex-1 items-center justify-center gap-10 h-full">
          <Link href="/" className="text-[15px] font-bold text-foreground hover:text-primary-600 transition">Home</Link>
          <Link href="/product?sort=new" className="text-[15px] font-bold text-foreground hover:text-primary-600 transition">New Arrival</Link>
          
          {/* Shop with Mega Menu */}
          <div className="group h-full flex items-center">
            <Link href="/product" className="text-[15px] font-bold text-foreground hover:text-primary-600 transition flex items-center gap-1">
              Shop
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </Link>
            
            {/* Mega Menu Dropdown */}
            <div className="absolute top-full left-0 w-full bg-white border-t border-neutral-100 shadow-[0_20px_40px_rgba(0,0,0,0.08)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 -translate-y-2 group-hover:translate-y-0 z-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-12 gap-8">
                  
                  {/* Category Lists */}
                  <div className="col-span-8 grid grid-cols-3 gap-8">
                    {/* Column 1 */}
                    <div>
                      <h3 className="text-black font-black uppercase tracking-widest text-sm mb-6 border-b border-neutral-200 pb-2">Men's Apparel</h3>
                      <ul className="space-y-4">
                        <li><Link href="/product?category=tshirts" className="text-neutral-500 hover:text-primary-600 font-medium text-sm transition-colors">T-Shirts & Tops</Link></li>
                        <li><Link href="/product?category=hoodies" className="text-neutral-500 hover:text-primary-600 font-medium text-sm transition-colors">Hoodies & Sweatshirts</Link></li>
                        <li><Link href="/product?category=jackets" className="text-neutral-500 hover:text-primary-600 font-medium text-sm transition-colors">Jackets & Outerwear</Link></li>
                        <li><Link href="/product?category=pants" className="text-neutral-500 hover:text-primary-600 font-medium text-sm transition-colors">Pants & Denim</Link></li>
                        <li><Link href="/product?category=activewear" className="text-neutral-500 hover:text-primary-600 font-medium text-sm transition-colors">Activewear</Link></li>
                      </ul>
                    </div>
                    {/* Column 2 */}
                    <div>
                      <h3 className="text-black font-black uppercase tracking-widest text-sm mb-6 border-b border-neutral-200 pb-2">Women's Apparel</h3>
                      <ul className="space-y-4">
                        <li><Link href="/product?category=dresses" className="text-neutral-500 hover:text-primary-600 font-medium text-sm transition-colors">Dresses</Link></li>
                        <li><Link href="/product?category=tops" className="text-neutral-500 hover:text-primary-600 font-medium text-sm transition-colors">Tops & Blouses</Link></li>
                        <li><Link href="/product?category=knitwear" className="text-neutral-500 hover:text-primary-600 font-medium text-sm transition-colors">Knitwear</Link></li>
                        <li><Link href="/product?category=jeans" className="text-neutral-500 hover:text-primary-600 font-medium text-sm transition-colors">Jeans & Skirts</Link></li>
                        <li><Link href="/product?category=swimwear" className="text-neutral-500 hover:text-primary-600 font-medium text-sm transition-colors">Swimwear</Link></li>
                      </ul>
                    </div>
                    {/* Column 3 */}
                    <div>
                      <h3 className="text-black font-black uppercase tracking-widest text-sm mb-6 border-b border-neutral-200 pb-2">Accessories</h3>
                      <ul className="space-y-4">
                        <li><Link href="/product?category=bags" className="text-neutral-500 hover:text-primary-600 font-medium text-sm transition-colors">Bags & Backpacks</Link></li>
                        <li><Link href="/product?category=jewelry" className="text-neutral-500 hover:text-primary-600 font-medium text-sm transition-colors">Jewelry & Watches</Link></li>
                        <li><Link href="/product?category=sunglasses" className="text-neutral-500 hover:text-primary-600 font-medium text-sm transition-colors">Sunglasses</Link></li>
                        <li><Link href="/product?category=hats" className="text-neutral-500 hover:text-primary-600 font-medium text-sm transition-colors">Hats & Beanies</Link></li>
                        <li><Link href="/product?category=shoes" className="text-neutral-500 hover:text-primary-600 font-medium text-sm transition-colors">Footwear</Link></li>
                      </ul>
                    </div>
                  </div>

                  {/* Featured Highlight */}
                  <div className="col-span-4 pl-8 border-l border-neutral-100">
                    <Link href="/sale" className="group/feature block relative rounded-2xl overflow-hidden aspect-[4/3] bg-neutral-100">
                      <img 
                        src="https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=800" 
                        alt="Summer Collection" 
                        className="w-full h-full object-cover grayscale group-hover/feature:grayscale-0 transition-all duration-700 group-hover/feature:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                      <div className="absolute bottom-6 left-6 right-6">
                        <span className="inline-block px-3 py-1 bg-white text-black font-black text-xs uppercase tracking-widest mb-2">New Season</span>
                        <h4 className="text-white font-bold text-2xl leading-tight">Summer Collection 2026</h4>
                        <div className="mt-3 flex items-center text-white text-sm font-medium">
                          <span>Explore Now</span>
                          <svg className="w-4 h-4 ml-2 transform group-hover/feature:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                        </div>
                      </div>
                    </Link>
                  </div>

                </div>
              </div>
            </div>
          </div>

          <Link href="/contact" className="text-[15px] font-bold text-foreground hover:text-primary-600 transition">Contact</Link>
          <Link href="/about" className="text-[15px] font-bold text-foreground hover:text-primary-600 transition">About Us</Link>
        </div>
        
        {/* RIGHT: Utility Icons */}
        <div className="flex items-center gap-6">
          <button className="text-foreground hover:text-primary-600 transition" aria-label="Search">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </button>
          
          <Link href="/cart" className="text-foreground hover:text-primary-600 transition relative" aria-label="Shopping Cart">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          </Link>

          <Link href="/admin" className="text-[14px] font-bold text-foreground border-2 border-foreground px-6 py-2.5 rounded-full hover:bg-foreground hover:text-white transition-colors ml-2">
            Sign In
          </Link>
        </div>

      </nav>
    </header>
    </div>
  );
}
