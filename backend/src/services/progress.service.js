'use strict';

const mongoose = require('mongoose');
const User = require('../models/User.model');

/**
 * Recalculates the profile/roadmap completion percentage for a given student.
 * Compares completed checklist items against the total admin-curated SkillRoadmap items.
 *
 * @param {string} userId - User document ID
 * @returns {Promise<number>} Updated completion percentage
 */
async function recalculateCompletionPercent(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Get total curated roadmap items in the DB
  let totalRoadmapItems = 0;
  
  // Checking mongoose.models defensively because SkillRoadmap is defined in Phase 7
  if (mongoose.models.SkillRoadmap) {
    try {
      const SkillRoadmap = mongoose.model('SkillRoadmap');
      totalRoadmapItems = await SkillRoadmap.countDocuments({ isActive: true });
    } catch (err) {
      console.warn('[Progress] SkillRoadmap model check failed, defaulting total to 0:', err.message);
      totalRoadmapItems = 0;
    }
  }

  if (totalRoadmapItems === 0) {
    // If no roadmap items exist, default completion is 0%
    user.progress.completionPercent = 0;
    await user.save();
    return 0;
  }

  const checklist = user.progress?.roadmapChecklist || [];
  const completedCount = checklist.filter(item => item.done).length;

  const percentage = Math.min(100, Math.round((completedCount / totalRoadmapItems) * 100));
  user.progress.completionPercent = percentage;
  await user.save();

  return percentage;
}

module.exports = { recalculateCompletionPercent };
