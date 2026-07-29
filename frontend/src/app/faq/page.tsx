export default function FAQPage() {
  const faqs = [
    {
      question: "How long does shipping take?",
      answer: "Domestic orders typically arrive within 2-4 business days. International shipping can take anywhere from 7-14 business days depending on the destination and customs processing."
    },
    {
      question: "What is your return policy?",
      answer: "We accept returns within 14 days of delivery for all unworn and unwashed items with original tags attached. Final sale items cannot be returned or exchanged."
    },
    {
      question: "Do you ship internationally?",
      answer: "Yes, we ship globally. Shipping costs and delivery times are calculated at checkout based on your location."
    },
    {
      question: "How do the VIP Club tiers work?",
      answer: "Our VIP Club is based on your lifetime spend. As you reach new thresholds, your tier is automatically upgraded, unlocking exclusive discounts, early access to drops, and priority customer service."
    },
    {
      question: "Can I cancel or change my order?",
      answer: "Orders can only be modified or canceled within 1 hour of placement. After this window, our fulfillment team begins processing the order and changes cannot be guaranteed."
    },
    {
      question: "Are your garments sustainable?",
      answer: "We are committed to ethical production. 80% of our collections use recycled or organic materials, and we partner exclusively with factories that enforce fair labor practices."
    }
  ];

  return (
    <div className="bg-white min-h-screen pt-12 pb-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-20 text-center">
          <h1 className="text-[12vw] sm:text-[8vw] leading-none font-black tracking-tighter uppercase text-black mb-4">
            F.A.Q.
          </h1>
          <p className="text-neutral-500 font-medium uppercase tracking-widest text-sm">Frequently Asked Questions</p>
        </div>

        {/* FAQ List */}
        <div className="space-y-0 border-t-2 border-black">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b-2 border-neutral-200 py-8 group hover:border-black transition-colors duration-300">
              <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-black mb-4 group-hover:text-red-500 transition-colors">
                {faq.question}
              </h3>
              <p className="text-neutral-500 text-lg leading-relaxed max-w-3xl">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
        
        <div className="mt-20 text-center">
          <p className="text-neutral-500 mb-4">Still have questions?</p>
          <a href="/contact" className="inline-block border-2 border-black px-10 py-4 text-black font-black uppercase tracking-widest text-sm hover:bg-black hover:text-white transition-colors">
            Contact Support
          </a>
        </div>

      </div>
    </div>
  );
}
