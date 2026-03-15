import { MapPin, Clock, Phone } from "lucide-react";

const hours = [
  { day: "Mandag – Torsdag", time: "11:00 – 22:00" },
  { day: "Fredag – Lørdag", time: "11:00 – 23:00" },
  { day: "Søndag", time: "12:00 – 22:00" },
];

const LocationSection = () => {
  return (
    <section id="location" className="py-16 md:py-24 px-4 bg-surface">
      <div className="container max-w-6xl">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold text-primary tracking-widest uppercase">Lokation</span>
          <h2 className="text-2xl md:text-3xl text-foreground mt-1">Find os</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-border overflow-hidden aspect-[4/3]">
            <iframe
              title="Shawarma Town location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2226.8!2d9.864!3d55.862!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTXCsDUxJzQzLjIiTiA5wrA1MScxOS40IkU!5e0!3m2!1sda!2sdk!4v1"
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div className="space-y-8">
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm mb-1">Adresse</h3>
                <p className="text-muted-foreground text-sm">Graven 18, 8700 Horsens, Denmark</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm mb-1">Åbningstider</h3>
                <div className="space-y-1.5">
                  {hours.map((h) => (
                    <div key={h.day} className="flex justify-between gap-8 text-sm">
                      <span className="text-muted-foreground">{h.day}</span>
                      <span className="text-foreground font-medium tabular-nums">{h.time}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-emerald-600 text-sm font-medium">Åben nu</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm mb-1">Ring til os</h3>
                <a href="tel:+4512345678" className="text-primary font-semibold text-sm hover:underline underline-offset-4">
                  +45 12 34 56 78
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationSection;
