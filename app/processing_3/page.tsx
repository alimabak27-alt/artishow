//"chargement création du codebook"


'use client'; 
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProcessingPage3() {
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  useEffect(() => {
    // Simulation de la création du codebook
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 100) {
          clearInterval(timer);
          // Direction la page finale des résultats !
          router.push('/result'); 
          return 100;
        }
        // Vitesse un peu plus rapide pour finir en beauté
        return oldProgress + 8; 
      });
    }, 400);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-pink-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-sm text-center w-full max-w-md border border-pink-100">
        
        <h1 className="text-xl font-bold mb-6 text-gray-800">
          Création du codebook en cours...
        </h1>
        
        {/* LA BARRE DE PROGRESSION (Version Indigo) */}
        <div className="w-full bg-gray-100 rounded-full h-4 mb-4 overflow-hidden border border-gray-200">
          <div 
            className="bg-indigo-500 h-4 transition-all duration-400 ease-out" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <p className="text-sm font-medium text-indigo-400">
         {progress}% terminé
        </p>

  
      </div>
    </main>
  );
}