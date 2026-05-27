// frame 1 -> accueil/ID, page sur laqulle on atterit

'use client'; // Obligatoire car je gère un clic utilisateur 

import { useState } from 'react'; // Ajouté pour gérer le message d'erreur
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase'; // Import de supabase pour vérifier l'ID

export default function homePage() {
  const router = useRouter();
  const [erreur, setErreur] = useState(''); // État pour stocker le message "rentrez un autre ID"

  const gererValidation = async (event: React.FormEvent<HTMLFormElement>) => { //fct qui s'active quand le bouton validé est cliqué
    event.preventDefault(); //empeche la page de se rafraichir tt le temps
    setErreur(''); // On vide l'erreur à chaque nouvelle tentative

    const formData = new FormData(event.currentTarget); //recupérationd des données du form
    const idSaisi = formData.get('Id') as string;
    const collabIdSaisi = formData.get('collaborateurId') as string;

    const { data: idExiste } = await supabase
      .from('textes_collaborateurs')
      .select('id_utilisateur')
      .eq('id_utilisateur', idSaisi)
      .maybeSingle(); // On cherche si cet ID est déjà dans la table

    if (idExiste) {
      setErreur("Cet ID est déjà utilisé, rentrez un autre ID."); // On affiche le message si l'ID est pris
      return; // On arrête tout ici !
    }

    const reponse = await fetch(`/api/id?Id=${idSaisi}&collaborateurId=${collabIdSaisi}`); //envoie des données à l'API supabase
    
    if (reponse.ok){
      router.push(`/text?Id=${idSaisi}`); //si le serveur répond ok on passe à la page suivazntr + on garde l'id dans l'url comme ça la page d'après saura à qui est ce texte
    } else {
      alert("mise en lien avec le collaborateur impossible")
    }
  };

  return (
    <main>
      <div className="texte-center bg-pink-50 min-h-screen flex flex-col items-center justify-center"> 
        <h1 className="text-center font-bold mb-6 text-2xl">Bonjour et bienvenue sur GGcoder</h1>
        
        <form onSubmit={gererValidation} className="text-center bg-white p-8 rounded-3xl shadow-sm border border-pink-100 flex flex-col gap-4">
          
          <input 
            name="Id" 
            placeholder="Votre ID"
            className="border p-2 rounded-full outline-none focus:ring-2 focus:ring-pink-300"
            required />
          
          <input 
            name="collaborateurId" 
            placeholder="L'ID de votre collaborateur"
            className="border p-2 rounded-full outline-none focus:ring-2 focus:ring-pink-300"
            required />

          {/* AFFICHAGE DU MESSAGE D'ERREUR SI BESOIN */}
          {erreur && <p className="text-red-500 font-bold text-sm">{erreur}</p>}

          <button type="submit" className="bg-blue-500 text-white p-2 rounded-full font-bold hover:bg-blue-600 transition-all"> 
            Valider
          </button>
        </form>
      </div>
    </main>
  );
}