"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function FlashSale() {
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 28, seconds: 59 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 24, minutes: 0, seconds: 0 }; // loop back for demo purposes
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (time: number) => time.toString().padStart(2, '0');

  const products = [
    { 
      name: "Oversized Wool Coat", 
      oldPrice: 299, 
      newPrice: 149, 
      discount: "50%",
      img: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&q=80&w=600" 
    },
    { 
      name: "Chunky Leather Boots", 
      oldPrice: 199, 
      newPrice: 89, 
      discount: "55%",
      img: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&q=80&w=600" 
    },
    { 
      name: "Avant-Garde Shades", 
      oldPrice: 150, 
      newPrice: 45, 
      discount: "70%",
      img: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=600" 
    },
    { 
      name: "Asymmetric Knitwear", 
      oldPrice: 220, 
      newPrice: 110, 
      discount: "50%",
      img: "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?auto=format&fit=crop&q=80&w=600" 
    },
    { 
      name: "Tactical Cargo Vest", 
      oldPrice: 180, 
      newPrice: 79, 
      discount: "55%",
      img: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=600" 
    },
    { 
      name: "Distressed Denim", 
      oldPrice: 140, 
      newPrice: 65, 
      discount: "50%",
      img: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=600" 
    },
  ];

  return (
    <section className="bg-white py-10 overflow-hidden border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Timer */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 border-b border-neutral-200 pb-6">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-500 font-bold tracking-[0.3em] uppercase text-xs">Live Now</span>
            </div>
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-black text-black uppercase tracking-tighter leading-[0.85]">
              Flash<br/><span className="text-red-500">Sale</span>
            </h2>
          </div>
          
          <div className="mt-6 lg:mt-0 flex flex-col items-start lg:items-end">
            <p className="text-neutral-500 font-bold uppercase tracking-widest text-[0.65rem] mb-2">Offer Ends In</p>
            <div className="flex items-center gap-2 sm:gap-3 text-black font-mono text-3xl sm:text-4xl font-black">
              <div className="bg-neutral-100 px-3 py-2 rounded-lg border border-neutral-200 shadow-inner w-16 sm:w-20 text-center">
                {formatTime(timeLeft.hours)}
              </div>
              <span className="text-red-500 -mt-1">:</span>
              <div className="bg-neutral-100 px-3 py-2 rounded-lg border border-neutral-200 shadow-inner w-16 sm:w-20 text-center">
                {formatTime(timeLeft.minutes)}
              </div>
              <span className="text-red-500 -mt-1">:</span>
              <div className="bg-neutral-100 px-3 py-2 rounded-lg border border-neutral-200 shadow-inner w-16 sm:w-20 text-center">
                {formatTime(timeLeft.seconds)}
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
          {products.map((product, idx) => (
            <Link href="/product" key={idx} className="group cursor-pointer">
              {/* Image Container */}
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100 rounded-xl mb-3">
                {/* Discount Badge */}
                <div className="absolute top-2 left-2 z-20 bg-red-500 text-white font-black text-sm px-3 py-0.5 rounded-full uppercase tracking-wider transform -rotate-2 group-hover:rotate-0 transition-transform duration-300 shadow-md">
                  -{product.discount}
                </div>
                
                {/* Image */}
                <img 
                  src={product.img} 
                  alt={product.name} 
                  className="absolute inset-0 w-full h-full object-cover object-center grayscale group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-105 mix-blend-multiply"
                />
                
                {/* Overlay Hover Effect */}
                <div className="absolute inset-0 bg-white/10 group-hover:bg-transparent transition-colors duration-500"></div>
              </div>

              {/* Product Info */}
              <div className="flex flex-col">
                <h3 className="text-black font-bold text-xs sm:text-sm uppercase tracking-wide mb-1 group-hover:text-red-500 transition-colors truncate">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-neutral-400 font-medium text-sm line-through decoration-red-500/50">
                    ${product.oldPrice}
                  </span>
                  <span className="text-red-500 font-black text-lg">
                    ${product.newPrice}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
