'use strict';

const ChatSpace = require('../models/ChatSpace.model');
const Message   = require('../models/Message.model');
const { getIO }  = require('../sockets');
const { sendResponse } = require('../utils/apiResponse');
const asyncHandler     = require('../utils/asyncHandler');

// ── GET /student/chat/spaces ────────────────────────────────────────────────
const getSpaces = asyncHandler(async (req, res) => {
  const spaces = await ChatSpace.find()
    .sort({ isPermanent: -1, createdAt: 1 })
    .lean();

  return sendResponse(res, 200, {
    success: true,
    data: spaces,
    message: 'Chat spaces list retrieved.',
  });
});

// ── GET /student/chat/:spaceId/messages?page= ────────────────────────────────
const getMessages = asyncHandler(async (req, res) => {
  const { spaceId } = req.params;
  const page  = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 50));
  const skip  = (page - 1) * limit;

  const total = await Message.countDocuments({ space: spaceId });
  const rawMessages = await Message.find({ space: spaceId })
    .populate('sender', 'name rollNo profileImage role')
    .sort({ createdAt: 1 }) // Chronological chat ordering (oldest -> newest)
    .skip(skip)
    .limit(limit)
    .lean();

  // Sanitize deleted messages: return "[message deleted]" row
  const messages = rawMessages.map((m) => {
    if (m.deletedForAll) {
      return {
        ...m,
        content: '[message deleted]',
        attachments: [],
      };
    }
    return m;
  });

  return sendResponse(res, 200, {
    success: true,
    data: messages,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    message: 'Messages history retrieved.',
  });
});

// ── POST /student/chat/:spaceId/messages ────────────────────────────────────
const sendMessage = asyncHandler(async (req, res) => {
  const { spaceId } = req.params;
  const { content } = req.body;

  const space = await ChatSpace.findById(spaceId);
  if (!space) {
    return sendResponse(res, 404, {
      success: false,
      message: 'Chat space not found.',
      error: 'NOT_FOUND',
    });
  }

  // 1. Check if space is locked by admin
  if (space.isLocked) {
    return sendResponse(res, 403, {
      success: false,
      message: 'This space is currently locked by admin.',
      error: 'SPACE_LOCKED',
    });
  }

  // 2. Check if user is in blockedUsers list for this space
  if (space.blockedUsers?.some((id) => id.toString() === req.user._id.toString())) {
    return sendResponse(res, 403, {
      success: false,
      message: 'You have been removed from posting in this space by an administrator.',
      error: 'USER_BLOCKED',
    });
  }

  // Process attachments if uploaded via multer
  let attachments = [];
  if (req.files && Array.isArray(req.files)) {
    attachments = req.files.map((file) => {
      const isImg = file.mimetype.startsWith('image/');
      const isVid = file.mimetype.startsWith('video/');
      return {
        url: file.location || `/uploads/attachments/${file.filename}`,
        type: isImg ? 'image' : isVid ? 'video' : 'doc',
      };
    });
  } else if (req.body.attachments && Array.isArray(req.body.attachments)) {
    attachments = req.body.attachments;
  }

  if (!content?.trim() && attachments.length === 0) {
    return sendResponse(res, 400, {
      success: false,
      message: 'Message must contain text content or an attachment.',
      error: 'INVALID_INPUT',
    });
  }

  const message = await Message.create({
    space: spaceId,
    sender: req.user._id,
    content: (content || '').trim(),
    attachments,
  });

  const populated = await Message.findById(message._id)
    .populate('sender', 'name rollNo profileImage role')
    .lean();

  // Broadcast live socket event to space room
  const io = getIO();
  if (io) {
    io.of('/chat').to(spaceId).emit('message:new', populated);
  }

  return sendResponse(res, 201, {
    success: true,
    data: populated,
    message: 'Message sent successfully.',
  });
});

// ── POST /student/chat/messages/:id/react ──────────────────────────────────
const toggleReaction = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const message = await Message.findById(id);
  if (!message || message.deletedForAll) {
    return sendResponse(res, 404, {
      success: false,
      message: 'Message not found.',
      error: 'NOT_FOUND',
    });
  }

  const existingIdx = message.reactions.findIndex(
    (r) => r.user.toString() === userId.toString()
  );

  if (existingIdx >= 0) {
    message.reactions.splice(existingIdx, 1);
  } else {
    message.reactions.push({ user: userId, type: 'like' });
  }

  await message.save();

  const payload = {
    messageId: message._id,
    spaceId: message.space,
    reactions: message.reactions,
  };

  const io = getIO();
  if (io) {
    io.of('/chat').to(message.space.toString()).emit('reaction:toggle', payload);
  }

  return sendResponse(res, 200, {
    success: true,
    data: payload,
    message: 'Reaction updated.',
  });
});

// ── DELETE /student/chat/messages/:id ───────────────────────────────────────
const deleteMessageStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const message = await Message.findById(id);
  if (!message) {
    return sendResponse(res, 404, {
      success: false,
      message: 'Message not found.',
      error: 'NOT_FOUND',
    });
  }

  // ONLY allowed if req.user._id equals message.sender
  if (message.sender.toString() !== req.user._id.toString()) {
    return sendResponse(res, 403, {
      success: false,
      message: 'You can only delete your own messages.',
      error: 'FORBIDDEN',
    });
  }

  message.deletedForAll = true;
  message.deletedBy = null; // null for self-delete
  await message.save();

  const payload = {
    messageId: message._id,
    spaceId: message.space,
    deletedForAll: true,
    deletedBy: null,
  };

  const io = getIO();
  if (io) {
    io.of('/chat').to(message.space.toString()).emit('message:delete', payload);
  }

  return sendResponse(res, 200, {
    success: true,
    data: payload,
    message: 'Message deleted for all.',
  });
});

module.exports = {
  getSpaces,
  getMessages,
  sendMessage,
  toggleReaction,
  deleteMessageStudent,
};
