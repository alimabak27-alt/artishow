//"chargement découpage texte"

'use client'; 
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase'; 

export default function ProcessingPage() {
  const [progress, setProgress] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const monId = searchParams.get('Id');

  useEffect(() => {
    const verifierBDD = async () => {
      if (!monId) return;

      //  demande à Supabase si le texte est déjà transformé en tableau (découpé)
      const { data } = await supabase
        .from('textes_collaborateurs')
        .select('contenu_texte')
        .or(`id_utilisateur.eq.${monId},id_collaborateur.eq.${monId}`)
        .maybeSingle();

      // RÈGLE : Si le texte commence par "[", c'est que l'API a fini le découpage
      if (data && data.contenu_texte && data.contenu_texte.startsWith('[')) {
        setProgress(100); // On force la barre à 100% car le travail est fini
      } else {
        // Sinon, on fait avancer la barre pour patienter, mais sans dépasser 90%
        setProgress((old) => (old < 90 ? old + 5 : old));
      }
    };

    // On lance la vérification toutes les 800ms
    const timer = setInterval(verifierBDD, 800);

    return () => clearInterval(timer);
  }, [monId]);

  // Surveiller le chiffre et naviguer au bon moment
  // On surveille la BDD et on redirige dès que c'est prêt
  useEffect(() => {
    const verifierBDD = async () => {
      if (!monId) return;

      const { data } = await supabase
        .from('textes_collaborateurs')
        .select('contenu_texte')
        .eq('id_utilisateur', monId)
        .maybeSingle();

      if (data && data.contenu_texte && data.contenu_texte.startsWith('[')) {
        console.log("Texte prêt, redirection...");
        setProgress(100);
        
        // REDIRECTION DIRECTE ICI
        // On attend un tout petit peu (300ms) pour que l'utilisateur voie la barre pleine
        setTimeout(() => {
          router.push(`/coder?Id=${monId}`);
        }, 300);
      } else {
        // Progression visuelle tant qu'on attend
        setProgress((old) => (old < 90 ? old + 5 : old));
      }
    };

    const timer = setInterval(verifierBDD, 800);
    return () => clearInterval(timer);
  }, [monId, router]); // On ajoute router dans les dépendances
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-pink-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-sm text-center w-full max-w-md">
        <h1 className="text-xl font-bold mb-6 text-gray-800">Découpage de votre texte...</h1>
        
        <div className="w-full bg-gray-200 rounded-full h-4 mb-4 overflow-hidden">
          <div 
            className="bg-blue-500 h-4 transition-all duration-700 ease-out" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <p className="text-sm text-gray-500">
            {progress < 100 ? "Analyse et stockage en cours..." : "Terminé !"}
        </p>
      </div>
    </main>
  );
}