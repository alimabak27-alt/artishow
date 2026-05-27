// comparaison des codes et décision finale

'use client'; 

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase'; 

export default function ComparisonPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const monId = searchParams.get('Id');

  const [paragraphes, setParagraphes] = useState<string[]>([]);
  const [indexActuel, setIndexActuel] = useState(0); 
  const [mesCodes, setMesCodes] = useState<any>({}); 
  const [codesCollabo, setCodesCollabo] = useState<any>({}); 
  const [nomCollabo, setNomCollabo] = useState(""); 
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    const recupererDonnees = async () => {
      if (monId) {
        // 1. RECHERCHE ROBUSTE : On cherche LA ligne principale (celle qui contient obligatoirement le texte)
        const { data: sessionPrincipale } = await supabase
          .from('textes_collaborateurs')
          .select('*')
          .or(`id_utilisateur.eq.${monId},id_collaborateur.eq.${monId}`)
          .not('contenu_texte', 'is', null) // Filtre magique : on ignore les lignes vides créées par l'API
          .maybeSingle();

        if (sessionPrincipale) {
          // On charge le texte
          if (sessionPrincipale.contenu_texte) {
            setParagraphes(JSON.parse(sessionPrincipale.contenu_texte));
          }

          // On identifie qui est qui
          const idCreateur = sessionPrincipale.id_utilisateur;
          const idInvite = sessionPrincipale.id_collaborateur;
          const partenaireId = (monId === idCreateur) ? idInvite : idCreateur;
          setNomCollabo(partenaireId || "Collaborateur");

          // 2. On récupère MES codes (dans ma propre ligne)
          const { data: maLigne } = await supabase
            .from('textes_collaborateurs')
            .select('resultats_codage')
            .eq('id_utilisateur', monId)
            .maybeSingle();
          if (maLigne?.resultats_codage) setMesCodes(maLigne.resultats_codage);

          // 3. On récupère les codes de l'AUTRE (dans sa propre ligne)
          const { data: partenaireLigne } = await supabase
            .from('textes_collaborateurs')
            .select('resultats_codage')
            .eq('id_utilisateur', partenaireId)
            .maybeSingle();
          if (partenaireLigne?.resultats_codage) setCodesCollabo(partenaireLigne.resultats_codage);
        }
      }
      setChargement(false);
    };
    
    recupererDonnees();
  }, [monId]);

  const gererDecisionFinale = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formulaire = event.currentTarget;
    const formData = new FormData(formulaire);
    const decision = formData.get('decision');

    // Assure-toi que cette API existe bien dans ton projet !
    const reponse = await fetch('/api/save-final-decision', {
        method: 'POST',
        body: JSON.stringify({ idUtilisateur: monId, indexParagraphe: indexActuel, decision })
    });

    if (reponse.ok) {
        // SÉCURITÉ ANTI-INFINI : Si on est au dernier paragraphe (ou qu'il n'y a pas de texte)
        if (paragraphes.length === 0 || indexActuel >= paragraphes.length - 1) {
          router.push(`/processing_3?Id=${monId}`); // Redirection vers la suite
        } else {
          formulaire.reset();
          setIndexActuel(indexActuel + 1);
        }
    }
  };

  if (chargement) return <div className="p-10 text-center font-bold text-gray-500">Ouverture de la salle de comparaison...</div>;

  const mesCodesActuels = mesCodes[indexActuel] || [];
  const codesCollaboActuels = codesCollabo[indexActuel] || [];
  const estLeDernier = paragraphes.length === 0 || indexActuel >= paragraphes.length - 1;

  return (
    <main className="min-h-screen bg-pink-50 p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center">Comparaison des codes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[80vh] max-w-7xl mx-auto">
        
        {/* TEXTE */}
        <div className="bg-white p-6 rounded-3xl shadow-sm overflow-hidden flex flex-col border border-pink-100">
          <h2 className="font-bold text-gray-700 mb-4 border-b pb-2">
            Paragraphe {paragraphes.length > 0 ? indexActuel + 1 : 0} / {paragraphes.length}
          </h2>
          <div className="bg-gray-50 p-4 rounded-xl flex-grow overflow-y-auto text-lg italic border border-gray-200">
            {paragraphes.length > 0 ? `"${paragraphes[indexActuel]}"` : "Aucun texte trouvé."}
          </div>
        </div>

        {/* CODES & DÉCISION */}
        <div className="bg-white p-6 rounded-3xl shadow-sm flex flex-col gap-6 border border-pink-100">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
              <p className="text-xs font-bold text-blue-400 uppercase mb-2">Vous</p>
              {mesCodesActuels.length > 0 ? mesCodesActuels.map((c:string, i:number) => <div key={i} className="font-bold text-blue-900">• {c}</div>) : <span className="text-gray-400 italic text-sm">Vide</span>}
            </div>
            <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-100">
              <p className="text-xs font-bold text-yellow-600 uppercase mb-2">{nomCollabo}</p>
              {codesCollaboActuels.length > 0 ? codesCollaboActuels.map((c:string, i:number) => <div key={i} className="font-bold text-yellow-900">• {c}</div>) : <span className="text-gray-400 italic text-sm">Vide</span>}
            </div>
          </div>

          <form onSubmit={gererDecisionFinale} className="flex-grow flex flex-col">
            <label className="font-bold text-gray-600 mb-2">Décision commune :</label>
            <textarea 
              name="decision"
              className="w-full flex-grow border p-4 rounded-xl outline-none focus:ring-2 focus:ring-pink-300 resize-none mb-4"
              placeholder="Quel code gardez-vous au final ?"
              required
              defaultValue=""
            />
            <button type="submit" className="bg-blue-500 text-white py-4 rounded-full font-bold shadow-lg hover:bg-blue-600 transition-all">
              {estLeDernier ? "Générer le Codebook Final" : "Valider et Paragraphe Suivant →"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}