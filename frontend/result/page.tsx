// affichage du codebook final

'use client'; 

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase'; // mon passe-partout bdd

export default function ResultPage() {
  const searchParams = useSearchParams();
  const monId = searchParams.get('Id');

  // états ie les paragraphes et les décisions finales
  const [paragraphes, setParagraphes] = useState<string[]>([]);
  const [decisionsFinales, setDecisionsFinales] = useState<any>({});
  const [chargement, setChargement] = useState(true);

  // récup données de la bdd (on va chercher le travail fini)
  useEffect(() => {
    const recupererResultats = async () => {
      if (monId) {
        // On cherche ma ligne ou celle où je suis invité
        let { data: ligne } = await supabase
          .from('textes_collaborateurs')
          .select('contenu_texte, resultats_codage_final')
          .eq('id_utilisateur', monId)
          .maybeSingle();

        if (!ligne) {
          const { data: ligneInvite } = await supabase
            .from('textes_collaborateurs')
            .select('contenu_texte, resultats_codage_final')
            .eq('id_collaborateur', monId)
            .maybeSingle();
          ligne = ligneInvite;
        }

        if (ligne) {
          // On récupère le texte découpé
          if (ligne.contenu_texte) setParagraphes(JSON.parse(ligne.contenu_texte));
          // On récupère le fameux "sac" des décisions finales
          if (ligne.resultats_codage_final) setDecisionsFinales(ligne.resultats_codage_final);
        }
      }
      setChargement(false);
    };
    recupererResultats();
  }, [monId]);

  if (chargement) return <div className="p-10 text-center font-bold">Génération du codebook...</div>;

  return (
    <main className="min-h-screen bg-pink-50 p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-white p-8 rounded-3xl shadow-sm border border-pink-100">
        
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Codebook Final</h1>
        <p className="text-center text-gray-500 mb-8 italic">Résumé des décisions validées par le duo</p>

        {/* TABLEAU DES RÉSULTATS */}
        <div className="overflow-hidden border border-gray-100 rounded-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 uppercase text-sm">
                <th className="p-4 border-b w-2/3">Paragraphe</th>
                <th className="p-4 border-b w-1/3 text-blue-600">Code Final</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paragraphes.map((para, index) => (
                <tr key={index} className="hover:bg-pink-50/30 transition-colors">
                  <td className="p-4 text-gray-700 text-sm leading-relaxed">
                    {para}
                  </td>
                  <td className="p-4">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold text-sm inline-block">
                      {decisionsFinales[index] || "Non codé"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* BOUTON D'ACTION (Export ou retour) */}
        <div className="mt-10 flex gap-4 justify-center">
          <button 
            onClick={() => window.print()} //  astuce pour imprimer en PDF
            className="bg-green-500 text-white px-6 py-2 rounded-full font-bold hover:bg-green-600 transition-all"
          >
            Imprimer en PDF
          </button>
          <button 
            onClick={() => window.location.href = '/'} 
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-full font-bold hover:bg-gray-300 transition-all"
          >
            Nouvelle analyse
          </button>
        </div>

      </div>
      <h1 className="text-center font-bold">Merci d'avoir utilisé GGcoder ;)</h1>

    </main>
  );
}