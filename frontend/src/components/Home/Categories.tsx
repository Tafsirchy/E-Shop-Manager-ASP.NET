"use client";
import React, { useState, useRef } from 'react';
import Link from 'next/link';

const categories = [
  { 
    name: "COLLECTION", 
    href: "/product", 
    img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1000", 
    weight: "font-black", 
    size: "text-[14vw] lg:text-[10rem]", 
    style: "text-left" 
  },
  { 
    name: "AVANT-GARDE", 
    href: "/product?category=Avant-Garde", 
    img: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=1000", 
    weight: "font-bold", 
    size: "text-[8vw] lg:text-[5rem]", 
    style: "text-center" 
  },
  { 
    name: "FASHION NOW", 
    href: "/product", 
    img: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=1000", 
    weight: "font-black", 
    size: "text-[10vw] lg:text-[7rem]", 
    style: "text-right" 
  },
  { 
    name: "SHOP NOW", 
    href: "/product", 
    img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1000", 
    weight: "font-black", 
    size: "text-[15vw] lg:text-[11rem]", 
    style: "text-left" 
  },
  { 
    name: "IDENTITY", 
    href: "/product", 
    img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1000", 
    weight: "font-extrabold", 
    size: "text-[9vw] lg:text-[6.5rem]", 
    style: "text-center" 
  },
  { 
    name: "FW24", 
    href: "/product", 
    img: "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?auto=format&fit=crop&q=80&w=1000", 
    weight: "font-black", 
    size: "text-[12vw] lg:text-[8rem]", 
    style: "text-right" 
  },
];

export default function Categories() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeCat, setActiveCat] = useState<number | null>(null);
  const [circlePos, setCirclePos] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleMouseEnter = (idx: number) => {
    const randomX = Math.floor(Math.random() * 60) + 20;
    const randomY = Math.floor(Math.random() * 60) + 20;
    setCirclePos({ x: randomX, y: randomY });
    setActiveCat(idx);
  };

  const handleMouseLeave = () => {
    setActiveCat(null);
  };

  return (
    <section 
      ref={containerRef}
      className="relative w-full overflow-hidden cursor-none border-b border-neutral-100 py-10"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* BASE LAYER: Tetris-like tightly packed typography constrained to max-w-7xl */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col justify-center">
        {categories.map((cat, idx) => (
          <Link 
            key={idx} 
            href={cat.href}
            onMouseEnter={() => handleMouseEnter(idx)}
            className={`
              ${cat.size} ${cat.weight} ${cat.style} 
              uppercase tracking-tighter leading-[0.85] text-neutral-900 
              hover:text-neutral-500 transition-colors duration-300 relative
            `}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {/* THE ROUND INTERFACE (Dominant Popup Circle) */}
      <div 
        className={`
          absolute z-20 pointer-events-none rounded-full overflow-hidden
          w-[250px] h-[250px] sm:w-[400px] sm:h-[400px] lg:w-[450px] lg:h-[450px]
          shadow-[0_0_80px_rgba(255,255,255,1),0_0_20px_rgba(255,255,255,0.8)]
          transition-all duration-700 cubic-bezier(0.25, 1, 0.5, 1)
        `}
        style={{
          left: `${circlePos.x}%`,
          top: `${circlePos.y}%`,
          transform: `translate(-50%, -50%) scale(${activeCat !== null ? 1 : 0.8})`,
          opacity: activeCat !== null ? 1 : 0,
        }}
      >
        {categories.map((cat, idx) => (
          <img 
            key={`img-${idx}`} 
            src={cat.img} 
            alt={cat.name} 
            className={`
              absolute inset-0 w-full h-full object-cover 
              transition-opacity duration-500 ease-in-out
              ${activeCat === idx ? 'opacity-100' : 'opacity-0'}
            `} 
          />
        ))}
      </div>
      
      {/* CUSTOM CURSOR: Thick White Ring (Mix-blend for visibility) */}
      <div 
        className={`
          absolute z-30 pointer-events-none w-10 h-10 border-[3px] border-neutral-900 rounded-full 
          flex items-center justify-center transition-opacity duration-300 mix-blend-difference
          ${activeCat !== null ? 'opacity-100' : 'opacity-0'}
        `}
        style={{
          transform: `translate(${mousePos.x - 20}px, ${mousePos.y - 20}px)`,
        }}
      >
      </div>
    </section>
  );
}
