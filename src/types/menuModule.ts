/** Un module = un lien du menu (vers une page existante) + sa clé d'accès */
export interface MenuModule {
  id: number
  cle: string | null              // null = pas de case d'accès
  libelle: string                 // texte du lien
  chemin: string                  // ex. "/demandes-devis"
  section: string                 // titre de section dans le menu
  groupe: string | null           // sous-menu dépliable (null = lien direct)
  icone: string | null
  ordre: number
  actif: boolean                  // false = masqué du menu
  systeme: boolean                // module d'origine (lien et clé verrouillés)
  superAdminSeulement: boolean    // visible uniquement par les SUPERADMIN
}

export interface MenuModulePayload {
  cle: string | null
  libelle: string
  chemin: string
  section: string
  groupe: string | null
  icone: string | null
  actif: boolean
  superAdminSeulement: boolean
}   