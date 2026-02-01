import { useState, useEffect } from 'react';

interface LoadingPageProps {
  onComplete?: () => void;
}

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
      }, 80); // 80ms par % = 8 secondes pour atteindre 100%
    }, 1000);

    return () => {
      clearInterval(textInterval);
    };
  }, [onComplete]);

  // Calcul du pourcentage pour le cercle SVG
  const circumference = 2 * Math.PI * 64;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white relative overflow-hidden">
      {/* Effets de fond animés en bleu */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full blur-3xl animate-pulse-slow"
          style={{ backgroundColor: '#00A4E0' }}
        />
        <div
          className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full blur-3xl animate-pulse-slow"
          style={{
            backgroundColor: '#cfe3ff',
            animationDelay: '2s'
          }}
        />
        <div
          className="absolute top-1/2 right-1/3 w-72 h-72 rounded-full blur-3xl animate-pulse-slow"
          style={{
            backgroundColor: '#00A4E0',
            animationDelay: '4s'
          }}
        />
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Texte qui s'écrit lettre par lettre */}
        <div className="mb-16">
          <h1
            className="text-6xl font-bold tracking-widest min-h-[80px] flex items-center justify-center"
            style={{ color: '#00A4E0' }}
          >
            {displayText}
            <span className="animate-blink ml-1">|</span>
          </h1>
        </div>

        {/* Cercle de progression avec décompte */}
        <div className="relative mb-10">
          {/* SVG Circle */}
          <svg className="transform -rotate-90" width="160" height="160">
            {/* Cercle de fond */}
            <circle
              cx="80"
              cy="80"
              r="64"
              stroke="#A6A6A6"
              strokeWidth="10"
              fill="none"
              opacity="0.2"
            />
            {/* Cercle de progression */}
            <circle
              cx="80"
              cy="80"
              r="64"
              stroke="#00A4E0"
              strokeWidth="10"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
              style={{
                filter: 'drop-shadow(0 0 10px rgba(0, 164, 224, 0.5))'
              }}
            />
          </svg>

          {/* Pourcentage au centre */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="text-5xl font-bold transition-all duration-300"
              style={{ color: '#00A4E0' }}
            >
              {progress}%
            </span>
            <span
              className="text-sm mt-2 tracking-wide uppercase"
              style={{ color: '#A6A6A6' }}
            >
              Chargement
            </span>
          </div>
        </div>

        {/* Texte "Back OFFICE" en bas */}
        <div className="animate-fade-in-bottom">
          <h2
            className="text-3xl font-semibold tracking-wider"
            style={{ color: '#A6A6A6' }}
          >
            Back <span style={{ color: '#00A4E0' }}>OFFICE</span>
          </h2>
        </div>
      </div>
    </div>
  );
};

export default LoadingPage;
