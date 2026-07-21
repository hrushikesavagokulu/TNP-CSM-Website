import api from './api';

const chatService = {
  getSpaces: async () => {
    const res = await api.get('/student/chat/spaces');
    return res.data.data;
  },
  getMessages: async (spaceId, page = 1) => {
    const res = await api.get(`/student/chat/${spaceId}/messages`, { params: { page } });
    return res.data;
  },
  sendMessage: async (spaceId, formDataOrPayload) => {
    const isFormData = formDataOrPayload instanceof FormData;
    const res = await api.post(`/student/chat/${spaceId}/messages`, formDataOrPayload, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return res.data.data;
  },
  toggleReaction: async (messageId) => {
    const res = await api.post(`/student/chat/messages/${messageId}/react`);
    return res.data.data;
  },
  deleteMessage: async (messageId) => {
    const res = await api.delete(`/student/chat/messages/${messageId}`);
    return res.data.data;
  },
};

export default chatService;
