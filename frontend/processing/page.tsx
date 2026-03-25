//"chargement découpage texte"

'use client'; // Obligatoire pour les animations
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ProcessingPage() {
  const [progress, setProgress] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const monId = searchParams.get('Id');

  // 1er effet : S'occuper uniquement de faire avancer les chiffres
  useEffect(() => {
    // On simule le découpage du texte qui avance
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 100) {
          clearInterval(timer);
          return 100; // On s'arrête net à 100, sans faire de navigation ici !
        }
        return oldProgress + 10; // On avance de 10%
      });
    }, 500); // Toutes les 500ms

    return () => clearInterval(timer);
  }, []);

  // 2e effet : Surveiller le chiffre et naviguer au bon moment
  useEffect(() => {
    // Si la progression atteint 100 ET qu'on a bien l'ID
    if (progress >= 100 && monId) {
      // Une fois fini, on va à la page résultat
      router.push(`/coder?Id=${monId}`);
    }
  }, [progress, router, monId]); // On dit à React de relancer cette vérification à chaque fois que "progress" change

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-pink-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-sm text-center w-full max-w-md">
        <h1 className="text-xl font-bold mb-6 text-gray-800">Découpage de votre texte...</h1>
        
        {/* LA BARRE DE PROGRESSION (Version Tailwind) */}
        <div className="w-full bg-gray-200 rounded-full h-4 mb-4 overflow-hidden">
          <div 
            className="bg-blue-500 h-4 transition-all duration-500 ease-out" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <p className="text-sm text-gray-500">{progress}% terminé</p>
      </div>
    </main>
  );
}