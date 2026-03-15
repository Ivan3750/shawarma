import { Instagram, Facebook } from "lucide-react";

const FooterSection = () => {
  return (
    <footer className="border-t border-border py-12 px-4">
      <div className="container max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-display text-lg text-foreground mb-2">SHAWARMA TOWN</h3>
            <p className="text-muted-foreground text-sm">
              Fresh shawarma, pizza & burgers i Horsens.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-foreground mb-2">Adresse</h4>
            <p className="text-muted-foreground text-sm">Graven 18, 8700 Horsens</p>
            <p className="text-muted-foreground text-sm">Denmark</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-foreground mb-2">Kontakt</h4>
            <a href="tel:+4512345678" className="text-primary text-sm hover:underline underline-offset-4 block mb-3">
              +45 12 34 56 78
            </a>
            <div className="flex gap-3">
              <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" aria-label="Facebook" className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-border pt-6 text-center">
          <p className="text-muted-foreground/50 text-xs">
            Demo website concept created as a design example.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
