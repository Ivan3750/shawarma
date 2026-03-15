import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import PopularDishes from "@/components/PopularDishes";
import MenuPreview from "@/components/MenuPreview";
import OrderSection from "@/components/OrderSection";
import CtaBanner from "@/components/CtaBanner";
import LocationSection from "@/components/LocationSection";
import AboutSection from "@/components/AboutSection";
import FooterSection from "@/components/FooterSection";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <PopularDishes />
      <MenuPreview />
      <OrderSection />
      <CtaBanner />
      <LocationSection />
      <AboutSection />
      <FooterSection />
    </main>
  );
};

export default Index;
