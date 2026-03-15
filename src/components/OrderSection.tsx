import { motion } from "framer-motion";
import { Truck, ShoppingBag, Phone } from "lucide-react";

const options = [
  { icon: Truck, label: "Levering", desc: "Levering direkte til din dør.", href: "#", color: "bg-orange-50 text-primary" },
  { icon: ShoppingBag, label: "Afhentning", desc: "Bestil og hent selv i butikken.", href: "#", color: "bg-blue-50 text-blue-600" },
  { icon: Phone, label: "Ring & bestil", desc: "Ring direkte til os.", href: "tel:+4512345678", color: "bg-emerald-50 text-emerald-600" },
];

const OrderSection = () => {
  return (
    <section id="order" className="py-16 md:py-24 px-4">
      <div className="container max-w-4xl">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold text-primary tracking-widest uppercase">Bestil</span>
          <h2 className="text-2xl md:text-3xl text-foreground mt-1">Hvordan vil du bestille?</h2>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto text-sm">
            Vælg den måde der passer dig bedst — vi sørger for resten.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {options.map((opt, i) => (
            <motion.a
              key={opt.label}
              href={opt.href}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="rounded-2xl p-6 border border-border bg-card flex flex-col items-center gap-4 hover:border-primary/30 transition-colors text-center group"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${opt.color}`}>
                <opt.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-foreground text-base">{opt.label}</h3>
              <p className="text-muted-foreground text-sm">{opt.desc}</p>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OrderSection;
