// "copier votre texte"

'use client'; 

import { useState, useEffect } from 'react'; 
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase'; 

export default function textPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const monId = searchParams.get('Id');

  const [texte, setTexte] = useState('');
  const [chargement, setChargement] = useState(true);
  
  // Un drapeau pour savoir si le texte vient VRAIMENT du collabo
  const [texteDepuisBDD, setTexteDepuisBDD] = useState(false); 

  useEffect(() => {
    const verifierTexteExistant = async () => {
      if (monId) {
        let { data: ligne } = await supabase
          .from('textes_collaborateurs')
          .select('contenu_texte')
          .eq('id_utilisateur', monId)
          .maybeSingle();

        if (!ligne) {
          const { data: ligneInvite } = await supabase
            .from('textes_collaborateurs')
            .select('contenu_texte')
            .eq('id_collaborateur', monId)
            .maybeSingle();
          ligne = ligneInvite;
        }

        // Si la BDD a un texte ET que ce n'est pas juste ton vieux "Texte en attente..."
        if (ligne && ligne.contenu_texte && !ligne.contenu_texte.includes("Texte en attente")) {
          
          if (ligne.contenu_texte.startsWith('[')) {
            const tableau = JSON.parse(ligne.contenu_texte);
            setTexte(tableau.join('\n\n')); 
          } else {
            setTexte(ligne.contenu_texte);
          }
          
          // On lève le drapeau : Oui, on a récupéré un vrai texte 
          setTexteDepuisBDD(true); 
        }
      }
      setChargement(false);
    };
    verifierTexteExistant();
  }, [monId]);


  const gererEnvoiTexte = async(event : React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const reponse = await fetch('/api/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        idUtilisateur: monId, 
        texte: texte 
      }) 
    });

    if (reponse.ok) {
      router.push(`/processing?Id=${monId}`); 
    } else {
      alert("Erreur lors du découpage du texte.");
    }
  }

  if (chargement) return <div className="p-10 text-center font-bold">Vérification de la session...</div>;

  return (
    <main>
      <div className="texte-center bg-pink-50 min-h-screen flex flex-col items-center justify-center p-4"> 
      <h1 className="text-center font-bold text-2xl mb-4">Copiez votre texte ici...</h1>
      
      {/* On utilise  drapeau pour afficher le message ! */}
      <p className="text-sm text-gray-500 mb-4 italic h-5">
        {texteDepuisBDD ? " Texte récupéré depuis votre session collaborative." : "Collez votre texte à analyser ci-dessous."}
      </p>

      <form onSubmit={gererEnvoiTexte} className="text-center bg-white p-8 rounded-3xl shadow-sm border border-pink-100 flex flex-col w-full max-w-3xl gap-4">
        
        <textarea 
          name="contenuTexte" 
          placeholder="Entrez ou collez votre texte ici..." // Le vrai texte "fantôme" qui disparaît quand on tape
          className="border p-4 rounded-xl h-64 outline-none focus:ring-2 focus:ring-pink-300 resize-none"
          value={texte} 
          onChange={(e) => setTexte(e.target.value)} 
          required 
        />
    
        {/* Le bouton s'adapte aussi grâce au drapeau */}
        <button type="submit" className="bg-blue-500 text-white p-3 rounded-full font-bold hover:bg-blue-600 transition-all"> 
           {texteDepuisBDD ? "Confirmer et Continuer" : "Découper le texte"}
        </button>
      </form>
    
      </div>
    </main>
  );
}