// api sauvegarde decision finale

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase'; // mon passe-partout bdd

export async function POST(request: Request) { 
    // recupération des données envoyées par la page
    const corps = await request.json();
    const { idUtilisateur, indexParagraphe, decision } = corps;

    // validation des données
    if (!idUtilisateur || indexParagraphe === undefined || decision === undefined) {
        return NextResponse.json({ error: "Il manque des infos !" }, { status: 400 });
    }

    // On cherche qui est le créateur original (pour savoir dans quelle ligne écrire)
    // Tentative 1 : L'utilisateur est le créateur
    let { data: ligne } = await supabase
        .from('textes_collaborateurs')
        .select('id_utilisateur, resultats_codage_final')
        .eq('id_utilisateur', idUtilisateur)
        .maybeSingle();

    // Tentative 2 : L'utilisateur est le collaborateur (le cas de bb)
    if (!ligne) {
        const { data: ligneInvite } = await supabase
            .from('textes_collaborateurs')
            .select('id_utilisateur, resultats_codage_final')
            .eq('id_collaborateur', idUtilisateur)
            .maybeSingle();
        ligne = ligneInvite;
    }

    if (!ligne) {
        return NextResponse.json({ error: "Ligne introuvable !" }, { status: 404 });
    }

    const createurOriginal = ligne.id_utilisateur;

    // --- MISE À JOUR DU JSON ---
    let jsonFinal = ligne.resultats_codage_final || {};
    
    // On enregistre la décision pour ce paragraphe précis
    jsonFinal[indexParagraphe] = decision;

    const { error: erreurUpdate } = await supabase
        .from('textes_collaborateurs')
        .update({ resultats_codage_final: jsonFinal })
        .eq('id_utilisateur', createurOriginal);

    if (erreurUpdate) {
        return NextResponse.json({ error: erreurUpdate.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}