import React from 'react';
import { Headphones, Globe, Star } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center">
              <Headphones className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-white">
              Radio <span className="text-orange-400">Zigomar</span>
            </h1>
          </div>
          
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Votre station radio préférée en Tunisie. Écoutez de la musique, des émissions et des informations 24h/24.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-8 text-white/60">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              <span>98.3 FM</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              <span>Streaming HD</span>
            </div>
            <div className="flex items-center gap-2">
              <Headphones className="w-5 h-5" />
              <span>24/7 Live</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-orange-400/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>
    </header>
  );
};

export default Header;