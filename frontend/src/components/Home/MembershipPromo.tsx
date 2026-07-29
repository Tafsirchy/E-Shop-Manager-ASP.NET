import Link from 'next/link';

export default function MembershipPromo() {
  return (
    <section className="py-32 bg-white relative overflow-hidden border-b border-neutral-100">
      {/* Decorative large background text */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none opacity-[0.02] overflow-hidden whitespace-nowrap">
        <h2 className="text-[12rem] md:text-[20rem] font-black tracking-tighter uppercase leading-none">VIP CLUB</h2>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* The "Black Card" Interface */}
        <div className="w-full bg-neutral-900 rounded-[2.5rem] p-10 sm:p-16 lg:p-24 shadow-[0_30px_60px_rgba(0,0,0,0.25)] relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-16 group">
          
          {/* Abstract background effects inside the card */}
          <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-800 via-neutral-900 to-neutral-900 opacity-60 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 group-hover:from-neutral-700 transition-colors duration-700"></div>

          <div className="relative z-10 flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/5 rounded-full border border-white/10 mb-8 backdrop-blur-md">
               <span className="w-2 h-2 bg-yellow-500 rounded-full shadow-[0_0_10px_rgba(234,179,8,0.8)] animate-pulse"></span>
               <span className="text-white text-[0.65rem] font-black uppercase tracking-[0.2em]">Exclusive Access</span>
            </div>
            
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.9] mb-6">
              Join Our<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-400 to-white">VIP Club</span>
            </h2>
            
            <p className="text-neutral-400 text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium mb-10">
              Earn reward points on every purchase. Upgrade your tier automatically based on lifetime spending and unlock exclusive discounts, early drops, and priority shipping.
            </p>
            
            <Link href="/membership" className="inline-flex items-center justify-center px-10 py-5 bg-white text-black font-black uppercase tracking-widest text-sm rounded-full hover:bg-neutral-200 hover:scale-[1.02] transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.15)]">
              Discover Rewards
            </Link>
          </div>

          {/* Visual Element on Right: Floating Credit Card */}
          <div className="relative z-10 hidden lg:block w-full max-w-md perspective-1000">
             
             {/* Custom Keyframes for Floating Animation */}
             <style>{`
               @keyframes float-card {
                 0% { transform: translateY(0px); }
                 50% { transform: translateY(-15px); }
                 100% { transform: translateY(0px); }
               }
               @keyframes shimmer {
                 100% { transform: translateX(100%); }
               }
             `}</style>
             
             <div 
               className="relative w-full aspect-[1.6/1] bg-gradient-to-br from-neutral-800 via-neutral-900 to-black rounded-3xl border border-neutral-700 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden group-hover:shadow-[0_30px_60px_rgba(255,255,255,0.05)] transition-all duration-700"
               style={{ animation: 'float-card 6s ease-in-out infinite' }}
             >
                {/* Shimmer Sweep Animation */}
                <div className="absolute top-0 -inset-full h-full w-1/2 z-20 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50" style={{ animation: 'shimmer 3s infinite' }}></div>
                
                {/* Abstract metallic texture */}
                <div className="absolute inset-0 opacity-20 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                
                {/* Wave pattern / Light reflection */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                
                {/* Top Section: Logo & Contactless */}
                <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
                  <div className="text-white font-black uppercase tracking-tighter text-2xl opacity-90">
                    E<span className="text-neutral-500">Shop</span>
                  </div>
                  {/* Contactless Icon */}
                  <svg className="w-6 h-6 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 2v20c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V2" stroke="none"/>
                    <path d="M12 4c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8z" stroke="none"/>
                    <path d="M8.5 15.5a5 5 0 0 1 0-7.1" />
                    <path d="M11 17a7 7 0 0 1 0-9.9" />
                    <path d="M13.5 18.5a9 9 0 0 1 0-12.7" />
                  </svg>
                </div>

                {/* Card Chip */}
                <div className="absolute top-20 left-8 w-12 h-9 border border-yellow-700/60 rounded-md flex items-center justify-center bg-gradient-to-br from-yellow-500/30 to-yellow-900/30 shadow-inner z-10">
                   <div className="w-8 h-5 border border-yellow-600/40 rounded-sm"></div>
                   <div className="absolute w-full h-[1px] bg-yellow-700/40 top-1/2 transform -translate-y-1/2"></div>
                   <div className="absolute h-full w-[1px] bg-yellow-700/40 left-1/2 transform -translate-x-1/2"></div>
                </div>
                
                {/* Card Number */}
                <div className="absolute bottom-16 left-8 text-neutral-200 font-mono text-xl sm:text-2xl tracking-[0.15em] sm:tracking-[0.2em] opacity-90 z-10 shadow-black drop-shadow-md">
                  4242 8901 2345 9021
                </div>
                
                {/* Bottom Section: Details */}
                <div className="absolute bottom-6 left-8 right-8 flex justify-between items-end z-10">
                  <div className="flex flex-col">
                    <span className="text-neutral-500 font-mono text-[0.6rem] tracking-widest uppercase mb-1">Cardholder</span>
                    <span className="text-neutral-300 font-mono text-sm tracking-widest uppercase shadow-black drop-shadow-md">
                      JANE DOE
                    </span>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <span className="text-neutral-500 font-mono text-[0.6rem] tracking-widest uppercase mb-1">Valid Thru</span>
                    <span className="text-neutral-300 font-mono text-sm tracking-widest shadow-black drop-shadow-md">
                      12/28
                    </span>
                  </div>
                </div>

                {/* VIP Label */}
                <div className="absolute bottom-6 right-28 flex flex-col items-center justify-center opacity-80 z-10">
                  <span className="text-yellow-600 font-bold text-[0.55rem] tracking-[0.3em] uppercase">Status</span>
                  <span className="text-yellow-500 font-black text-xs tracking-widest uppercase">VIP</span>
                </div>

             </div>
             
             {/* Glow behind the card */}
             <div 
               className="absolute inset-0 bg-white/5 blur-3xl -z-10 group-hover:bg-white/10 transition-colors duration-700"
               style={{ animation: 'float-card 6s ease-in-out infinite' }}
             ></div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
