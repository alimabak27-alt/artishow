// frame 1 -> accueil/ID, page sur laqulle on atterit

'use client'; // Obligatoire car je gère un clic utilisateur 

import { useRouter } from 'next/navigation';

export default function homePage() {
  const router=useRouter()
  const gererValidation=async (event: React.FormEvent<HTMLFormElement>)=>{ //fct qui s'active quand le bouton validé est cliqué
    event.preventDefault(); //empeche la page de se rafraichir tt le temps
    const formData = new FormData(event.currentTarget); //recupérationd des données du form
    const idSaisi = formData.get('Id');
    const collabIdSaisi = formData.get('collaborateurId');
    const reponse = await fetch(`/api/id?Id=${idSaisi}&collaborateurId=${collabIdSaisi}`); //envoie des données à l'API supabase
    if (reponse.ok){
      router.push(`/text?Id=${idSaisi}`); //si le serveur répond ok on passe à la page suivazntr + on garde l'id dans l'url comme ça la page d'après saura à qui est ce texte

    } else{
      alert("mise en lien avec le collaborateur impossible")
    }
  };
  return (
    <main>
      <div className="texte-center bg-pink-50 min-h-screen"> 
      <h1 className="text-center font-bold">Bonjour et bienvenue sur GGcoder</h1>
      <form onSubmit={gererValidation} className="text-center bg-pink-50 p-8 rounded-3xl shadow-sm">
        
        <input 
          name="Id" 
          placeholder="Votre ID"
          className="border p-2 rounded-full"
          required />
         <input 
          name="collaborateurId" 
          placeholder="L'ID de votre collaborateur"
          className="border p-2 rounded-full"
          required />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded-full"> Valider</button>
      </form>
    
      </div>
    </main>
    
  );
}