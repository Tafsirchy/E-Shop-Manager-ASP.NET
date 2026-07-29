"use client";
import React, { useState, useRef, useEffect } from 'react';

export default function SubscriptionPromo() {
  const [hasScanned, setHasScanned] = useState(false);
  const [scanPos, setScanPos] = useState(-10); // percentage
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer to trigger scan when in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true);
          observer.disconnect(); // Only trigger once
        }
      },
      { threshold: 0.4 } // Trigger when 40% of the section is visible
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  // One-time auto-scan animation
  useEffect(() => {
    if (!isInView || hasScanned) return;

    let animationFrameId: number;
    let currentPos = -10; // Start off-screen to the left
    const speed = 0.5; // Slower scanning sweep speed for more dramatic effect

    const render = () => {
      currentPos += speed;
      if (currentPos >= 120) {
        setHasScanned(true); // Scan complete, keep fully revealed
      } else {
        setScanPos(currentPos);
        animationFrameId = requestAnimationFrame(render);
      }
    };
    
    // Slight delay before scanning starts for dramatic effect
    const timeoutId = setTimeout(() => {
      render();
    }, 600);

    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isInView, hasScanned]);

  const scanVal = `${scanPos}%`;

  return (
    <section 
      ref={containerRef}
      className="relative w-full h-[80vh] min-h-[600px] bg-white overflow-hidden border-b border-neutral-100"
    >
      {/* BASE LAYER: Barcode + Brutalist Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {/* CSS Barcode Background (Abstract) */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `repeating-linear-gradient(
              to right, 
              #000 0, #000 2px, 
              transparent 2px, transparent 8px, 
              #000 8px, #000 12px, 
              transparent 12px, transparent 16px, 
              #000 16px, #000 24px, 
              transparent 24px, transparent 32px,
              #000 32px, #000 34px,
              transparent 34px, transparent 40px
            )`
          }}
        ></div>
        
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <p className="text-neutral-500 font-bold tracking-[0.4em] uppercase text-sm mb-6">
            Unlock Exclusive Perks
          </p>
          <h2 className="text-7xl sm:text-8xl lg:text-[10rem] font-black tracking-tighter text-neutral-900 uppercase leading-[0.85] mix-blend-multiply">
            SCAN TO<br/>SUBSCRIBE
          </h2>
        </div>
      </div>

      {/* REVEAL LAYER: The Subscription Packages */}
      {/* As the scanner moves right, everything to its left becomes permanently visible */}
      <div 
        className="absolute inset-0 z-20 bg-neutral-900 text-white flex items-center transition-all duration-500"
        style={
          hasScanned 
          ? { opacity: 1 } // Fully revealed after scan
          : {
              WebkitMaskImage: `linear-gradient(to right, black calc(${scanVal} - 150px), transparent calc(${scanVal} + 50px))`,
              maskImage: `linear-gradient(to right, black calc(${scanVal} - 150px), transparent calc(${scanVal} + 50px))`,
            }
        }
      >
         {/* Background Glow inside the reveal */}
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-900/40 via-neutral-900 to-neutral-900 opacity-50"></div>

         {/* Beautiful Subscription UI */}
         <div className="relative w-full h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-center gap-8">
            
            {/* Intro Text */}
            <div className="flex-1 text-left hidden lg:block">
              <h3 className="text-6xl font-black mb-6 uppercase tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-500">
                Membership<br/>Tiers
              </h3>
              <p className="text-neutral-400 max-w-sm text-lg leading-relaxed">
                Join our exclusive club. Build your own custom package, set your delivery frequency, and enjoy dynamic pricing discounts!
              </p>
            </div>

            {/* Package 1 */}
            <div className="flex-1 bg-white/5 backdrop-blur-xl p-8 sm:p-10 rounded-[2rem] border border-white/10 hover:bg-white/10 transition-all duration-500 w-full max-w-sm relative overflow-hidden group">
               <h3 className="text-sm font-bold mb-2 tracking-[0.2em] uppercase text-neutral-400">Monthly</h3>
               <div className="text-6xl font-black mb-6 text-white tracking-tighter">$49<span className="text-2xl text-neutral-500 font-medium tracking-normal">/mo</span></div>
               <p className="text-neutral-300 mb-8 text-sm leading-relaxed">
                  Curated fashion items delivered every 30 days. Perfect for staying trendy.
               </p>
               
               <ul className="space-y-4 mb-10 text-sm text-neutral-200">
                  <li className="flex items-center gap-4">
                     <div className="w-1.5 h-1.5 bg-white rounded-full opacity-60"></div>
                     Flexible package builder
                  </li>
                  <li className="flex items-center gap-4">
                     <div className="w-1.5 h-1.5 bg-white rounded-full opacity-60"></div>
                     Pause or cancel anytime
                  </li>
               </ul>
               <button className="w-full py-5 bg-transparent border border-white/30 text-white font-bold uppercase tracking-widest text-sm rounded-full hover:bg-white hover:text-black transition-colors duration-300">
                  Select Plan
               </button>
            </div>
            
            {/* Package 2 (Most Popular) */}
            <div className="flex-1 bg-white p-8 sm:p-10 rounded-[2rem] border-none shadow-[0_0_80px_rgba(255,255,255,0.15)] hover:-translate-y-2 hover:shadow-[0_20px_80px_rgba(255,255,255,0.25)] transition-all duration-500 w-full max-w-sm relative overflow-hidden group text-neutral-900">
               {/* Popular Badge */}
               <div className="absolute top-6 right-6 bg-black text-white text-[0.65rem] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full z-10">
                 Most Popular
               </div>
               
               <h3 className="text-sm font-bold mb-2 tracking-[0.2em] uppercase text-neutral-500">Yearly Pass</h3>
               <div className="text-6xl font-black mb-6 text-black tracking-tighter">$399<span className="text-2xl text-neutral-400 font-medium tracking-normal">/yr</span></div>
               <p className="text-neutral-600 mb-8 text-sm leading-relaxed">
                  VIP access, free shipping, and maximum savings. Our ultimate value tier.
               </p>
               
               <ul className="space-y-4 mb-10 text-sm text-neutral-700 font-medium">
                  <li className="flex items-center gap-4">
                     <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                     Free nationwide shipping
                  </li>
                  <li className="flex items-center gap-4">
                     <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                     Priority 24/7 support
                  </li>
                  <li className="flex items-center gap-4">
                     <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                     Exclusive drop access
                  </li>
               </ul>
               <button className="w-full py-5 bg-black text-white font-bold uppercase tracking-widest text-sm rounded-full hover:bg-neutral-800 hover:scale-[1.02] transition-all duration-300 shadow-xl">
                  Subscribe Now
               </button>
            </div>

         </div>
      </div>

      {/* THE LASER LINE (Only visible while scanning) */}
      {!hasScanned && (
        <div 
          className="absolute top-0 bottom-0 z-30 pointer-events-none"
          style={{
            left: scanVal,
            width: '2px',
            backgroundColor: '#ef4444', // Red 500
            boxShadow: '0 0 40px 15px rgba(239, 68, 68, 0.4), 0 0 15px 3px rgba(239, 68, 68, 0.8)',
            transform: 'translateX(-50%)'
          }}
        ></div>
      )}
    </section>
  );
}
