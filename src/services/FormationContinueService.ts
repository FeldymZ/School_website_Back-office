import api from "@/services/api"

const API = "/api/admin/formations"

export const FormationContinueService = {

  /* ================= GET ================= */

  async getAll(page = 0, size = 10) {
    const res = await api.get(`${API}?page=${page}&size=${size}`)
    return res.data
  },

  async getById(id: number) {
    const res = await api.get(`${API}/${id}`)
    return res.data
  },

  /* ================= CREATE ================= */

  async create(sousCategorieId: number, formData: FormData) {
    const res = await api.post(
      `${API}?sousCategorieId=${sousCategorieId}`,
      formData
    )
    return res.data
  },

  /* ================= UPDATE ================= */

  async update(id: number, formData: FormData) {
    const res = await api.put(`${API}/${id}`, formData)
    return res.data
  },

  /* ================= DELETE ================= */

  async delete(id: number) {
    await api.delete(`${API}/${id}`)
  },

  /* ================= TOGGLE (🔥 NEW) ================= */

  async toggle(id: number) {
    const res = await api.patch(`${API}/${id}/toggle`)
    return res.data
  },

  /* ================= SEARCH ================= */

  async getByReference(reference: number) {
    const res = await api.get(`${API}/search?reference=${reference}`)
    return res.data
  },

  /* ================= FILTER ================= */

  async filter(
    categorieId?: number,
    sousCategorieId?: number,
    page = 0,
    size = 10
  ) {
    const params = new URLSearchParams()

    if (categorieId) params.append("categorieId", categorieId.toString())
    if (sousCategorieId) params.append("sousCategorieId", sousCategorieId.toString())

    params.append("page", page.toString())
    params.append("size", size.toString())

    const res = await api.get(`${API}/filter?${params.toString()}`)
    return res.data
  }
}