import Hero from "@/components/Home/Hero";
import TrustBadges from "@/components/Home/TrustBadges";
import Categories from "@/components/Home/Categories";
import SubscriptionPromo from "@/components/Home/SubscriptionPromo";
import MembershipPromo from "@/components/Home/MembershipPromo";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Hero />
      <TrustBadges />
      <Categories />
      <SubscriptionPromo />
      <MembershipPromo />
      <Footer />
    </main>
  );
}
