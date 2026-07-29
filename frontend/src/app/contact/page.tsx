export default function ContactPage() {
  return (
    <div className="bg-white min-h-screen pt-12 pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-24">
          <h1 className="text-[12vw] sm:text-[10vw] leading-none font-black tracking-tighter uppercase text-black">
            Get In<br />Touch.
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 lg:gap-24">
          
          {/* Contact Details */}
          <div className="col-span-1 md:col-span-5">
            <div className="mb-12">
              <h3 className="text-sm font-black uppercase tracking-widest mb-4 border-b border-neutral-200 pb-2">Inquiries</h3>
              <a href="mailto:hello@eshop.com" className="text-2xl sm:text-3xl font-bold hover:text-red-500 transition-colors">hello@eshop.com</a>
            </div>
            
            <div className="mb-12">
              <h3 className="text-sm font-black uppercase tracking-widest mb-4 border-b border-neutral-200 pb-2">Studio / Headquarters</h3>
              <address className="not-italic text-neutral-500 text-lg leading-relaxed">
                123 Fashion Avenue<br />
                Industrial District<br />
                Dhaka, Bangladesh 1212
              </address>
            </div>
            
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest mb-4 border-b border-neutral-200 pb-2">Social</h3>
              <div className="flex flex-col gap-3">
                <a href="#" className="text-lg font-bold text-neutral-600 hover:text-red-500 transition-colors uppercase tracking-widest">Instagram</a>
                <a href="#" className="text-lg font-bold text-neutral-600 hover:text-red-500 transition-colors uppercase tracking-widest">X / Twitter</a>
                <a href="#" className="text-lg font-bold text-neutral-600 hover:text-red-500 transition-colors uppercase tracking-widest">LinkedIn</a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="col-span-1 md:col-span-7">
            <form className="space-y-12 bg-neutral-50 p-10 sm:p-16 rounded-[2rem]">
              <div className="relative">
                <input 
                  type="text" 
                  id="name"
                  placeholder=" "
                  className="block w-full px-0 py-4 text-xl bg-transparent border-0 border-b-2 border-neutral-300 appearance-none focus:outline-none focus:ring-0 focus:border-black peer"
                />
                <label 
                  htmlFor="name"
                  className="absolute text-lg text-neutral-400 duration-300 transform -translate-y-8 scale-75 top-4 z-10 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-8 uppercase font-bold tracking-widest pointer-events-none"
                >
                  Your Name
                </label>
              </div>

              <div className="relative">
                <input 
                  type="email" 
                  id="email"
                  placeholder=" "
                  className="block w-full px-0 py-4 text-xl bg-transparent border-0 border-b-2 border-neutral-300 appearance-none focus:outline-none focus:ring-0 focus:border-black peer"
                />
                <label 
                  htmlFor="email"
                  className="absolute text-lg text-neutral-400 duration-300 transform -translate-y-8 scale-75 top-4 z-10 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-8 uppercase font-bold tracking-widest pointer-events-none"
                >
                  Email Address
                </label>
              </div>

              <div className="relative">
                <textarea 
                  id="message"
                  rows={4}
                  placeholder=" "
                  className="block w-full px-0 py-4 text-xl bg-transparent border-0 border-b-2 border-neutral-300 appearance-none focus:outline-none focus:ring-0 focus:border-black peer resize-none"
                ></textarea>
                <label 
                  htmlFor="message"
                  className="absolute text-lg text-neutral-400 duration-300 transform -translate-y-8 scale-75 top-4 z-10 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-8 uppercase font-bold tracking-widest pointer-events-none"
                >
                  Message
                </label>
              </div>
              
              <button 
                type="submit"
                className="w-full bg-black text-white font-black uppercase tracking-widest py-6 text-sm rounded-full hover:bg-red-500 hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] transition-all duration-300 transform hover:-translate-y-1 mt-8"
              >
                Send Message
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
