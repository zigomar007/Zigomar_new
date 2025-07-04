import React, { useState, useEffect } from 'react';
import { Music, Clock, Calendar, Mic2, Radio, AlertCircle, RefreshCw } from 'lucide-react';

interface StationData {
  name: string;
  description: string;
  logo: string;
  current_song?: {
    title: string;
    artist: string;
    album?: string;
    artwork?: string;
  };
  listeners?: number;
  bitrate?: number;
  genre?: string;
  website?: string;
  playlist?: PlaylistItem[];
}

interface PlaylistItem {
  title: string;
  artist: string;
  album?: string;
  artwork?: string;
  played_at: string;
  duration?: number;
}

interface IceCastStatus {
  icestats: {
    source: {
      title: string;
      artist?: string;
      listenurl: string;
      listeners: number;
      bitrate: number;
      server_name: string;
      server_description: string;
      genre: string;
      stream_start: string;
      yp_currently_playing?: string;
    }
  }
}

const CurrentProgram: React.FC = () => {
  const [stationData, setStationData] = useState<StationData | null>(null);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);

  // Fonction pour récupérer les données depuis l'API Instant Audio
  const fetchInstantAudioData = async () => {
    try {
      const response = await fetch('https://api.instant.audio/data/streams/37/zigomar', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Origin': window.location.origin
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur API Instant Audio: ${response.status}`);
      }

      const data = await response.json();
      console.log('Données Instant Audio:', data);
      
      setStationData(data);
      
      if (data.current_song) {
        setCurrentTrack(data.current_song);
      }

      // Si l'API retourne une playlist
      if (data.playlist && Array.isArray(data.playlist)) {
        setPlaylist(data.playlist);
      }

      return data;
    } catch (err) {
      console.error('Erreur Instant Audio:', err);
      throw err;
    }
  };

  // Fonction pour récupérer les métadonnées depuis Zeno.fm
  const fetchZenoMetadata = async () => {
    try {
      // Essayer de récupérer les métadonnées depuis l'API Zeno.fm via le proxy
      const response = await fetch('/zeno-api/mounts/metadata/subscribe/ljjignydycktv', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Métadonnées Zeno:', data);
        
        if (data.streamTitle) {
          const parts = data.streamTitle.split(' - ');
          setCurrentTrack(prev => ({
            ...prev,
            title: parts[1] || data.streamTitle,
            artist: parts[0] || 'Radio Zigomar',
            artwork: 'https://cdn.instant.audio/images/logos/ecouterradioenligne-com/zigomar.png'
          }));
        }
      }
    } catch (err) {
      console.log('Métadonnées Zeno non disponibles:', err);
    }
  };

  // Fonction pour récupérer les données IceCast (si disponible)
  const fetchIceCastData = async () => {
    try {
      // Essayer différentes URLs pour les stats IceCast via le proxy
      const urls = [
        '/zeno-stream/status-json.xsl',
        '/zeno-stream/ljjignydycktv/status-json.xsl'
      ];

      for (const url of urls) {
        try {
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Accept': 'application/json'
            }
          });

          if (response.ok) {
            const data: IceCastStatus = await response.json();
            console.log('Données IceCast:', data);
            
            if (data.icestats && data.icestats.source) {
              const source = data.icestats.source;
              
              setCurrentTrack(prev => ({
                ...prev,
                title: source.title || source.yp_currently_playing || prev?.title,
                artist: source.artist || 'Radio Zigomar',
                artwork: 'https://cdn.instant.audio/images/logos/ecouterradioenligne-com/zigomar.png'
              }));

              setStationData(prev => ({
                ...prev,
                name: source.server_name || 'Radio Zigomar',
                description: source.server_description || 'Radio Zigomar 98.3 FM',
                listeners: source.listeners,
                bitrate: source.bitrate,
                genre: source.genre
              }));
            }
            break;
          }
        } catch (err) {
          console.log(`Erreur avec ${url}:`, err);
        }
      }
    } catch (err) {
      console.log('Données IceCast non disponibles:', err);
    }
  };

  // Fonction pour parser les métadonnées du flux audio
  const parseStreamMetadata = async () => {
    try {
      // Créer un élément audio temporaire pour récupérer les métadonnées
      const audio = new Audio();
      audio.crossOrigin = 'anonymous';
      
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          audio.remove();
          resolve(null);
        }, 5000);

        audio.addEventListener('loadedmetadata', () => {
          clearTimeout(timeout);
          
          // Essayer de récupérer les métadonnées ICY
          const metadata = {
            title: (audio as any).title || '',
            artist: (audio as any).artist || '',
            album: (audio as any).album || ''
          };

          if (metadata.title || metadata.artist) {
            setCurrentTrack(prev => ({
              ...prev,
              ...metadata,
              artwork: 'https://cdn.instant.audio/images/logos/ecouterradioenligne-com/zigomar.png'
            }));
          }

          audio.remove();
          resolve(metadata);
        });

        audio.addEventListener('error', () => {
          clearTimeout(timeout);
          audio.remove();
          resolve(null);
        });

        // Utiliser le proxy pour le flux audio
        audio.src = '/zeno-stream/ljjignydycktv.m3u8';
        audio.load();
      });
    } catch (err) {
      console.log('Impossible de parser les métadonnées du flux:', err);
    }
  };

  // Fonction principale pour récupérer toutes les données
  const fetchAllData = async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    }
    
    try {
      setError(null);
      
      // Essayer toutes les sources de données en parallèle
      const promises = [
        fetchInstantAudioData(),
        fetchZenoMetadata(),
        fetchIceCastData(),
        parseStreamMetadata()
      ];

      await Promise.allSettled(promises);
      
      setLastUpdate(new Date());
      
    } catch (err) {
      console.error('Erreur lors de la récupération des données:', err);
      setError('Impossible de récupérer les données en temps réel');
      
      // Données de fallback
      setCurrentTrack({
        title: 'Radio Zigomar 98.3 FM',
        artist: 'En direct depuis la Tunisie',
        album: 'Streaming Live',
        artwork: 'https://cdn.instant.audio/images/logos/ecouterradioenligne-com/zigomar.png'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Effet pour charger les données initiales
  useEffect(() => {
    fetchAllData();
  }, []);

  // Effet pour mettre à jour les données périodiquement
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAllData();
    }, 15000); // Mise à jour toutes les 15 secondes

    return () => clearInterval(interval);
  }, []);

  // Fonction pour formater l'heure
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Fonction pour formater la date de lecture
  const formatPlayedAt = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  const handleRefresh = () => {
    fetchAllData(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center justify-center h-32">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-white">Chargement des données en direct...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Track */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
            <Music className="w-5 h-5 text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-white">En cours de diffusion</h2>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
              title="Actualiser"
            >
              <RefreshCw className={`w-4 h-4 text-white ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-400 text-sm font-medium">LIVE</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-yellow-500/20 rounded-lg">
            <AlertCircle className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-200 text-sm">{error}</span>
          </div>
        )}

        <div className="flex items-center gap-4">
          <div className="relative">
            <img 
              src={currentTrack?.artwork || stationData?.logo || 'https://cdn.instant.audio/images/logos/ecouterradioenligne-com/zigomar.png'} 
              alt={currentTrack?.title || 'Radio Zigomar'}
              className="w-16 h-16 rounded-xl object-cover shadow-lg"
              onError={(e) => {
                e.currentTarget.src = 'https://cdn.instant.audio/images/logos/ecouterradioenligne-com/zigomar.png';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl"></div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white truncate">
              {currentTrack?.title || stationData?.name || 'Radio Zigomar 98.3 FM'}
            </h3>
            <p className="text-white/70 truncate">
              {currentTrack?.artist || 'En direct depuis la Tunisie'}
            </p>
            {currentTrack?.album && (
              <p className="text-white/50 text-sm truncate">{currentTrack.album}</p>
            )}
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-1 text-white/60 text-sm">
              <Clock className="w-4 h-4" />
              <span>Live</span>
            </div>
            {stationData?.listeners && (
              <div className="text-white/50 text-xs mt-1">
                {stationData.listeners} auditeurs
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-white/50 text-xs">
            <span>Dernière mise à jour: {formatTime(lastUpdate)}</span>
            {stationData?.bitrate && (
              <span>Qualité: {stationData.bitrate} kbps</span>
            )}
          </div>
        </div>
      </div>

      {/* Station Info */}
      {stationData && (
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Radio className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Informations de la station</h2>
          </div>

          <div className="space-y-3">
            <div>
              <h3 className="text-lg font-semibold text-white">{stationData.name}</h3>
              {stationData.description && (
                <p className="text-white/70 text-sm">{stationData.description}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              {stationData.genre && (
                <div>
                  <span className="text-white/60">Genre:</span>
                  <span className="text-white ml-2">{stationData.genre}</span>
                </div>
              )}
              {stationData.bitrate && (
                <div>
                  <span className="text-white/60">Bitrate:</span>
                  <span className="text-white ml-2">{stationData.bitrate} kbps</span>
                </div>
              )}
              {stationData.listeners && (
                <div>
                  <span className="text-white/60">Auditeurs:</span>
                  <span className="text-white ml-2">{stationData.listeners}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Playlist récente */}
      {playlist.length > 0 && (
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Titres récents</h2>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
            {playlist.slice(0, 10).map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                <div className="flex-shrink-0">
                  <img 
                    src={item.artwork || 'https://cdn.instant.audio/images/logos/ecouterradioenligne-com/zigomar.png'} 
                    alt={item.title}
                    className="w-10 h-10 rounded-lg object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://cdn.instant.audio/images/logos/ecouterradioenligne-com/zigomar.png';
                    }}
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-white truncate">{item.title}</h4>
                  <p className="text-white/60 text-sm truncate">{item.artist}</p>
                  {item.album && (
                    <p className="text-white/40 text-xs truncate">{item.album}</p>
                  )}
                </div>
                
                <div className="text-right flex-shrink-0">
                  <div className="text-white/50 text-xs">
                    {formatPlayedAt(item.played_at)}
                  </div>
                  {item.duration && (
                    <div className="text-white/40 text-xs">
                      {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Programme actuel (fallback si pas de playlist) */}
      {playlist.length === 0 && (
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Mic2 className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Programme en cours</h2>
            <div className="flex items-center gap-1 ml-auto">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-blue-400 text-sm font-medium">EN DIRECT</span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <h3 className="text-lg font-semibold text-white">Radio Zigomar 98.3 FM</h3>
              <p className="text-white/70">Diffusion en continu</p>
            </div>
            
            <div className="flex items-center gap-4 text-white/60 text-sm">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>24h/24 - 7j/7</span>
              </div>
            </div>
            
            <p className="text-white/80 text-sm leading-relaxed">
              Écoutez Radio Zigomar en direct depuis la Tunisie. Musique, informations et divertissement 
              tout au long de la journée.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrentProgram;