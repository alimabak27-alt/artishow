// app/processing_2/page.tsx

'use client'; 
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase'; 

export default function ProcessingPage2() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const monId = searchParams.get('Id');
  
  const [nomCollabo, setNomCollabo] = useState("votre collaborateur");
  const [chargementFini, setChargementFini] = useState(false); // pour la transition de fin

  // --- NOUVEAU : INDICATEURS DE DEBUG au cas où certains paragraphes sont sans code ---
  const [monStatut, setMonStatut] = useState(false);
  const [sonStatut, setSonStatut] = useState(false);

  useEffect(() => {
    const verifierSynchroReelle = async () => {
      if (!monId) return;

      // 1. Je cherche MA ligne pour savoir qui est mon partenaire
      const { data: maLigne } = await supabase
        .from('textes_collaborateurs')
        .select('id_collaborateur, resultats_codage')
        .eq('id_utilisateur', monId)
        .maybeSingle();

      if (maLigne) {
        const monPartenaire = maLigne.id_collaborateur;
        if (monPartenaire) setNomCollabo(monPartenaire);

        // 2. Je regarde la ligne de MON PARTENAIRE pour voir s'il a fini
        const { data: lignePartenaire } = await supabase
          .from('textes_collaborateurs')
          .select('resultats_codage')
          .eq('id_utilisateur', monPartenaire)
          .maybeSingle();

        // 3. VÉRIFICATION STRICTE : on regarde si ce n'est plus "null"
        const jAiFini = maLigne.resultats_codage !== null;
        const ilAFini = lignePartenaire ? lignePartenaire.resultats_codage !== null : false;

        setMonStatut(jAiFini);
        setSonStatut(ilAFini);

        // 4. On a tous les deux nos codes
        if (jAiFini && ilAFini) {
          setChargementFini(true);
          setTimeout(() => {
            router.push(`/comparison?Id=${monId}`);
          }, 1500);
        }
      }
    };

    verifierSynchroReelle();
    const interval = setInterval(verifierSynchroReelle, 2000);
    return () => clearInterval(interval);
  }, [monId, router]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-pink-50 p-4">
      <div className="bg-white p-10 rounded-3xl shadow-sm text-center w-full max-w-md border border-pink-100">
        
        {chargementFini ? (
          /* --- ÉCRAN DE SUCCÈS  --- */
          <div className="animate-fade-in">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Codes synchronisés !</h1>
          </div>
        ) : (
          /* --- ÉCRAN D'ATTENTE --- */
          <div>
            
            {/* Animation de petits points */}
            <div className="flex justify-center items-center gap-2 my-8 text-blue-500">
              <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            </div>
            
            <p className="text-lg font-medium text-gray-600">
              Nous attendons que <span className="font-bold text-blue-600">{nomCollabo}</span> termine de rentrer ses codes.
            </p>

            {/* --- LE PANNEAU DE CONTRÔLE VISUEL --- */}
            <div className="mt-8 bg-gray-50 p-4 rounded-xl border border-gray-200 text-sm text-left">
              <p className="font-bold mb-2 text-gray-700">🔍 État de la Base de Données :</p>
              <p className="mb-1">
                {monStatut ? "✅" : "❌"} Vos codes sont sauvegardés
              </p>
              <p>
                {sonStatut ? "✅" : "❌"} Les codes de <b>{nomCollabo}</b> sont sauvegardés
              </p>
            </div>
            {/* ------------------------------------- */}
            
            <p className="text-sm text-gray-400 italic mt-6 border-t pt-4">
             vous pourrez comparer les codes quand votre collabrateur aura rentré les siens
            </p>
          </div>
        )}
        
      </div>
    </main>
  );
}