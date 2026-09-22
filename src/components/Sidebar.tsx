import { useState, useEffect } from 'react';
import { Cpu, Server, Code2, Network, Database, Wifi } from 'lucide-react';

interface LoadingPageProps {
  onComplete?: () => void;
}

const ICONS = [Network, Code2, Database, Wifi];

const LoadingPage = ({ onComplete }: LoadingPageProps) => {
  const [progress, setProgress] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const fullText = 'ESIITECH GABON';

  useEffect(() => {
    // Animation du texte qui s'écrit (très lent)
    let currentIndex = 0;
    const textInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(textInterval);
      }
    }, 400);

    // Animation du décompte (8 secondes)
    setTimeout(() => {
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            // Appeler onComplete quand on atteint 100%
            if (onComplete) {
              setTimeout(onComplete, 500); // Petit délai pour voir le 100%
            }
            return 100;
          }
          return prev + 1;
        });
      }, 100); // 100ms par % = 8 secondes pour atteindre 100%
    }, 1000);

    return () => {
      clearInterval(textInterval);
    };
  }, [onComplete]);

  // Combien d'icônes sont "allumées" selon la progression
  const activeIconsCount = Math.floor((progress / 100) * ICONS.length);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white relative overflow-hidden">
      {/* Effets de fond animés en bleu */}
      <div className="absolute inset-0 opacity-10 overflow-hidden">
        <div
          className="absolute top-1/4 left-1/3 w-64 h-64 sm:w-96 sm:h-96 rounded-full blur-3xl animate-pulse-slow"
          style={{ backgroundColor: '#00A4E0' }}
        />
        <div
          className="absolute bottom-1/3 right-1/4 w-56 h-56 sm:w-80 sm:h-80 rounded-full blur-3xl animate-pulse-slow"
          style={{
            backgroundColor: '#cfe3ff',
            animationDelay: '2s'
          }}
        />
        <div
          className="absolute top-1/2 right-1/3 w-48 h-48 sm:w-72 sm:h-72 rounded-full blur-3xl animate-pulse-slow"
          style={{
            backgroundColor: '#00A4E0',
            animationDelay: '4s'
          }}
        />
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-[340px] sm:max-w-sm px-4">
        {/* Texte qui s'écrit lettre par lettre */}
        <div className="mb-8 sm:mb-16 w-full">
          <h1
            className="text-xl xs:text-2xl sm:text-5xl lg:text-6xl font-bold tracking-wide sm:tracking-widest min-h-[32px] sm:min-h-[80px] flex items-center justify-center text-center whitespace-nowrap"
            style={{ color: '#00A4E0' }}
          >
            {displayText}
            <span className="animate-blink ml-1">|</span>
          </h1>
        </div>

        {/* ===== Rangée d'icônes réseau/code avec flux de données ===== */}
        <div className="flex items-center justify-center mb-4 sm:mb-5">
          {ICONS.map((Icon, i) => {
            const isActive = i < activeIconsCount;
            const isCurrent = i === activeIconsCount && progress < 100;
            return (
              <div key={i} className="flex items-center">
                {/* Badge icône */}
                <div className="relative flex flex-col items-center">
                  <div
                    className="relative w-9 h-9 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-500"
                    style={{
                      background: isActive
                        ? 'linear-gradient(135deg, #0077A8, #00A4E0)'
                        : '#f7f8fa',
                      border: isActive ? 'none' : '1px solid #ececec',
                      boxShadow: isActive
                        ? '0 6px 16px -6px rgba(0, 164, 224, 0.55)'
                        : 'none',
                      transform: isActive ? 'translateY(0) scale(1)' : 'translateY(2px) scale(0.92)',
                      animation: isActive ? 'icon-float 3s ease-in-out infinite' : 'none',
                      animationDelay: `${i * 0.3}s`,
                    }}
                  >
                    {/* Halo pulsant sur l'icône en cours de chargement */}
                    {isCurrent && (
                      <>
                        <div
                          className="absolute inset-0 rounded-xl sm:rounded-2xl blur-md animate-pulse"
                          style={{ backgroundColor: '#00A4E0', opacity: 0.35 }}
                        />
                        <div
                          className="absolute -inset-1 sm:-inset-1.5 rounded-xl sm:rounded-2xl border-2 animate-ping"
                          style={{ borderColor: '#00A4E0', opacity: 0.3 }}
                        />
                      </>
                    )}
                    <Icon
                      size={15}
                      className="relative sm:hidden"
                      strokeWidth={1.8}
                      style={{ color: isActive ? '#ffffff' : '#c7cbd1' }}
                    />
                    <Icon
                      size={24}
                      className="relative hidden sm:block"
                      strokeWidth={1.8}
                      style={{ color: isActive ? '#ffffff' : '#c7cbd1' }}
                    />
                  </div>
                </div>

                {/* Connecteur animé avec point de flux */}
                {i < ICONS.length - 1 && (
                  <div className="relative w-3.5 sm:w-9 h-0.5 mx-0.5 sm:mx-1.5 flex-shrink-0">
                    <div
                      className="absolute inset-0 rounded-full transition-colors duration-500"
                      style={{ backgroundColor: isActive ? '#00A4E0' : '#ececec' }}
                    />
                    {isActive && (
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
                        style={{
                          backgroundColor: '#ffffff',
                          boxShadow: '0 0 6px 2px rgba(0, 164, 224, 0.8)',
                          animation: 'flow-dot 1.4s linear infinite',
                          animationDelay: `${i * 0.15}s`,
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <span
          className="text-[10px] sm:text-sm tracking-[0.15em] sm:tracking-[0.2em] uppercase mb-8 sm:mb-12 font-medium text-center"
          style={{ color: '#A6A6A6' }}
        >
          Chargement du système
        </span>

        {/* ===== Deux barres horizontales qui courent avec icônes tech ===== */}
        <div className="w-full max-w-[190px] sm:max-w-xs space-y-3 sm:space-y-4 mb-6 sm:mb-10">
          {/* Barre 1 — CPU */}
          <div className="relative h-5 sm:h-8 rounded-full bg-gray-100 border border-gray-200 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300 ease-out relative"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #0077A8, #00A4E0)',
              }}
            />
            {/* Icône qui court en tête de la barre */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 sm:w-7 sm:h-7 rounded-full bg-white shadow-md border-2 flex items-center justify-center transition-all duration-300 ease-out"
              style={{
                left: `${progress}%`,
                borderColor: '#00A4E0',
              }}
            >
              <Cpu size={8} className="sm:hidden" style={{ color: '#00A4E0' }} />
              <Cpu size={13} className="hidden sm:block" style={{ color: '#00A4E0' }} />
            </div>
          </div>

          {/* Barre 2 — Server (légèrement décalée pour un effet "course") */}
          <div className="relative h-5 sm:h-8 rounded-full bg-gray-100 border border-gray-200 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300 ease-out relative"
              style={{
                width: `${Math.max(0, progress - 5)}%`,
                background: 'linear-gradient(90deg, #0090C8, #7dd8ff)',
              }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 sm:w-7 sm:h-7 rounded-full bg-white shadow-md border-2 flex items-center justify-center transition-all duration-300 ease-out"
              style={{
                left: `${Math.max(0, progress - 5)}%`,
                borderColor: '#0090C8',
              }}
            >
              <Server size={8} className="sm:hidden" style={{ color: '#0090C8' }} />
              <Server size={13} className="hidden sm:block" style={{ color: '#0090C8' }} />
            </div>
          </div>
        </div>

        {/* Texte "Back OFFICE" en bas */}
        <div className="animate-fade-in-bottom">
          <h2
            className="text-lg sm:text-2xl lg:text-3xl font-semibold tracking-wider text-center whitespace-nowrap"
            style={{ color: '#A6A6A6' }}
          >
            Back <span style={{ color: '#00A4E0' }}>OFFICE</span>
          </h2>
        </div>
      </div>

      <style>{`
        @keyframes icon-float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-3px) scale(1); }
        }
        @keyframes flow-dot {
          0% { left: 0%; opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { left: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default LoadingPage;