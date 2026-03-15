import { motion } from "framer-motion";

const AboutSection = () => {
  return (
    <section id="about" className="py-16 md:py-24 px-4">
      <div className="container max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">

        {/* Image placeholder */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className="w-full h-[320px] md:h-[380px] rounded-2xl bg-muted flex items-center justify-center text-muted-foreground border border-border">
            Foto af restaurant
          </div>
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-xs font-semibold text-primary tracking-widest uppercase">
            Om os
          </span>

          <h2 className="text-2xl md:text-3xl font-semibold text-foreground mt-2 mb-6">
            Vores historie
          </h2>

          <p className="text-muted-foreground text-lg leading-relaxed mb-4">
            Shawarma Town er et lokalt takeaway-sted i Horsens, hvor passion for
            god mad møder hurtig og venlig service. Vi specialiserer os i frisk
            shawarma, pizza, saftige burgere og klassiske grillretter – altid
            lavet med kvalitetsingredienser.
          </p>

          <p className="text-muted-foreground text-lg leading-relaxed mb-4">
            Vores mål er at give vores gæster en smagfuld oplevelse, uanset om du
            bestiller til afhentning, levering eller bare stopper forbi efter et
            hurtigt måltid. Hos os finder du både klassiske favoritter og
            populære street food-retter.
          </p>

          <p className="text-muted-foreground text-lg leading-relaxed mb-4">
            Shawarma Town er kendt i Horsens for generøse portioner, frisklavet
            mad og åbningstider der passer perfekt til både frokost, aftensmad
            og sene natcravings.
          </p>
        </motion.div>

      </div>
    </section>
  );
};

export default AboutSection;