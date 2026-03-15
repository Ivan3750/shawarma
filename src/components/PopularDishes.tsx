import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import durumImg from "@/assets/durum-shawarma.jpg";
import pizzaImg from "@/assets/pepperoni-pizza.jpg";
import burgerImg from "@/assets/mexico-burger.jpg";
import chickenImg from "@/assets/crispy-chicken.jpg";

const dishes = [
  { name: "Durum Shawarma", price: "59 kr", desc: "Grillet kød, friske grøntsager og cremet dressing.", img: durumImg },
  { name: "Pepperoni Pizza", price: "79 kr", desc: "Klassisk pizza med mozzarella og pepperoni.", img: pizzaImg },
  { name: "Mexico Burger", price: "72 kr", desc: "Saftig burger med jalapeños og chipotle.", img: burgerImg },
  { name: "Crispy Chicken", price: "72 kr", desc: "Sprød kyllingefilet med coleslaw.", img: chickenImg },
];

const PopularDishes = () => {
  return (
    <section id="popular" className="py-16 md:py-24 px-4">
      <div className="container max-w-6xl">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-xs font-semibold text-primary tracking-widest uppercase">Populært</span>
            <h2 className="text-2xl md:text-3xl text-foreground mt-1">Mest bestilte</h2>
          </div>
          <a href="#menu" className="text-sm font-medium text-primary hover:underline underline-offset-4">
            Se hele menuen →
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {dishes.map((dish, i) => (
            <motion.div
              key={dish.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className="group cursor-pointer rounded-2xl overflow-hidden border border-border bg-card hover:border-primary/30 transition-colors"
            >
              <div className="aspect-[4/3] overflow-hidden relative">
                
                <div className="w-full h-full bg-blue-100">

                </div>
                <button className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-foreground text-[15px]">{dish.name}</h3>
                  <span className="text-sm font-semibold text-primary whitespace-nowrap">{dish.price}</span>
                </div>
                <p className="text-muted-foreground text-sm mt-1 leading-relaxed">{dish.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularDishes;
