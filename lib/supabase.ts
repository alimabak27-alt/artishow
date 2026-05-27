//fichier qui permet d'éviter de réecrire les mdp à chaque fois qu'on parle à la BDD
//ce fichier s'occupe donc de la connexion

import { createClient } from '@supabase/supabase-js'

// On récupère les clés secrètes depuis le fichier .env.local
// le ! permet d'assurer l'existance de la variable (pour pas que typescript plante)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// On crée l'outil de connexion qu'on pourra réutiliser partout
export const supabase = createClient(supabaseUrl, supabaseKey)