import React from 'react';
import { Heart, Radio, Globe } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black/20 backdrop-blur-lg border-t border-white/10">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Radio className="w-6 h-6 text-orange-400" />
              <h3 className="text-xl font-bold text-white">Radio Zigomar</h3>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              Votre station radio préférée en Tunisie. Écoutez-nous 24h/24 pour la meilleure musique 
              et les dernières informations.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Fréquences</h4>
            <ul className="space-y-2 text-white/60">
              <li>98.3 FM - Tunis</li>
              <li>Streaming HD en ligne</li>
              <li>Application mobile</li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-2 text-white/60">
              <li>Studio: +216 XX XXX XXX</li>
              <li>Email: contact@radiozigomar.tn</li>
              <li>Adresse: Tunis, Tunisie</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 mt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-white/60">
              <Globe className="w-4 h-4" />
              <span className="text-sm">© 2024 Radio Zigomar 98.3 FM. Tous droits réservés.</span>
            </div>
            <div className="flex items-center gap-1 text-white/60">
              <span className="text-sm">Fait avec</span>
              <Heart className="w-4 h-4 text-red-400 fill-current" />
              <span className="text-sm">en Tunisie</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;