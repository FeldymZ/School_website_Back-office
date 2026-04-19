import api from "@/services/api"

const API = "/api/admin/sous-categories"

export const SousCategorieAdminService = {

  /* ================= GET ALL ================= */
  async getAll() {
    const res = await api.get(API)
    return res.data
  },

  /* ================= GET BY ID ================= */
  async getById(id: number) {
    const res = await api.get(`${API}/${id}`)
    return res.data
  },

  /* ================= CREATE ================= */
  async create(data: { libelle: string; categorieId: number }) {
    const res = await api.post(API, data)
    return res.data
  },

  /* ================= UPDATE ================= */
  async update(id: number, data: { libelle: string; categorieId: number }) {
    const res = await api.put(`${API}/${id}`, data)
    return res.data
  },

  /* ================= DELETE ================= */
  async delete(id: number) {
    await api.delete(`${API}/${id}`)
  }

}