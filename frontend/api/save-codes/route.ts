import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { idUtilisateur, indexParagraphe, codes } = await request.json();

    // On récupère d'abord ce qui existe déjà dans la base
    const { data: ligneActuelle } = await supabase
      .from('textes_collaborateurs')
      .select('resultats_codage')
      .eq('id_utilisateur', idUtilisateur)
      .single();

    // je prépare le nouvel objet JSON
    // Si la colonne est vide, je crée un objet vide {}, sinon je garde l'existant
    let codageMisAJour = ligneActuelle?.resultats_codage || {};

    // On ajoute (ou on remplace) les codes pour l'index du paragraphe actuel
    // Exemple : { "0": ["codeA", "codeB"], "1": ["codeC"] }
    codageMisAJour[indexParagraphe] = codes.filter((c: string) => c && c.trim() !== "");

    // enregistrement de tt ça dans supabase
    const { error } = await supabase
      .from('textes_collaborateurs')
      .update({ resultats_codage: codageMisAJour })
      .eq('id_utilisateur', idUtilisateur);

    if (error) throw error;

    return NextResponse.json({ message: "Codes sauvegardés !" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ erreur: "Erreur serveur" }, { status: 500 });
  }
}