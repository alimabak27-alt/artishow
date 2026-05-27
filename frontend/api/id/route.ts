
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase'; // j'importe la BDD créée avec supabase

export async function GET(request: NextRequest) { 
  const searchParams = request.nextUrl.searchParams; //on isole les paramètres de recherche de l'URL
  const monId = searchParams.get('Id'); //doit corresp au "name" des input
  const collabId = searchParams.get('collaborateurId'); //same

//Une API doit toujours répondre quelque chose au navigateur, sinon ça tourne dans le vide
// Si l'un des deux IDs manque, on arrête tout et ça affiche une erreur
  if (!monId || !collabId) { //ou
    return NextResponse.json({ erreur: "Il manque un ID !" }, { status: 400 });
  }

//insertion d'une nouvelle ligne dans table Supabase

  const { data, error } = await supabase
    .from('textes_collaborateurs') //nom de la table créée sur supabase
    .insert([
      { 
        id_utilisateur: monId, 
        id_collaborateur: collabId,
        contenu_texte: "Texte en attente..." 
      }
    ])
    .select(); //  select() permet de récupérer la ligne qu'on vient de créer pour vérifier s'il y a un problème avec BDD (ex erreur de co)
  if (error) {
    console.error("Erreur Supabase:", error);
    return NextResponse.json({ erreur: "Problème avec la bdd" }, { status: 500 });
  }

  // si pas d'erreur On répond que tout s'est bien passé !
  return NextResponse.json({ 
    message: "échange avec bdd effectué!", 
    donnees_inserees: data 
  });
}
