import Link from 'next/link';

export default function Categories() {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground">Shop by Category</h2>
          <p className="text-neutral-500 mt-2">Find exactly what you are looking for</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link href="/product?category=Electronics" className="group block relative h-64 rounded-2xl overflow-hidden shadow-md">
            <div className="absolute inset-0 bg-neutral-800 transition-transform group-hover:scale-105 duration-500"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
            <div className="absolute bottom-0 left-0 p-6 z-20">
              <h3 className="text-2xl font-bold text-white group-hover:text-accent-400 transition-colors">Electronics</h3>
              <p className="text-neutral-300 text-sm mt-1">Latest gadgets & devices</p>
            </div>
          </Link>
          <Link href="/product?category=Clothing" className="group block relative h-64 rounded-2xl overflow-hidden shadow-md">
            <div className="absolute inset-0 bg-neutral-700 transition-transform group-hover:scale-105 duration-500"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
            <div className="absolute bottom-0 left-0 p-6 z-20">
              <h3 className="text-2xl font-bold text-white group-hover:text-accent-400 transition-colors">Clothing</h3>
              <p className="text-neutral-300 text-sm mt-1">Trending fashion wear</p>
            </div>
          </Link>
          <Link href="/product?category=Books" className="group block relative h-64 rounded-2xl overflow-hidden shadow-md">
            <div className="absolute inset-0 bg-neutral-600 transition-transform group-hover:scale-105 duration-500"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
            <div className="absolute bottom-0 left-0 p-6 z-20">
              <h3 className="text-2xl font-bold text-white group-hover:text-accent-400 transition-colors">Books</h3>
              <p className="text-neutral-300 text-sm mt-1">Bestsellers & new releases</p>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
