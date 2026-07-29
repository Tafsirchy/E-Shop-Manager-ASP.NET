import Link from 'next/link';

export default function SubscriptionPromo() {
  return (
    <section className="py-20 bg-card border-t border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1">
            <h2 className="text-4xl font-bold text-foreground mb-4">Subscribe & Save More</h2>
            <p className="text-lg text-neutral-600 mb-8 leading-relaxed">
              Build your own custom package with our advanced Subscription System. Choose what you need, set your delivery frequency, and enjoy dynamic pricing discounts!
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center text-neutral-700"><span className="text-success-500 mr-3 text-xl">✔️</span> Monthly or Yearly Plans</li>
              <li className="flex items-center text-neutral-700"><span className="text-success-500 mr-3 text-xl">✔️</span> Flexible Custom Package Builder</li>
              <li className="flex items-center text-neutral-700"><span className="text-success-500 mr-3 text-xl">✔️</span> Priority Support</li>
            </ul>
            <Link href="/subscriptions" className="inline-block px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors shadow-md">
              Explore Subscriptions
            </Link>
          </div>
          <div className="flex-1 w-full relative">
            <div className="aspect-video bg-neutral-100 rounded-2xl shadow-inner border border-border flex items-center justify-center overflow-hidden relative">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-200 rounded-full blur-3xl opacity-60"></div>
              <div className="text-primary-600 text-8xl relative z-10 animate-bounce" style={{ animationDuration: '3s' }}>📦</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
