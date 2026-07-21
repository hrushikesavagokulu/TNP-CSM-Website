'use strict';

const User        = require('../../models/User.model');
const Announcement = require('../../models/Announcement.model');
const Achievement = require('../../models/Achievement.model');
const CompanyInfo = require('../../models/CompanyInfo.model');
const AlumniRepo  = require('../../models/AlumniRepo.model');
const ChatSpace   = require('../../models/ChatSpace.model');
const Message     = require('../../models/Message.model');
const SkillRoadmap = require('../../models/SkillRoadmap.model');
const Certification = require('../../models/Certification.model');

const { sendResponse } = require('../../utils/apiResponse');
const asyncHandler     = require('../../utils/asyncHandler');

// ── GET /admin/overview-stats ─────────────────────────────────────────────────
const getOverviewStats = asyncHandler(async (req, res) => {
  const [
    totalStudents,
    totalAdmins,
    totalAnnouncements,
    totalAchievements,
    totalCompanies,
    totalAlumni,
    totalChatSpaces,
    recentMessages,
    totalSemesters,
    totalCertifications,
  ] = await Promise.all([
    // 1. Total students
    User.countDocuments({ role: 'student' }),

    // 2. Total admins
    User.countDocuments({ role: 'admin' }),

    // 3. Total announcements
    Announcement.countDocuments({}),

    // 4. Total achievements
    Achievement.countDocuments({}),

    // 5. Total companies
    CompanyInfo.countDocuments({}),

    // 6. Total alumni entries
    AlumniRepo.countDocuments({}),

    // 7. Total chat spaces
    ChatSpace.countDocuments({}),

    // 8. Message count in the last 24 hours across all spaces (Connect Sphere activity)
    Message.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      deletedForAll: { $ne: true },
    }),

    // 9. Total skill roadmap semesters
    SkillRoadmap.countDocuments({}),

    // 10. Total certifications
    Certification.countDocuments({}),
  ]);

  // Recent achievements (last 5, newest first)
  const recentAchievements = await Achievement.find()
    .sort({ date: -1 })
    .limit(5)
    .select('title date')
    .lean();

  // Recent announcements (last 5, newest first)
  const recentAnnouncements = await Announcement.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select('title createdAt targetAudience')
    .lean();

  return sendResponse(res, 200, {
    success: true,
    data: {
      counts: {
        students: totalStudents,
        admins: totalAdmins,
        announcements: totalAnnouncements,
        achievements: totalAchievements,
        companies: totalCompanies,
        alumni: totalAlumni,
        chatSpaces: totalChatSpaces,
        recentMessages24h: recentMessages,
        skillSemesters: totalSemesters,
        certifications: totalCertifications,
      },
      recent: {
        achievements: recentAchievements,
        announcements: recentAnnouncements,
      },
    },
    message: 'Admin overview statistics retrieved.',
  });
});

module.exports = { getOverviewStats };
