'use strict';

const ChatSpace = require('../../models/ChatSpace.model');
const Message   = require('../../models/Message.model');
const User      = require('../../models/User.model');
const { getIO }  = require('../../sockets');
const { sendResponse } = require('../../utils/apiResponse');
const asyncHandler     = require('../../utils/asyncHandler');

// ── GET /admin/chat/spaces ──────────────────────────────────────────────────
const listSpacesAdmin = asyncHandler(async (req, res) => {
  const spaces = await ChatSpace.find()
    .sort({ isPermanent: -1, createdAt: 1 })
    .lean();

  return sendResponse(res, 200, {
    success: true,
    data: spaces,
    message: 'Admin chat spaces retrieved.',
  });
});

// ── POST /admin/chat/spaces ─────────────────────────────────────────────────
const createSpaceAdmin = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name?.trim()) {
    return sendResponse(res, 400, {
      success: false,
      message: 'Space name is required.',
      error: 'INVALID_INPUT',
    });
  }

  // FORCE isPermanent to false regardless of request payload
  const space = await ChatSpace.create({
    name: name.trim(),
    isPermanent: false,
    isLocked: false,
    createdBy: req.user._id,
  });

  return sendResponse(res, 201, {
    success: true,
    data: space,
    message: 'New chat space created.',
  });
});

// ── PATCH /admin/chat/spaces/:id/lock ───────────────────────────────────────
const toggleLockSpace = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const space = await ChatSpace.findById(id);
  if (!space) {
    return sendResponse(res, 404, {
      success: false,
      message: 'Chat space not found.',
      error: 'NOT_FOUND',
    });
  }

  space.isLocked = !space.isLocked;
  await space.save();

  // Broadcast lock state change live via socket
  const io = getIO();
  if (io) {
    io.of('/chat').to(space._id.toString()).emit('space:lock', {
      spaceId: space._id,
      isLocked: space.isLocked,
    });
  }

  return sendResponse(res, 200, {
    success: true,
    data: space,
    message: `Space lock toggled to ${space.isLocked}.`,
  });
});

// ── DELETE /admin/chat/spaces/:id ───────────────────────────────────────────
const deleteSpaceAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const space = await ChatSpace.findById(id);
  if (!space) {
    return sendResponse(res, 404, {
      success: false,
      message: 'Chat space not found.',
      error: 'NOT_FOUND',
    });
  }

  // Reject if space is permanent
  if (space.isPermanent) {
    return sendResponse(res, 400, {
      success: false,
      message: 'The permanent community space cannot be deleted',
      error: 'CANNOT_DELETE_PERMANENT_SPACE',
    });
  }

  // Cascade-delete all messages in this space
  await Message.deleteMany({ space: id });
  await ChatSpace.findByIdAndDelete(id);

  return sendResponse(res, 200, {
    success: true,
    message: 'Chat space and associated messages deleted.',
  });
});

// ── DELETE /admin/chat/messages/:id ─────────────────────────────────────────
const deleteMessageAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const message = await Message.findById(id);
  if (!message) {
    return sendResponse(res, 404, {
      success: false,
      message: 'Message not found.',
      error: 'NOT_FOUND',
    });
  }

  message.deletedForAll = true;
  message.deletedBy = req.user._id; // Set admin user ID for moderation audit trail
  await message.save();

  const payload = {
    messageId: message._id,
    spaceId: message.space,
    deletedForAll: true,
    deletedBy: req.user._id,
  };

  const io = getIO();
  if (io) {
    io.of('/chat').to(message.space.toString()).emit('message:delete', payload);
  }

  return sendResponse(res, 200, {
    success: true,
    data: payload,
    message: 'Message moderated & deleted for all.',
  });
});

// ── POST /admin/chat/spaces/:id/remove-member ───────────────────────────────
const removeMemberAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { email, rollNo } = req.body;

  if (!email && !rollNo) {
    return sendResponse(res, 400, {
      success: false,
      message: 'Please provide either email or rollNo.',
      error: 'INVALID_INPUT',
    });
  }

  const query = {};
  if (email) query.email = email.trim().toLowerCase();
  else if (rollNo) query.rollNo = rollNo.trim().toUpperCase();

  const targetUser = await User.findOne(query);
  if (!targetUser) {
    return sendResponse(res, 404, {
      success: false,
      message: 'User not found with provided identifier.',
      error: 'NOT_FOUND',
    });
  }

  const space = await ChatSpace.findByIdAndUpdate(
    id,
    { $addToSet: { blockedUsers: targetUser._id } },
    { new: true }
  );

  if (!space) {
    return sendResponse(res, 404, {
      success: false,
      message: 'Chat space not found.',
      error: 'NOT_FOUND',
    });
  }

  return sendResponse(res, 200, {
    success: true,
    data: space,
    message: `User ${targetUser.name} (${targetUser.rollNo || targetUser.email}) removed from posting in this space.`,
  });
});

// ── POST /admin/chat/spaces/:spaceId/messages ────────────────────────────────
const postMessageAdmin = asyncHandler(async (req, res) => {
  const { spaceId } = req.params;
  const { content, attachments } = req.body;

  const space = await ChatSpace.findById(spaceId);
  if (!space) {
    return sendResponse(res, 404, {
      success: false,
      message: 'Chat space not found.',
      error: 'NOT_FOUND',
    });
  }

  if (!content?.trim() && (!attachments || attachments.length === 0)) {
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
    attachments: attachments || [],
  });

  const populated = await Message.findById(message._id)
    .populate('sender', 'name rollNo profileImage role')
    .lean();

  const io = getIO();
  if (io) {
    io.of('/chat').to(spaceId).emit('message:new', populated);
  }

  return sendResponse(res, 201, {
    success: true,
    data: populated,
    message: 'Admin message sent to space.',
  });
});

module.exports = {
  listSpacesAdmin,
  createSpaceAdmin,
  toggleLockSpace,
  deleteSpaceAdmin,
  deleteMessageAdmin,
  removeMemberAdmin,
  postMessageAdmin,
};
