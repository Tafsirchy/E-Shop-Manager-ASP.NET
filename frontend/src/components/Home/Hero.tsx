"use client";
import Link from 'next/link';
import { useState, useEffect } from "react";

const initialImages = [
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&q=80&w=600"
];

export default function Hero() {
  const [images, setImages] = useState(initialImages);
  const [fadingIndices, setFadingIndices] = useState<number[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      let idx1 = Math.floor(Math.random() * images.length);
      let idx2 = Math.floor(Math.random() * images.length);
      while (idx1 === idx2) {
        idx2 = Math.floor(Math.random() * images.length);
      }

      setFadingIndices([idx1, idx2]);

      setTimeout(() => {
        setImages((prev) => {
          const newImages = [...prev];
          const temp = newImages[idx1];
          newImages[idx1] = newImages[idx2];
          newImages[idx2] = temp;
          return newImages;
        });
        setFadingIndices([]);
      }, 600);
      
    }, 4500);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <section className="pt-4 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
      {/* HEADLINE ROW */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 sm:mb-10 gap-8">
        
        {/* Left: Rotating Badge */}
        <div className="hidden md:flex items-center justify-center relative w-32 h-32 flex-shrink-0">
          <div className="absolute inset-0 animate-[spin_15s_linear_infinite]">
            <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
              <path id="circlePath" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" fill="transparent" />
              <text className="text-[10.5px] font-bold tracking-[0.15em] uppercase fill-neutral-800">
                <textPath href="#circlePath" startOffset="0%">
                  Discover our premium products • 
                </textPath>
              </text>
            </svg>
          </div>
          <button className="relative z-10 w-12 h-12 bg-neutral-900 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform">
            <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6z"></path></svg>
          </button>
        </div>

        {/* Center: Headline */}
        <div className="flex-1 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[56px] font-black tracking-tight leading-[1.1] text-neutral-900">
            Curated Goods. <br /> Seamless Shopping.
          </h1>
        </div>

        {/* Right: Avatars */}
        <div className="hidden md:flex items-center justify-end w-32 flex-shrink-0">
          <div className="flex -space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white text-lg overflow-hidden shadow-sm">👨‍🦱</div>
            <div className="w-10 h-10 rounded-full bg-purple-500 border-2 border-white flex items-center justify-center text-white text-lg overflow-hidden shadow-sm">👩🏻</div>
            <div className="w-10 h-10 rounded-full bg-pink-500 border-2 border-white flex items-center justify-center text-white text-lg overflow-hidden shadow-sm">👨🏾‍🦱</div>
            <div className="w-10 h-10 rounded-full bg-neutral-900 border-2 border-white flex items-center justify-center text-white text-sm font-bold z-10 shadow-sm">
              +
            </div>
          </div>
        </div>
        
      </div>

      {/* MULTI-COLUMN IMAGE GALLERY */}
      <div className="relative">
        {/* Decorative Sparkle */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 text-orange-400 text-3xl hidden lg:flex items-center justify-center">
          <svg className="w-10 h-10 animate-[spin_10s_linear_infinite]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M12 3v18m9-9H3m15.364-6.364l-12.728 12.728m12.728 0L5.636 5.636" strokeLinecap="round"/></svg>
        </div>

        {/* Desktop/Tablet Grid */}
        <div className="hidden md:grid grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-5 h-[450px] lg:h-[500px]">
          
          {/* Column 1 */}
          <div className="flex flex-col gap-4 lg:gap-5 h-full pt-6">
            <div className="flex-1 bg-orange-500 rounded-t-[2.5rem] rounded-b-2xl overflow-hidden relative group shadow-sm hover:shadow-md transition-shadow">
              <div className={`absolute inset-0 transition-all duration-700 ease-in-out ${fadingIndices.includes(0) ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'}`}>
                <img src={images[0]} alt="Gallery Item" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              </div>
              <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500"></div>
            </div>
            <div className="h-32 bg-orange-400 rounded-t-[2rem] rounded-b-2xl overflow-hidden relative group shadow-sm hover:shadow-md transition-shadow">
              <div className={`absolute inset-0 transition-all duration-700 ease-in-out ${fadingIndices.includes(1) ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'}`}>
                <img src={images[1]} alt="Gallery Item" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              </div>
              <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500"></div>
            </div>
          </div>

          {/* Column 2 */}
          <div className="h-full pb-12">
            <div className="w-full h-full bg-green-500 rounded-t-[2.5rem] rounded-b-2xl overflow-hidden relative group shadow-sm hover:shadow-md transition-shadow">
               <div className={`absolute inset-0 transition-all duration-700 ease-in-out ${fadingIndices.includes(2) ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'}`}>
                 <img src={images[2]} alt="Gallery Item" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
               </div>
               <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500"></div>
            </div>
          </div>

          {/* Column 3 (Center) */}
          <div className="h-full pt-20 pb-20 relative flex justify-center">
            <div className="w-full h-full bg-amber-400 rounded-t-[2.5rem] rounded-b-3xl overflow-hidden relative group shadow-md hover:shadow-lg transition-shadow">
              <div className={`absolute inset-0 transition-all duration-700 ease-in-out ${fadingIndices.includes(3) ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'}`}>
                <img src={images[3]} alt="Gallery Item" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              </div>
              <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500"></div>
            </div>
            {/* Floating CTA */}
            <Link href="/product" className="absolute bottom-12 z-30 inline-flex items-center gap-3 px-8 py-4 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-full shadow-2xl hover:-translate-y-1 transition-all">
              Explore Collections
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 12h16m0 0l-6-6m6 6l-6 6"></path></svg>
            </Link>
          </div>

          {/* Column 4 */}
          <div className="h-full pt-10 pb-6 hidden lg:block">
            <div className="w-full h-full bg-sky-400 rounded-t-[2.5rem] rounded-b-2xl overflow-hidden relative group shadow-sm hover:shadow-md transition-shadow">
              <div className={`absolute inset-0 transition-all duration-700 ease-in-out ${fadingIndices.includes(4) ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'}`}>
                <img src={images[4]} alt="Gallery Item" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              </div>
              <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500"></div>
            </div>
          </div>

          {/* Column 5 */}
          <div className="flex flex-col gap-4 lg:gap-5 h-full pt-16 hidden lg:flex">
            <div className="h-28 bg-emerald-700 rounded-t-[2rem] rounded-b-2xl overflow-hidden relative group shadow-sm hover:shadow-md transition-shadow">
              <div className={`absolute inset-0 transition-all duration-700 ease-in-out ${fadingIndices.includes(5) ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'}`}>
                <img src={images[5]} alt="Gallery Item" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              </div>
              <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500"></div>
            </div>
            <div className="flex-1 bg-emerald-600 rounded-t-[2.5rem] rounded-b-2xl overflow-hidden relative group shadow-sm hover:shadow-md transition-shadow">
              <div className={`absolute inset-0 transition-all duration-700 ease-in-out ${fadingIndices.includes(6) ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'}`}>
                <img src={images[6]} alt="Gallery Item" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              </div>
              <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500"></div>
            </div>
          </div>

        </div>

        {/* Mobile Horizontal Scroll */}
        <div className="md:hidden flex overflow-x-auto snap-x snap-mandatory gap-4 pb-8 -mx-4 px-4 hide-scrollbar">
           <div className="w-[80vw] flex-shrink-0 h-[350px] bg-orange-500 rounded-t-[2.5rem] rounded-b-2xl snap-center relative shadow-sm overflow-hidden group">
             <div className={`absolute inset-0 transition-all duration-700 ease-in-out ${fadingIndices.includes(0) ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'}`}>
               <img src={images[0]} alt="Gallery Item" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
             </div>
           </div>
           <div className="w-[80vw] flex-shrink-0 h-[350px] bg-amber-400 rounded-t-[2.5rem] rounded-b-2xl snap-center relative flex items-end justify-center pb-8 shadow-sm overflow-hidden group">
             <div className={`absolute inset-0 transition-all duration-700 ease-in-out ${fadingIndices.includes(3) ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'}`}>
               <img src={images[3]} alt="Gallery Item" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
             </div>
             <Link href="/product" className="relative z-10 inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white font-bold rounded-full shadow-xl">
                Explore Collections <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12h16m0 0l-6-6m6 6l-6 6"></path></svg>
             </Link>
           </div>
           <div className="w-[80vw] flex-shrink-0 h-[350px] bg-green-500 rounded-t-[2.5rem] rounded-b-2xl snap-center relative shadow-sm overflow-hidden group">
             <div className={`absolute inset-0 transition-all duration-700 ease-in-out ${fadingIndices.includes(2) ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'}`}>
               <img src={images[2]} alt="Gallery Item" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
             </div>
           </div>
           <div className="w-[80vw] flex-shrink-0 h-[350px] bg-sky-400 rounded-t-[2.5rem] rounded-b-2xl snap-center relative shadow-sm overflow-hidden group">
             <div className={`absolute inset-0 transition-all duration-700 ease-in-out ${fadingIndices.includes(4) ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'}`}>
               <img src={images[4]} alt="Gallery Item" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
             </div>
           </div>
        </div>

        {/* Mobile Badge/Avatars */}
        <div className="md:hidden flex items-center justify-between mt-4 border-t border-neutral-100 pt-8">
          <div className="flex items-center gap-3">
            <button className="w-12 h-12 bg-neutral-900 rounded-full flex items-center justify-center text-white">
              <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6z"></path></svg>
            </button>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Watch Video</span>
          </div>
           <div className="flex -space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white text-lg">👨‍🦱</div>
            <div className="w-10 h-10 rounded-full bg-purple-500 border-2 border-white flex items-center justify-center text-white text-lg">👩🏻</div>
            <div className="w-10 h-10 rounded-full bg-neutral-900 border-2 border-white flex items-center justify-center text-white text-sm font-bold z-10">
              +
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
