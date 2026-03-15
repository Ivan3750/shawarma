import { motion } from "framer-motion";
import heroImg from "@/assets/hero-kebab.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[90svh] flex items-end overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{ backgroundImage: `url(${heroImg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />

      <div className="relative z-10 w-full px-4 pb-16 pt-32 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <span className="inline-block px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full mb-4 tracking-wide">
            HORSENS · TAKEAWAY
          </span>
          <h1 className="text-[clamp(2.5rem,8vw,5rem)] leading-[0.95] text-white mb-4">
            SHAWARMA<br />TOWN
          </h1>
          <p className="text-white/80 text-lg md:text-xl font-light mb-8 max-w-md">
            Fresh shawarma, pizza & burgers — lavet med kærlighed i Horsens.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="#menu"
              className="px-7 py-3.5 bg-primary text-primary-foreground font-semibold rounded-full text-base hover:brightness-110 transition-all active:scale-95 text-center"
            >
              Se menu
            </a>
            <a
              href="#order"
              className="px-7 py-3.5 bg-white/15 backdrop-blur-sm text-white font-semibold rounded-full text-base border border-white/20 hover:bg-white/25 transition-all active:scale-95 text-center"
            >
              Bestil afhentning
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
