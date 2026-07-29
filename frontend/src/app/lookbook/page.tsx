import Link from 'next/link';

export default function LookbookPage() {
  const images = [
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=800",
  ];

  return (
    <div className="bg-white min-h-screen pt-12 pb-32">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-16 flex flex-col items-center text-center">
          <h1 className="text-[12vw] sm:text-[8vw] leading-none font-black tracking-tighter uppercase text-black mb-4">
            Lookbook
          </h1>
          <p className="text-neutral-500 font-medium uppercase tracking-widest text-sm max-w-xl mx-auto">
            Collection 001 — A visual exploration of our latest seasonal drops and avant-garde styling.
          </p>
        </div>

        {/* Masonry Grid Simulation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {images.map((src, index) => (
            <div 
              key={index} 
              className={`relative overflow-hidden group bg-neutral-100 ${index % 3 === 0 ? 'aspect-[3/4]' : 'aspect-square'}`}
            >
              <img 
                src={src} 
                alt={`Lookbook ${index + 1}`} 
                className="absolute inset-0 w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500 pointer-events-none"></div>
            </div>
          ))}
        </div>
        
        <div className="mt-20 flex justify-center">
          <Link href="/product" className="inline-block bg-black px-12 py-5 text-white font-black uppercase tracking-widest text-sm hover:bg-red-500 hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] transition-all duration-300 transform hover:-translate-y-1">
            Shop The Collection
          </Link>
        </div>

      </div>
    </div>
  );
}
