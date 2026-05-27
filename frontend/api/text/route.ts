import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase'; 

export async function POST(request: NextRequest) { 
  // On ouvre le body reçu du frontend
  const data = await request.json();
  const texte = data.texte;
  const idUtilisateur = data.idUtilisateur;

  if (!texte || !idUtilisateur) {
    return NextResponse.json({ erreur: "Données manquantes" }, { status: 400 });
  }

  // découpage du texte en paragraphes
  // On coupe à chaque saut de ligne (\n) et on enlève les lignes vides (cf q&a sur git)
  const tableauParagraphes = texte.split('\n').filter((paragraphe: string) => paragraphe.trim() !== '');

  //  mise à jour  bdd Supabase
  //  transforme le tableau en format texte (JSON.stringify) pour que la bdd l'accepte 
  const texteDecoupe = JSON.stringify(tableauParagraphes);

  // On cherche la ligne qu'on avait créée avec Alice/Bob, et on la met à jour (update)
  const { error } = await supabase
    .from('textes_collaborateurs')
    .update({ contenu_texte: texteDecoupe })
    .eq('id_utilisateur', idUtilisateur); // "Mets à jour uniquement la ligne où l'ID est celui qui convient

  if (error) {
    console.error("Erreur Supabase:", error);
    return NextResponse.json({ erreur: "Impossible de découper le texte" }, { status: 500 });
  }

  // On répond au frontend que tout est fini
  return NextResponse.json({ 
    message: "Texte découpé et sauvegardé !",
    nombreDeParagraphes: tableauParagraphes.length
  });
}