// entrée des codes

'use client'; 

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase'; 

export default function CoderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const monId = searchParams.get('Id');

  const [paragraphes, setParagraphes] = useState<string[]>([]);
  const [indexActuel, setIndexActuel] = useState(0); 
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    const recupererTexte = async () => {
      if (monId) {
        const { data: maData } = await supabase
          .from('textes_collaborateurs')
          .select('contenu_texte, id_collaborateur')
          .eq('id_utilisateur', monId)
          .maybeSingle(); 

        if (maData) {
          if (maData.contenu_texte && maData.contenu_texte.startsWith('[')) {
            setParagraphes(JSON.parse(maData.contenu_texte));
          } 
          else if (maData.id_collaborateur) {
            const { data: collaboData } = await supabase
              .from('textes_collaborateurs')
              .select('contenu_texte')
              .eq('id_utilisateur', maData.id_collaborateur)
              .maybeSingle();

            if (collaboData?.contenu_texte?.startsWith('[')) {
              setParagraphes(JSON.parse(collaboData.contenu_texte));
            }
          }
        } else {
          const { data: inviteData } = await supabase
            .from('textes_collaborateurs')
            .select('contenu_texte')
            .eq('id_collaborateur', monId)
            .maybeSingle();

          if (inviteData && inviteData.contenu_texte && inviteData.contenu_texte.startsWith('[')) {
            setParagraphes(JSON.parse(inviteData.contenu_texte));
          }
        }
      }
      setChargement(false);
    };
    
    recupererTexte();
  }, [monId]);

  // --- NOUVELLE FONCTION DE SAUVEGARDE ---
  const gererCodage = async (event: any, typeAction: "suivant" | "terminer") => {
    event.preventDefault(); 
    
    // On essaye de récupérer les données du formulaire, s'il existe
    let codes = ["", "", ""];
    const formulaire = document.getElementById("form-codage") as HTMLFormElement;
    
    if (formulaire) {
      const formData = new FormData(formulaire); 
      codes = [
          formData.get('code1') as string || "",
          formData.get('code2') as string || "",
          formData.get('code3') as string || ""
      ];
    }

    const donnees = {
        idUtilisateur: monId,
        indexParagraphe: indexActuel,
        codes: codes // Si on n'a rien mis, ça enverra des codes vides, ce qui est normal !
    };

    // On envoie un POST 
    const reponse = await fetch('/api/save-codes', {
        method: 'POST',
        body: JSON.stringify(donnees)
    });

    if (reponse.ok) {
        if (typeAction === "suivant") {
          paragrapheSuivant();
          if(formulaire) formulaire.reset();
        } else if (typeAction === "terminer") {
          // Si on clique sur Terminer, on va à la page Processing 2 !
          router.push(`/processing_2?Id=${monId}`);
        }
    } else {
        alert("Erreur lors de la sauvegarde des codes.");
    }
  };

  const paragraphePrecedent = () => {
    if (indexActuel > 0) setIndexActuel(indexActuel - 1);
  };

  const paragrapheSuivant = () => {
    if (indexActuel < paragraphes.length - 1) setIndexActuel(indexActuel + 1);
  };

  if (chargement) return <div className="p-10 text-center font-bold">Chargement de votre texte...</div>;

  return (
    <main className="min-h-screen bg-pink-50 p-6 flex flex-col items-center">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-7xl h-[80vh]">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-pink-100 overflow-y-auto h-full">
          <h2 className="text-lg font-bold mb-4 text-gray-700 border-b pb-2">Votre texte</h2>
          <div className="space-y-3 text-gray-600 text-justify">
            {paragraphes.map((para, index) => (
              <p 
                key={index}
                className={`p-2 rounded-lg transition-colors duration-300 ${
                  index === indexActuel 
                    ? 'bg-yellow-100 text-blue-900 font-medium border-l-4 border-blue-500' 
                    : 'hover:bg-gray-50'
                }`}
              >
                {para}
              </p>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-pink-100 flex flex-col h-full">
          
          <h2 className="text-lg font-bold mb-4 text-gray-700 border-b pb-2">
            Paragraphe en cours ({indexActuel + 1} / {paragraphes.length})
          </h2>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 text-lg min-h-[120px] overflow-y-auto">
            {paragraphes.length > 0 ? paragraphes[indexActuel] : "Aucun texte."}
          </div>

          <h3 className="font-bold text-gray-600 mb-2">Entrée des codes</h3>
          <div className="flex flex-col gap-3 mb-6 flex-grow">
            
            <form id="form-codage" onSubmit={(e) => gererCodage(e, "suivant")} className="text-center bg-pink-50 p-8 rounded-3xl shadow-sm flex flex-col h-full">
        
              <input 
                name="code1" 
                placeholder="Entrez votre 1e code ici"
                className="w-full border p-3 rounded-xl resize-none outline-none focus:ring-2 focus:ring-pink-300 mb-3" 
                // J'AI RETIRÉ LE REQUIRED pour te permettre de laisser des paragraphes vides !
                />

               <input 
                name="code2" 
                placeholder="Entrez votre 2e code ici (facultatif)"
                className="w-full border p-3 rounded-xl resize-none outline-none focus:ring-2 focus:ring-pink-300 mb-3" 
                />

               <input 
                name="code3" 
                placeholder="Entrez votre 3e code ici (facultatif)"
                className="w-full border p-3 rounded-xl resize-none outline-none focus:ring-2 focus:ring-pink-300 mb-6" 
                />
                
               <div className="flex justify-between items-center mt-auto">
                  <button 
                    type="button" 
                    onClick={paragraphePrecedent}
                    disabled={indexActuel === 0} 
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full font-semibold hover:bg-gray-300 disabled:opacity-50 transition-all"
                  >
                    ← Précédent
                  </button>
                  <button type="button" className="bg-blue-100 text-blue-600 px-4 py-2 rounded-full font-semibold hover:bg-blue-200 text-sm"> Suggestions IA</button>
                  <button 
                    type="submit" 
                    disabled={indexActuel === paragraphes.length - 1} 
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full font-semibold hover:bg-gray-300 disabled:opacity-50 transition-all"
                  >
                    Suivant →
                  </button>
                </div>
            </form>
          </div>

          {/* LE BOUTON TERMINER N'EST PLUS UN LINK, IL SAUVEGARDE ! */}
          <button 
            type="button"
            onClick={(e) => gererCodage(e, "terminer")} 
            className="bg-blue-500 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-600 block w-full text-center mt-auto transition-all"
          >
            Terminer le codage
          </button>
          
        </div>

      </div>
    </main>
  );
}