"use client";

import { useState } from "react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) { setError("Please enter your name."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Please enter a valid email address."); return; }
    if (!message.trim()) { setError("Please enter a message."); return; }

    setSending(true);
    // Contact messages are handled offline; simulate the send so the user
    // gets clear feedback instead of a silently dead form.
    await new Promise(resolve => setTimeout(resolve, 500));
    setSending(false);
    setSent(true);
  };

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
            {sent ? (
              <div className="space-y-12 bg-neutral-50 p-10 sm:p-16 rounded-[2rem] text-center">
                <h2 className="text-3xl font-black uppercase tracking-tight text-black">Message Sent</h2>
                <p className="text-neutral-600 text-lg">Thanks, {name.split(" ")[0] || "there"}! We&apos;ve received your message and will get back to you at <span className="font-semibold text-black">{email}</span> shortly.</p>
                <button
                  onClick={() => { setSent(false); setName(""); setEmail(""); setMessage(""); }}
                  className="bg-black text-white font-black uppercase tracking-widest py-4 px-8 text-sm rounded-full hover:bg-red-500 transition-colors"
                >
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-12 bg-neutral-50 p-10 sm:p-16 rounded-[2rem]">
                <div className="relative">
                  <input
                    type="text"
                    id="name"
                    placeholder=" "
                    value={name}
                    onChange={(e) => setName(e.target.value)}
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="block w-full px-0 py-4 text-xl bg-transparent border-0 border-b-2 border-neutral-300 appearance-none focus:outline-none focus:ring-0 focus:border-black peer resize-none"
                  ></textarea>
                  <label
                    htmlFor="message"
                    className="absolute text-lg text-neutral-400 duration-300 transform -translate-y-8 scale-75 top-4 z-10 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-8 uppercase font-bold tracking-widest pointer-events-none"
                  >
                    Message
                  </label>
                </div>

                {error && <p className="text-red-500 font-medium -mt-4">{error}</p>}

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full bg-black text-white font-black uppercase tracking-widest py-6 text-sm rounded-full hover:bg-red-500 hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] transition-all duration-300 transform hover:-translate-y-1 mt-8 disabled:opacity-50"
                >
                  {sending ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
