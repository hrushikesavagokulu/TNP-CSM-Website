import api from '../api';

const adminChatService = {
  listSpaces: async () => {
    const res = await api.get('/admin/chat/spaces');
    return res.data.data;
  },
  createSpace: async (name) => {
    const res = await api.post('/admin/chat/spaces', { name });
    return res.data.data;
  },
  toggleLockSpace: async (spaceId) => {
    const res = await api.patch(`/admin/chat/spaces/${spaceId}/lock`);
    return res.data.data;
  },
  deleteSpace: async (spaceId) => {
    const res = await api.delete(`/admin/chat/spaces/${spaceId}`);
    return res.data;
  },
  deleteMessage: async (messageId) => {
    const res = await api.delete(`/admin/chat/messages/${messageId}`);
    return res.data.data;
  },
  removeMember: async (spaceId, identifier) => {
    const isEmail = identifier.includes('@');
    const payload = isEmail ? { email: identifier } : { rollNo: identifier };
    const res = await api.post(`/admin/chat/spaces/${spaceId}/remove-member`, payload);
    return res.data.data;
  },
  sendMessage: async (spaceId, { content, attachments }) => {
    const res = await api.post(`/admin/chat/spaces/${spaceId}/messages`, { content, attachments });
    return res.data.data;
  },
};

export default adminChatService;
