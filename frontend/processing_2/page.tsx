//"chargement échange des codes avec votre collaborateur"

'use client'; // Indispensable pour l'animation et le timer
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; // Ajout de useSearchParams

export default function ProcessingPage2() {
  const [progress, setProgress] = useState(0);
  const router = useRouter();
  
  // NOUVEAU : On récupère l'ID pour ne pas le perdre en route !
  const searchParams = useSearchParams();
  const monId = searchParams.get('Id');

  // 1er effet : S'occuper uniquement de faire avancer les chiffres
  useEffect(() => {
    // Simulation de l'échange de codes
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 100) {
          clearInterval(timer);
          return 100; // On s'arrête net à 100, sans faire de navigation ici !
        }
        return oldProgress + 5; // On avance un peu plus lentement (étape plus "lourde")
      });
    }, 300); // Mise à jour toutes les 300ms

    return () => clearInterval(timer);
  }, []);

  // 2e effet : Surveiller le chiffre et naviguer au bon moment
  useEffect(() => {
    // Si la progression atteint 100 ET qu'on a bien l'ID
    if (progress >= 100 && monId) {
      // Une fois l'échange fini, on passe à la comparaison avec notre ID en poche
      router.push(`/comparison?Id=${monId}`); 
    }
  }, [progress, router, monId]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-pink-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-sm text-center w-full max-w-md border border-pink-100">
        {/* Ton titre Figma */}
        <h1 className="text-xl font-bold mb-6 text-gray-800">
          Échange des codes avec votre collaborateur...
        </h1>
        
        {/* LA BARRE DE PROGRESSION */}
        <div className="w-full bg-gray-100 rounded-full h-4 mb-4 overflow-hidden border border-gray-200">
          <div 
            className="bg-blue-400 h-4 transition-all duration-300 ease-out" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <p className="text-sm font-medium text-gray-400 italic">
          Synchronisation en cours : {progress}%
        </p>
      </div>
    </main>
  );
}