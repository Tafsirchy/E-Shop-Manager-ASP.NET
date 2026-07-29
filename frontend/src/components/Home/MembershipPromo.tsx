import Link from 'next/link';

export default function MembershipPromo() {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-gradient-to-r from-accent-500 to-accent-600 rounded-3xl p-10 sm:p-16 shadow-2xl text-white relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white opacity-10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white opacity-10 rounded-full blur-2xl"></div>
          <h2 className="text-4xl font-bold mb-4 relative z-10">Join Our VIP Club</h2>
          <p className="text-xl mb-8 relative z-10 max-w-2xl mx-auto opacity-90">
            Earn Reward Points on every purchase. Upgrade your role automatically based on lifetime spending and unlock exclusive discounts!
          </p>
          <Link href="/membership" className="inline-block px-8 py-4 bg-white text-accent-600 font-bold rounded-full hover:bg-neutral-50 transition-colors shadow-lg relative z-10">
            Discover Rewards
          </Link>
        </div>
      </div>
    </section>
  );
}
