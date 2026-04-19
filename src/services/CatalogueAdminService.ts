import api from "@/services/api"

const API = "/api/admin/categories"

export const CatalogueAdminService = {

  async getCategories() {
    try {
      const res = await api.get(API)
      return res.data
    } catch (error) {
      console.error("Erreur getCategories", error)
      throw error
    }
  },

  async createCategorie(libelle: string) {
    try {
      const res = await api.post(API, { libelle })
      return res.data
    } catch (error) {
      console.error("Erreur createCategorie", error)
      throw error
    }
  },

  async updateCategorie(id: number, libelle: string) {
    try {
      const res = await api.put(`${API}/${id}`, { libelle })
      return res.data
    } catch (error) {
      console.error("Erreur updateCategorie", error)
      throw error
    }
  },

  async deleteCategorie(id: number) {
    try {
      await api.delete(`${API}/${id}`)
    } catch (error) {
      console.error("Erreur deleteCategorie", error)
      throw error
    }
  }
}