"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

interface FlashProduct {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  category?: string;
}

export default function FlashSale() {
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 28, seconds: 59 });
  const [products, setProducts] = useState<FlashProduct[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    let ignore = false;

    apiFetch<FlashProduct[]>('/api/products?sort=new', { method: 'GET', auth: false })
      .then((data) => {
        if (!ignore) {
          setProducts(data.slice(0, 6));
        }
      })
      .catch(() => {
        if (!ignore) setProducts([]);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const formatTime = (time: number) => time.toString().padStart(2, '0');

  const deriveOldPrice = (price: number, discount: number) => Math.round(price / (1 - discount / 100));

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
          {loading ? (
            Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="animate-pulse">
                <div className="aspect-[3/4] w-full rounded-xl mb-3 bg-neutral-100" />
                <div className="h-3 w-4/5 rounded bg-neutral-100 mb-2" />
                <div className="h-4 w-2/3 rounded bg-neutral-100" />
              </div>
            ))
          ) : products.length > 0 ? products.map((product, idx) => {
            const discount = idx % 2 === 0 ? 50 : idx % 3 === 0 ? 70 : 55;
            const oldPrice = deriveOldPrice(product.price, discount);

            return (
            <Link href={`/product/${product.id}`} key={product.id} className="group cursor-pointer">
              {/* Image Container */}
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100 rounded-xl mb-3">
                {/* Discount Badge */}
                <div className="absolute top-2 left-2 z-20 bg-red-500 text-white font-black text-sm px-3 py-0.5 rounded-full uppercase tracking-wider transform -rotate-2 group-hover:rotate-0 transition-transform duration-300 shadow-md">
                  -{discount}%
                </div>
                
                {/* Image */}
                <img 
                  src={product.imageUrl || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=600'}
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
                    ${oldPrice}
                  </span>
                  <span className="text-red-500 font-black text-lg">
                    ${product.price}
                  </span>
                </div>
              </div>
            </Link>
            );
          }) : (
            <div className="col-span-full py-10 text-center text-neutral-500">Flash sale products are unavailable right now.</div>
          )}
        </div>

      </div>
    </section>
  );
}
