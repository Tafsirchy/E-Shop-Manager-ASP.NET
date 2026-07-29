export default function AboutPage() {
  return (
    <div className="bg-white min-h-screen pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-20">
          <h1 className="text-[12vw] sm:text-[10vw] leading-none font-black tracking-tighter uppercase text-black">
            The<br />Vision.
          </h1>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24 mb-32">
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-neutral-100">
            <img 
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800" 
              alt="Fashion Editorial" 
              className="absolute inset-0 w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 hover:scale-105 mix-blend-multiply"
            />
          </div>
          
          <div className="flex flex-col justify-center">
            <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight mb-8">Redefining Modern Retail.</h2>
            <p className="text-neutral-500 leading-relaxed mb-6 text-lg">
              E-Shop is not just a marketplace; it is a curated destination for the avant-garde. Founded with the rebellious spirit of modern design, our collections bridge the gap between high fashion and everyday utility.
            </p>
            <p className="text-neutral-500 leading-relaxed mb-12 text-lg">
              We believe in fewer, better things. Every piece in our collection is rigorously selected to ensure the highest quality, sustainability, and an aesthetic that defies trends.
            </p>
            
            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-neutral-200">
              <div>
                <span className="block text-5xl font-black mb-2 text-black">2026</span>
                <span className="text-neutral-400 font-mono text-xs uppercase tracking-widest font-bold">Established</span>
              </div>
              <div>
                <span className="block text-5xl font-black mb-2 text-black">50+</span>
                <span className="text-neutral-400 font-mono text-xs uppercase tracking-widest font-bold">Curated Brands</span>
              </div>
            </div>
          </div>
        </div>

        {/* Full width image banner */}
        <div className="w-full aspect-[21/9] bg-neutral-900 rounded-3xl overflow-hidden relative group cursor-pointer mb-20">
          <img 
            src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=1600" 
            alt="Atelier" 
            className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity duration-700 mix-blend-luminosity group-hover:scale-105"
          />
          <div className="absolute inset-0 flex items-center justify-center">
             <h2 className="text-white text-3xl sm:text-6xl font-black tracking-widest uppercase">Our Atelier</h2>
          </div>
        </div>

      </div>
    </div>
  );
}
