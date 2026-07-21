import api from '../api';

const batchesService = {
  /** GET /admin/batches?year= */
  getBatches: async (year) => {
    const params = year ? { year } : {};
    const res = await api.get('/admin/batches', { params });
    return res.data.data; // array of batch objects with memberCount
  },

  /** POST /admin/batches — { name, year } */
  createBatch: async ({ name, year }) => {
    const res = await api.post('/admin/batches', { name, year });
    return res.data.data;
  },

  /** PATCH /admin/batches/:id — rename only */
  renameBatch: async (id, name) => {
    const res = await api.patch(`/admin/batches/${id}`, { name });
    return res.data.data;
  },

  /** DELETE /admin/batches/:id */
  deleteBatch: async (id) => {
    const res = await api.delete(`/admin/batches/${id}`);
    return res.data;
  },

  /** GET /admin/batches/:id/members */
  getMembers: async (id) => {
    const res = await api.get(`/admin/batches/${id}/members`);
    return res.data.data; // { batch, members }
  },

  /** POST /admin/batches/:id/add-members — { rollNos?, emails? } */
  addMembers: async (id, { rollNos, emails }) => {
    const res = await api.post(`/admin/batches/${id}/add-members`, { rollNos, emails });
    return res.data.data; // { addedCount, errors }
  },

  /** POST /admin/batches/:id/add-members/bulk-import — multipart FormData (field: file) */
  bulkImportMembers: async (id, formData) => {
    const res = await api.post(`/admin/batches/${id}/add-members/bulk-import`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data; // { addedCount, errors }
  },

  /** POST /admin/batches/:id/remove-members — { rollNos?, emails? } */
  removeMembers: async (id, { rollNos, emails }) => {
    const res = await api.post(`/admin/batches/${id}/remove-members`, { rollNos, emails });
    return res.data.data; // { removedCount }
  },
};

export default batchesService;
