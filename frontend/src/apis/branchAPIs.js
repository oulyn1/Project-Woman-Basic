// src/apis/branchAPIs.js
import axios from 'axios'
import { API_ROOT } from '../util/constants'

// Ưu tiên gọi thẳng backend theo chuẩn v1.
// Nếu bạn vẫn đang dùng proxy '/api' trong Vite, có thể đổi Fallback ở dưới.
const BASE = `${API_ROOT}/v1/branches`
// Fallback nếu bạn chưa cấu hình API_ROOT hoặc vẫn muốn gọi qua proxy Vite:
// const BASE = '/api/branches'

// ---- helper chuẩn hoá lỗi ----
const normalizeError = (err) => {
  const message =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    'Request failed'
  const e = new Error(message)
  e.status = err?.response?.status
  e.data = err?.response?.data
  return e
}
const unwrap = (promise) =>
  promise.then((r) => r.data).catch((err) => { throw normalizeError(err) })

// ---- APIs ----

// GET /v1/branches?search=...
export const getBranches = (params = {}) =>
  unwrap(axios.get(`${BASE}`, { params }))

// GET /v1/branches/:id
export const getBranchById = (id) =>
  unwrap(axios.get(`${BASE}/${id}`))

// Alias (nơi khác lỡ import tên này)
export { getBranchById as getBranchDetail }

// POST /v1/branches
export const createBranch = (payload) =>
  unwrap(axios.post(`${BASE}`, payload))

// PUT /v1/branches/:id
export const updateBranch = (id, payload) =>
  unwrap(axios.put(`${BASE}/${id}`, payload))

// DELETE /v1/branches/:id
export const deleteBranch = (id) =>
  unwrap(axios.delete(`${BASE}/${id}`))

// PATCH /v1/branches/:id/active
export const toggleActive = (id, isActive) =>
  unwrap(axios.patch(`${BASE}/${id}/active`, { isActive }))
