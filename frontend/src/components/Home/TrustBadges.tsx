export default function TrustBadges() {
  const items = [
    { text: "FAST DELIVERY", sub: "Within 48 hours" },
    { text: "SECURE PAYMENTS", sub: "100% Safe Checkout" },
    { text: "EASY RETURNS", sub: "7-Day Policy" },
    { text: "24/7 SUPPORT", sub: "Always here for you" },
    { text: "PREMIUM QUALITY", sub: "Guaranteed" },
  ];

  // Double the items for seamless infinite scroll
  const marqueeItems = [...items, ...items];

  return (
    <section className="bg-neutral-900 text-white overflow-hidden py-5 border-y border-neutral-800">
      <div className="flex whitespace-nowrap animate-ticker w-max hover:[animation-play-state:paused] cursor-default">
        {/* First Set */}
        <div className="flex px-4">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-8 mx-8">
              <span className="text-sm font-bold tracking-[0.2em] uppercase">{item.text}</span>
              <span className="text-xs text-neutral-400 tracking-wider">({item.sub})</span>
              <span className="text-neutral-700 text-xl">✦</span>
            </div>
          ))}
        </div>
        {/* Duplicate Set for Seamless Loop */}
        <div className="flex px-4">
          {items.map((item, idx) => (
            <div key={`dup-${idx}`} className="flex items-center gap-8 mx-8">
              <span className="text-sm font-bold tracking-[0.2em] uppercase">{item.text}</span>
              <span className="text-xs text-neutral-400 tracking-wider">({item.sub})</span>
              <span className="text-neutral-700 text-xl">✦</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
