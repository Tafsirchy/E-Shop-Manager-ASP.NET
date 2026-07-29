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
          <Link href="/" className="text-2xl font-black tracking-tight">
            E-Shop<span className="text-primary-600">.</span>
          </Link>
        </div>
        
        {/* CENTER: Links */}
        <div className="hidden md:flex flex-1 items-center justify-center gap-10">
          <Link href="/" className="text-[15px] font-bold text-foreground hover:text-primary-600 transition">Home</Link>
          <Link href="/product?sort=new" className="text-[15px] font-bold text-foreground hover:text-primary-600 transition">New Arrival</Link>
          <Link href="/product" className="text-[15px] font-bold text-foreground hover:text-primary-600 transition">Shop</Link>
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
