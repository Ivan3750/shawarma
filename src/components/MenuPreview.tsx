import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";

const categories = [
  {
    id: "shawarma",
    name: "Shawarma & Durum",
    emoji: "🌯",
    items: [
      { name: "Durum Shawarma", price: "59 kr", desc: "Grillet kød, salat, tomat, agurk, dressing" },
      { name: "Shawarma Tallerken", price: "69 kr", desc: "Serveret med ris, salat og dressing" },
      { name: "Durum Mix", price: "65 kr", desc: "Blanding af kød med ekstra fyld" },
      { name: "Durum Kylling", price: "59 kr", desc: "Grillet kylling med friske grøntsager" },
    ],
  },
  {
    id: "pita",
    name: "Pitabrød",
    emoji: "🥙",
    items: [
      { name: "Pitabrød Shawarma", price: "55 kr", desc: "Klassisk pita med shawarma kød" },
      { name: "Pitabrød Falafel", price: "50 kr", desc: "Sprøde falafler med hummus og salat" },
      { name: "Pitabrød Kylling", price: "55 kr", desc: "Grillet kylling i varmt pitabrød" },
    ],
  },
  {
    id: "pizza",
    name: "Pizza",
    emoji: "🍕",
    items: [
      { name: "Pepperoni Pizza", price: "79 kr", desc: "Mozzarella og krydret pepperoni" },
      { name: "Shawarma Pizza", price: "85 kr", desc: "Shawarma kød, løg, tomat, dressing" },
      { name: "Margherita", price: "69 kr", desc: "Tomat, mozzarella og frisk basilikum" },
      { name: "Kebab Pizza", price: "85 kr", desc: "Kebabkød, løg, tomat og dressing" },
    ],
  },
  {
    id: "burgers",
    name: "Burgers",
    emoji: "🍔",
    items: [
      { name: "Cheeseburger", price: "65 kr", desc: "Oksekød, cheddar, salat, tomat" },
      { name: "Mexico Burger", price: "72 kr", desc: "Jalapeños, cheddar og chipotle" },
      { name: "Crispy Chicken Burger", price: "72 kr", desc: "Sprød kylling, coleslaw, pickles" },
      { name: "BBQ Bacon Burger", price: "78 kr", desc: "Bacon, løgringe og BBQ-sauce" },
    ],
  },
  {
    id: "grill",
    name: "Grill",
    emoji: "🔥",
    items: [
      { name: "Grillspyd", price: "55 kr", desc: "Marinerede kødspyd med salat" },
      { name: "Kylling Nuggets (6 stk)", price: "45 kr", desc: "Sprøde nuggets med dip" },
      { name: "Kylling Wings (8 stk)", price: "55 kr", desc: "Krydrede wings med dip" },
    ],
  },
  {
    id: "sides",
    name: "Fries & Sides",
    emoji: "🍟",
    items: [
      { name: "Pommes Frites", price: "30 kr", desc: "Sprøde gyldne fritter" },
      { name: "Cheesy Fries", price: "40 kr", desc: "Fritter med smeltet ost" },
      { name: "Loaded Fries", price: "55 kr", desc: "Fritter med kød, ost og dressing" },
      { name: "Coleslaw", price: "20 kr", desc: "Hjemmelavet cremet coleslaw" },
    ],
  },
];

const MenuPreview = () => {
  const [activeCategory, setActiveCategory] = useState("shawarma");
  const activeItems = categories.find((c) => c.id === activeCategory)?.items ?? [];

  return (
    <section id="menu" className="py-16 md:py-24 px-4 bg-surface">
      <div className="container max-w-6xl">
        <div className="text-center mb-10">
          <span className="text-xs font-semibold text-primary tracking-widest uppercase">Menu</span>
          <h2 className="text-2xl md:text-3xl text-foreground mt-1">Vælg kategori</h2>
        </div>

        {/* Category tabs - Wolt style horizontal scroll */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-8 -mx-4 px-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? "bg-foreground text-background"
                  : "bg-background border border-border text-foreground hover:border-foreground/20"
              }`}
            >
              <span>{cat.emoji}</span>
              {cat.name}
            </button>
          ))}
        </div>

        {/* Menu items - Wolt style list */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
          >
            {activeItems.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between gap-4 p-4 rounded-xl bg-background border border-border hover:border-primary/30 transition-colors cursor-pointer group"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-[15px]">{item.name}</h3>
                  <p className="text-muted-foreground text-sm mt-0.5 truncate">{item.desc}</p>
                  <span className="text-sm font-semibold text-primary mt-1 inline-block">{item.price}</span>
                </div>
                <button className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground group-hover:border-primary group-hover:text-primary transition-colors flex-shrink-0">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default MenuPreview;
