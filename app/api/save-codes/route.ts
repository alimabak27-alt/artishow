import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { idUtilisateur, indexParagraphe, codes } = await request.json();

    // 1. On utilise maybeSingle() au lieu de single() pour ne pas faire planter l'API si la ligne n'existe pas
    const { data: ligneActuelle } = await supabase
      .from('textes_collaborateurs')
      .select('resultats_codage')
      .eq('id_utilisateur', idUtilisateur)
      .maybeSingle();

    // 2. Je prépare le nouvel objet JSON
    let codageMisAJour = ligneActuelle?.resultats_codage || {};

    // On ajoute les codes pour l'index du paragraphe actuel (en enlevant les cases vides)
    codageMisAJour[indexParagraphe] = codes.filter((c: string) => c && c.trim() !== "");

    // 3. LA MAGIE : On met à jour OU on crée la ligne selon la situation
    if (ligneActuelle) {
        // Cas A : La ligne existe (c'est le créateur du texte, par exemple)
        const { error } = await supabase
          .from('textes_collaborateurs')
          .update({ resultats_codage: codageMisAJour })
          .eq('id_utilisateur', idUtilisateur);
          
        if (error) throw error;
    } else {
        // Cas B : La ligne n'existe pas encore (c'est l'invité !), on la crée
        const { error } = await supabase
          .from('textes_collaborateurs')
          .insert([
            {
                id_utilisateur: idUtilisateur,
                resultats_codage: codageMisAJour
            }
          ]);
          
        if (error) throw error;
    }

    return NextResponse.json({ message: "Codes sauvegardés avec succès !" });
  } catch (error) {
    console.error("Erreur API save-codes:", error);
    return NextResponse.json({ erreur: "Erreur serveur lors de la sauvegarde" }, { status: 500 });
  }
}