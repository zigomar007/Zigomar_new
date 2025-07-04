import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Heart, Radio, Headphones, AlertCircle } from 'lucide-react';
import Hls from 'hls.js';

interface StationMetadata {
  title?: string;
  artist?: string;
  album?: string;
  listeners?: number;
  bitrate?: number;
}

const RadioPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [metadata, setMetadata] = useState<StationMetadata>({
    title: 'Radio Zigomar 98.3 FM',
    artist: 'En direct depuis la Tunisie'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  // URLs de flux de secours utilisant le proxy
  const streamUrls = [
    '/zeno-stream/ljjignydycktv.m3u8',
    '/zeno-stream/ljjignydycktv'
  ];

  useEffect(() => {
    // Initialisation de l'audio avec gestion d'erreur
    const initializeAudio = () => {
      // Nettoyer les instances précédentes
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      audioRef.current = new Audio();
      audioRef.current.volume = volume / 100;
      audioRef.current.crossOrigin = 'anonymous';
      audioRef.current.preload = 'none';

      // Événements audio
      audioRef.current.addEventListener('loadstart', () => {
        setConnectionStatus('connecting');
        setError(null);
      });

      audioRef.current.addEventListener('canplay', () => {
        setConnectionStatus('connected');
        setError(null);
      });

      audioRef.current.addEventListener('error', (e) => {
        console.error('Erreur audio:', e);
        setConnectionStatus('error');
        setError('Erreur de connexion au flux audio');
        setIsPlaying(false);
      });

      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
      });

      audioRef.current.addEventListener('pause', () => {
        setIsPlaying(false);
      });

      audioRef.current.addEventListener('play', () => {
        setIsPlaying(true);
        setConnectionStatus('connected');
      });
    };

    initializeAudio();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Mise à jour du volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Récupération des métadonnées depuis l'API
  const fetchMetadata = async () => {
    try {
      const response = await fetch('https://api.instant.audio/data/streams/37/zigomar', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMetadata({
          title: data.current_song?.title || data.name || 'Radio Zigomar 98.3 FM',
          artist: data.current_song?.artist || 'En direct depuis la Tunisie',
          album: data.current_song?.album,
          listeners: data.listeners,
          bitrate: data.bitrate
        });
      }
    } catch (err) {
      console.log('Impossible de récupérer les métadonnées:', err);
    }
  };

  // Mise à jour périodique des métadonnées
  useEffect(() => {
    fetchMetadata();
    const interval = setInterval(fetchMetadata, 30000);
    return () => clearInterval(interval);
  }, []);

  const isHlsUrl = (url: string): boolean => {
    return url.includes('.m3u8');
  };

  const tryPlayWithUrl = async (url: string): Promise<boolean> => {
    if (!audioRef.current) return false;

    try {
      // Nettoyer l'instance HLS précédente
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      if (isHlsUrl(url)) {
        // Utiliser HLS.js pour les flux .m3u8
        if (Hls.isSupported()) {
          hlsRef.current = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });

          hlsRef.current.loadSource(url);
          hlsRef.current.attachMedia(audioRef.current);

          return new Promise((resolve) => {
            if (!hlsRef.current) {
              resolve(false);
              return;
            }

            hlsRef.current.on(Hls.Events.MANIFEST_PARSED, () => {
              audioRef.current?.play()
                .then(() => resolve(true))
                .catch(() => resolve(false));
            });

            hlsRef.current.on(Hls.Events.ERROR, (event, data) => {
              console.error('Erreur HLS:', data);
              if (data.fatal) {
                resolve(false);
              }
            });
          });
        } else if (audioRef.current.canPlayType('application/vnd.apple.mpegurl')) {
          // Support natif HLS (Safari)
          audioRef.current.src = url;
          await audioRef.current.load();
          await audioRef.current.play();
          return true;
        } else {
          throw new Error('HLS non supporté par ce navigateur');
        }
      } else {
        // Utiliser l'audio natif pour les autres formats
        audioRef.current.src = url;
        await audioRef.current.load();
        await audioRef.current.play();
        return true;
      }
    } catch (error) {
      console.error(`Erreur avec l'URL ${url}:`, error);
      return false;
    }
  };

  const togglePlayPause = async () => {
    if (!audioRef.current) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        // Essayer les différentes URLs de flux
        let success = false;
        for (const url of streamUrls) {
          success = await tryPlayWithUrl(url);
          if (success) break;
        }

        if (!success) {
          throw new Error('Impossible de se connecter au flux audio');
        }
      }
    } catch (error) {
      console.error('Erreur lors de la lecture:', error);
      setError('Impossible de lire le flux audio. Vérifiez votre connexion.');
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // Ici vous pourriez sauvegarder dans localStorage ou une base de données
    if (!isFavorite) {
      localStorage.setItem('radio-zigomar-favorite', 'true');
    } else {
      localStorage.removeItem('radio-zigomar-favorite');
    }
  };

  // Charger l'état des favoris au démarrage
  useEffect(() => {
    const isFav = localStorage.getItem('radio-zigomar-favorite') === 'true';
    setIsFavorite(isFav);
  }, []);

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-400';
      case 'connecting': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connecté';
      case 'connecting': return 'Connexion...';
      case 'error': return 'Erreur';
      default: return 'Déconnecté';
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl">
      {/* Logo and Station Info */}
      <div className="flex items-center gap-6 mb-8">
        <div className="relative">
          <img 
            src="https://cdn.instant.audio/images/logos/ecouterradioenligne-com/zigomar.png" 
            alt="Radio Zigomar" 
            className="w-20 h-20 rounded-2xl shadow-lg"
          />
          <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center ${
            connectionStatus === 'connected' ? 'bg-green-500' : 
            connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
          }`}>
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Radio Zigomar</h1>
          <p className="text-white/70 text-lg">98.3 FM • Tunisia</p>
          <div className="flex items-center gap-4 mt-2">
            <span className={`text-sm ${getConnectionStatusColor()}`}>
              {getConnectionStatusText()}
            </span>
            {metadata.listeners && (
              <span className="text-white/60 text-sm">
                {metadata.listeners} auditeurs
              </span>
            )}
            {metadata.bitrate && (
              <span className="text-white/60 text-sm">
                {metadata.bitrate} kbps
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-3 mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <span className="text-red-200 text-sm">{error}</span>
        </div>
      )}

      {/* Current Track */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <Radio className="w-5 h-5 text-orange-400" />
          <span className="text-white/80 text-sm font-medium">En direct</span>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">{metadata.title}</h2>
        <p className="text-white/70">{metadata.artist}</p>
        {metadata.album && (
          <p className="text-white/50 text-sm mt-1">{metadata.album}</p>
        )}
      </div>

      {/* Player Controls */}
      <div className="flex items-center gap-6 mb-8">
        <button
          onClick={togglePlayPause}
          disabled={isLoading}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : isPlaying ? (
            <Pause className="w-8 h-8" />
          ) : (
            <Play className="w-8 h-8 ml-1" />
          )}
        </button>

        <button
          onClick={toggleFavorite}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
            isFavorite 
              ? 'bg-red-500 text-white' 
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Volume Control */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleMute}
          className="text-white/80 hover:text-white transition-colors"
        >
          {isMuted || volume === 0 ? (
            <VolumeX className="w-6 h-6" />
          ) : (
            <Volume2 className="w-6 h-6" />
          )}
        </button>
        <div className="flex-1 relative">
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
          />
          <div 
            className="absolute top-0 left-0 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg pointer-events-none"
            style={{ width: `${volume}%` }}
          ></div>
        </div>
        <span className="text-white/60 text-sm font-medium min-w-[3rem]">{volume}%</span>
      </div>

      {/* Audio Visualizer */}
      <div className="mt-8 flex items-center justify-center gap-1">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={`w-1 bg-gradient-to-t from-blue-500 to-purple-500 rounded-full ${
              isPlaying && connectionStatus === 'connected' ? 'animate-pulse' : ''
            }`}
            style={{
              height: `${Math.random() * 40 + 10}px`,
              animationDelay: `${i * 0.1}s`,
              animationDuration: `${Math.random() * 1 + 0.5}s`
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default RadioPlayer;