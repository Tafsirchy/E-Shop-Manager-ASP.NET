"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function Navbar() {
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const isHovered = useRef(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(true);
      setIsScrolled(window.scrollY > 50);
      
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
      
      scrollTimeout.current = setTimeout(() => {
        // Hide if we are not hovering the navbar and we've scrolled down
        if (!isHovered.current && window.scrollY > 50) {
          setIsVisible(false);
        }
      }, 1500); // 1.5 seconds delay before hiding
    };

    const handleMouseMove = (e: MouseEvent) => {
      // If mouse is in the top 80px of the viewport, consider it hovering the navbar area
      if (e.clientY <= 80) {
        isHovered.current = true;
        setIsVisible(true);
        if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      } else {
        if (isHovered.current) {
           isHovered.current = false;
           // If mouse left the area and we are scrolled down, trigger hide timeout
           if (window.scrollY > 50) {
             if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
             scrollTimeout.current = setTimeout(() => {
               setIsVisible(false);
             }, 1500);
           }
        }
      }
    };

    // Initial check
    setIsScrolled(window.scrollY > 50);

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      } ${isScrolled ? "bg-white/80 backdrop-blur-lg shadow-sm border-b border-neutral-200/50" : "bg-transparent"}`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-black text-primary-600 tracking-tight">E-Shop<span className="text-foreground">Manager</span></Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/product" className="text-sm font-medium text-neutral-600 hover:text-primary-600 transition">Products</Link>
            <Link href="/subscriptions" className="text-sm font-medium text-neutral-600 hover:text-primary-600 transition">Subscriptions</Link>
            <Link href="/membership" className="text-sm font-medium text-neutral-600 hover:text-primary-600 transition">Rewards</Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/cart" className="text-sm font-medium text-neutral-600 hover:text-primary-600 transition">🛒 Cart</Link>
          <Link href="/admin" className="text-sm font-medium bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition">Admin Panel</Link>
        </div>
      </nav>
    </header>
  );
}
