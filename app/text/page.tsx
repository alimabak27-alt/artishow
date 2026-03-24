// "copier votre texte"

'use client'; 

import { useRouter, useSearchParams } from 'next/navigation';

export default function textPage() {
  const router=useRouter();
  const searchParams=useSearchParams();
  const monId=searchParams.get('Id');
  const gererEnvoiTexte=async(event : React.FormEvent<HTMLFormElement>)=>{
    event.preventDefault();
    const formData=new FormData(event.currentTarget);
    const texteSaisi=formData.get('contenuTexte'); //on prend le text
    //ensuite on utilise la mth POST --> comme letexte peut être long et ne pas rentrr dans l'url (ayant une taille max, on met le texte dans le Body)
    const reponse = await fetch('/api/text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // On prévient que c'est du format JSON
      },
      body: JSON.stringify({ 
        idUtilisateur: monId, 
        texte: texteSaisi 
      }) // Voici le contenu de mon body
    });

    if (reponse.ok) {
      // Si le serveur a bien découpé et sauvegardé
      router.push(`/processing?Id=${monId}`); //on sauvegarde bien l'id
    } else {
      alert("Erreur lors du découpage du texte.");
    }
  }
  return (
    <main>
      <div className="texte-center bg-pink-50 min-h-screen"> 
      <h1 className="text-center font-bold">Copiez votre texte ici...</h1>
      <form onSubmit={gererEnvoiTexte} className="text-center bg-pink-50 p-8 rounded-3xl shadow-sm">
        
        <textarea //mieux que input pour les longs textes
          name="contenuTexte" 
          placeholder="Votre ID"
          className="border p-2 rounded-full"
          required > </textarea>
    
        <button type="submit" className="bg-blue-500 text-white p-2 rounded-full"> Valider</button>
      </form>
    
      </div>
    </main>
    
  );
}

