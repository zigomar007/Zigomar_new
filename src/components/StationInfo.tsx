import React from 'react';
import { MapPin, Clock, Users, Mic } from 'lucide-react';

const StationInfo: React.FC = () => {
  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl">
      <h2 className="text-2xl font-bold text-white mb-6">À propos de la station</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Localisation</p>
              <p className="text-white font-semibold">Tunisie</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Diffusion</p>
              <p className="text-white font-semibold">24h/24 - 7j/7</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Auditeurs</p>
              <p className="text-white font-semibold">En ligne maintenant</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Mic className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Qualité</p>
              <p className="text-white font-semibold">HD Streaming</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl">
        <p className="text-white/80 text-sm leading-relaxed">
          Radio Zigomar 98.3 FM vous accompagne tout au long de la journée avec une programmation variée : 
          musique, informations, divertissement et émissions culturelles. Restez connectés pour ne rien manquer 
          de vos programmes préférés.
        </p>
      </div>
    </div>
  );
};

export default StationInfo;