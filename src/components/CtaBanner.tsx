import { ArrowRight } from "lucide-react";

const CtaBanner = () => {
  return (
    <section className="py-16 md:py-24 px-4 bg-foreground">
      <div className="container max-w-4xl text-center">
        <h2 className="text-2xl md:text-3xl text-background mb-4">
          Sulten? Bestil nu.
        </h2>
        <p className="text-background/60 mb-8 max-w-md mx-auto">
          Frisk mad klar til afhentning eller levering — hurtigt og nemt.
        </p>
        <a
          href="#order"
          className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-full text-base hover:brightness-110 transition-all"
        >
          Start din bestilling
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </section>
  );
};

export default CtaBanner;
