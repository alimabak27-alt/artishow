// entrée des codes

'use client'; // On repasse côté client pour avoir de l'interactivité !

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link'; //pour naviguer entre les pages
import { supabase } from '@/lib/supabase'; //pour naviguer entre les pages
import { useRouter } from 'next/navigation';

export default function CoderPage() {
  const router=useRouter()
  
  const gererCodage = async (event: React.FormEvent<HTMLFormElement>) => { //fct qui s'active quand le bouton validé est cliqué
    event.preventDefault(); //empeche la page de se rafraichir tt le temps
    const formulaire = event.currentTarget;
    const formData = new FormData(event.currentTarget); //recupérationd des données du form
    
    const donnees = {
        idUtilisateur: monId,
        indexParagraphe: indexActuel,
        codes: [
            formData.get('code1'),
            formData.get('code2'),
            formData.get('code3')
        ]
    };

    // On envoie un POST car c'est une modification de données
    const reponse = await fetch('/api/save-codes', {
        method: 'POST',
        body: JSON.stringify(donnees)
    });

    if (reponse.ok) {
        // Une fois sauvegardé, on peut passer au paragraphe suivant manuellement
        paragrapheSuivant();
        // vider les champs du formulaire pour le nouveau paragraphe
        formulaire.reset();
    } else {
        alert("Erreur lors de la sauvegarde des codes.");
    }
  };

  const searchParams = useSearchParams();
  const monId = searchParams.get('Id');

  // états ie paragraphe actuel
  const [paragraphes, setParagraphes] = useState<string[]>([]);
  const [indexActuel, setIndexActuel] = useState(0); // On commence au paragraphe 0
  const [chargement, setChargement] = useState(true);

  // récup données de la bdd
  // récup données de la bdd
  useEffect(() => {
    const recupererTexte = async () => {
      if (monId) {
        // 1. On cherche d'abord si j'ai créé la session (je suis dans id_utilisateur)
        const { data: maData } = await supabase
          .from('textes_collaborateurs')
          .select('contenu_texte, id_collaborateur')
          .eq('id_utilisateur', monId)
          .maybeSingle(); // 🪄 MAGIE : ne plante plus si ça trouve 0 ligne

        if (maData) {
          // Cas A : J'ai créé la ligne et j'ai le texte
          if (maData.contenu_texte && maData.contenu_texte.startsWith('[')) {
            setParagraphes(JSON.parse(maData.contenu_texte));
          } 
          // Cas B : J'ai créé la ligne, mais c'est mon collabo qui a mis le texte
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
          
          // On cherche dans la colonne d'à côté (id_collaborateur)
          console.log("Je ne suis pas le créateur, je regarde si on m'a invité...");
          
          const { data: inviteData } = await supabase
            .from('textes_collaborateurs')
            .select('contenu_texte')
            .eq('id_collaborateur', monId)
            .maybeSingle();

          // Si on trouve la ligne où j'ai été invité et qu'elle contient du texte
          if (inviteData && inviteData.contenu_texte && inviteData.contenu_texte.startsWith('[')) {
            console.log("Texte trouvé via l'invitation !");
            setParagraphes(JSON.parse(inviteData.contenu_texte));
          }
        }
      }
      setChargement(false);
    };
    
    recupererTexte();
  }, [monId]);

  // boutons parag précédent/suivant
  const paragraphePrecedent = () => {
    if (indexActuel > 0) setIndexActuel(indexActuel - 1);
  };

  const paragrapheSuivant = () => {
    if (indexActuel < paragraphes.length - 1) setIndexActuel(indexActuel + 1);
  };

  // Écran d'attente le temps que Supabase réponde
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
                //Le paragraphe actuellement lu à droite est surligné en jaune à gauche
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
            
            <form onSubmit={gererCodage} className="text-center bg-pink-50 p-8 rounded-3xl shadow-sm flex flex-col h-full">
        
              <input 
                name="code1" 
                placeholder="Entrez votre 1e code ici"
                className="w-full border p-3 rounded-xl resize-none outline-none focus:ring-2 focus:ring-pink-300 mb-3" 
                required />

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
                    type="button" // <--- TRÈS IMPORTANT: pour ne pas envoyer le formulaire
                    onClick={paragraphePrecedent}
                    disabled={indexActuel === 0} // Désactivé si on est au 1e parag
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full font-semibold hover:bg-gray-300 disabled:opacity-50 transition-all"
                  >
                    ← Précédent
                  </button>
                  <button type="button" className="bg-blue-100 text-blue-600 px-4 py-2 rounded-full font-semibold hover:bg-blue-200 text-sm"> Suggestions IA</button>
                  <button 
                    type="submit" // <--- TRÈS IMPORTANT: C'est lui qui envoie les codes !
                    disabled={indexActuel === paragraphes.length - 1} // Désactivé si on est au tout dernier
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full font-semibold hover:bg-gray-300 disabled:opacity-50 transition-all"
                  >
                    Suivant →
                  </button>
                </div>
            </form>
          </div>

          <Link 
            href={`/processing_2?Id=${monId}`} 
            className="bg-blue-500 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-600 block text-center mt-auto"
          >
            Terminer le codage
          </Link>
          
        </div>

      </div>
    </main>
  );
}
