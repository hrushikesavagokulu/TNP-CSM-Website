import api from '../../services/api';

const studentsService = {
  /** GET /admin/students?page=&limit=&year=&branch=&batchType=&search= */
  getStudents: async (params) => {
    const res = await api.get('/admin/students', { params });
    return res.data.data; // { students, pagination }
  },

  /** POST /admin/students (Create single StudentNominal) */
  addStudentNominal: async (payload) => {
    const res = await api.post('/admin/students', payload);
    return res.data.data;
  },

  /** POST /admin/students/bulk-import */
  bulkImportStudents: async (formData) => {
    const res = await api.post('/admin/students/bulk-import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.data; // { importedCount, errors }
  },

  /** PATCH /admin/students/:id */
  updateStudent: async (id, payload) => {
    const res = await api.patch(`/admin/students/${id}`, payload);
    return res.data.data;
  },

  /** DELETE /admin/students/:id */
  deleteStudent: async (id) => {
    await api.delete(`/admin/students/${id}`);
  },
};

export default studentsService;
