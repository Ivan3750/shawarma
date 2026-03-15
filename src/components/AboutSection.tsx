const AboutSection = () => {
  return (
    <section id="about" className="py-16 md:py-24 px-4">
      <div className="container max-w-3xl text-center">
        <span className="text-xs font-semibold text-primary tracking-widest uppercase">Om os</span>
        <h2 className="text-2xl md:text-3xl text-foreground mt-1 mb-6">Vores historie</h2>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Shawarma Town er et lokalt takeaway-sted i Horsens, der serverer frisk shawarma, pizza, burgere og grillretter. Perfekt til hurtige måltider og sene natcravings.
        </p>
      </div>
    </section>
  );
};

export default AboutSection;
