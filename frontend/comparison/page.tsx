// comparaison des codes et décision finale

'use client'; // on repasse côté client pour avoir de l'interactivité !

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation'; // pour naviguer et lire l'url
import { supabase } from '@/lib/supabase'; // mon passe-partout bdd

export default function ComparisonPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const monId = searchParams.get('Id');

  // états ie paragraphe actuel, les textes et les codes
  const [paragraphes, setParagraphes] = useState<string[]>([]);
  const [indexActuel, setIndexActuel] = useState(0); 
  const [mesCodes, setMesCodes] = useState<any>({}); // objet pour stocker mes codes
  const [codesCollabo, setCodesCollabo] = useState<any>({}); // objet pour stocker les codes du collabo
  const [nomCollabo, setNomCollabo] = useState(""); 
  const [chargement, setChargement] = useState(true);

  // récup données de la bdd (moi + le collaborateur)
  useEffect(() => {
    const recupererComparaison = async () => {
      if (monId) {
        // 1. Je vais chercher MA ligne (ou celle où je suis invité)
        // D'abord en tant qu'utilisateur principal
        let { data: maData } = await supabase
          .from('textes_collaborateurs')
          .select('contenu_texte, resultats_codage, id_collaborateur, id_utilisateur')
          .eq('id_utilisateur', monId)
          .maybeSingle();

        // Si je ne trouve rien, je regarde si je suis le collaborateur (le cas de bb)
        if (!maData) {
          const { data: inviteData } = await supabase
            .from('textes_collaborateurs')
            .select('contenu_texte, resultats_codage, id_collaborateur, id_utilisateur')
            .eq('id_collaborateur', monId)
            .maybeSingle();
          maData = inviteData;
        }

        if (maData) {
          // On stocke mes codes et le nom du partenaire
          if (maData.resultats_codage) setMesCodes(maData.resultats_codage);
          
          // On identifie qui est l'autre personne pour afficher son nom
          const partenaireId = (maData.id_utilisateur === monId) ? maData.id_collaborateur : maData.id_utilisateur;
          setNomCollabo(partenaireId || "Votre collaborateur");

          // On gère l'affichage du texte (même si c'est l'autre qui l'a mis)
          if (maData.contenu_texte && maData.contenu_texte.startsWith('[')) {
            setParagraphes(JSON.parse(maData.contenu_texte));
          }

          // 2. Je vais chercher les codes de mon PARTENAIRE dans SA ligne
          const { data: partenaireData } = await supabase
            .from('textes_collaborateurs')
            .select('resultats_codage')
            .eq('id_utilisateur', partenaireId)
            .maybeSingle();

          if (partenaireData && partenaireData.resultats_codage) {
            setCodesCollabo(partenaireData.resultats_codage);
          }
        }
      }
      setChargement(false);
    };
    recupererComparaison();
  }, [monId]);

  // boutons parag précédent/suivant
  const paragraphePrecedent = () => {
    if (indexActuel > 0) setIndexActuel(indexActuel - 1);
  };

  const paragrapheSuivant = () => {
    if (indexActuel < paragraphes.length - 1) setIndexActuel(indexActuel + 1);
  };

  // fct qui s'active quand le bouton valider (ou terminer) est cliqué
  const gererDecisionFinale = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // empeche la page de se rafraichir tt le temps
    
    const formulaire = event.currentTarget;
    const formData = new FormData(formulaire);
    const decisionSelectionnee = formData.get('decision');

    const donnees = {
        idUtilisateur: monId,
        indexParagraphe: indexActuel,
        decision: decisionSelectionnee
    };

    // On envoie la décision finale à notre nouvelle API
    const reponse = await fetch('/api/save-final-decision', {
        method: 'POST',
        body: JSON.stringify(donnees)
    });

    if (reponse.ok) {
        // Si c'est le dernier paragraphe, on finit !
        if (indexActuel === paragraphes.length - 1) {
          router.push(`/processing_3?Id=${monId}`); // direction la création du codebook
        } else {
          // Sinon on vide le texte et on passe au suivant
          formulaire.reset();
          paragrapheSuivant();
        }
    } else {
        alert("Erreur lors de la sauvegarde de la décision.");
    }
  };

  // Écran d'attente
  if (chargement) return <div className="p-10 text-center font-bold">Chargement de la comparaison...</div>;

  // Préparation des codes pour l'affichage
  const mesCodesActuels = mesCodes[indexActuel] || [];
  const codesCollaboActuels = codesCollabo[indexActuel] || [];
  const estLeDernier = indexActuel === paragraphes.length - 1;

  return (
    <main className="min-h-screen bg-pink-50 p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Comparaison des codes</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-7xl h-[85vh]">
        
        {/* COLONNE GAUCHE : LE TEXTE */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-pink-100 flex flex-col h-full overflow-hidden">
          <h2 className="text-lg font-bold mb-4 text-gray-700 border-b pb-2">Paragraphe en cours ({indexActuel + 1} / {paragraphes.length})</h2>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-lg flex-grow overflow-y-auto mb-4">
            {paragraphes.length > 0 ? paragraphes[indexActuel] : "Aucun texte."}
          </div>

          <div className="flex justify-between items-center mt-auto">
            <button 
              type="button"
              onClick={paragraphePrecedent}
              disabled={indexActuel === 0} 
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full font-semibold hover:bg-gray-300 disabled:opacity-50"
            >
              ← Précédent
            </button>
            <button 
              type="button"
              onClick={paragrapheSuivant}
              disabled={indexActuel === paragraphes.length - 1} 
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full font-semibold hover:bg-gray-300 disabled:opacity-50"
            >
              Suivant →
            </button>
          </div>
        </div>

        {/* COLONNE DROITE : LA COMPARAISON ET LA DÉCISION */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-pink-100 flex flex-col h-full overflow-y-auto">
          
          <div className="mb-6">
            <h2 className="font-bold text-gray-600 mb-2">Vous</h2>
            <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 min-h-[60px]">
              {mesCodesActuels.map((c: string, i: number) => <div key={i}>• {c}</div>)}
              {mesCodesActuels.length === 0 && <span className="text-gray-400 italic">Aucun code</span>}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="font-bold text-gray-600 mb-2">{nomCollabo}</h2>
            <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-100 min-h-[60px]">
              {codesCollaboActuels.map((c: string, i: number) => <div key={i}>• {c}</div>)}
              {codesCollaboActuels.length === 0 && <span className="text-gray-400 italic">En attente des codes...</span>}
            </div>
          </div>

          <button type="button" className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full font-semibold hover:bg-purple-200 text-sm w-fit mx-auto mb-6">
            Obtenir des suggestions de codes
          </button>

          {/* Formulaire pour la décision finale */}
          <form onSubmit={gererDecisionFinale} className="flex flex-col flex-grow">
            <h2 className="font-bold text-gray-600 mb-2">Décision finale</h2>
            <textarea 
              name="decision"
              className="w-full flex-grow border p-4 rounded-xl resize-none outline-none focus:ring-2 focus:ring-pink-300 mb-6" 
              placeholder="Écrivez le code final retenu pour ce paragraphe ici..."
              required
              defaultValue="" 
            />
            
            <button type="submit" className="bg-blue-500 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-600 w-full mt-auto">
              {estLeDernier ? "Terminer la comparaison" : "Valider et Paragraphe suivant →"}
            </button>
          </form>

        </div>
      </div>
    </main>
  );
}