'use strict';

const User           = require('../../models/User.model');
const StudentNominal = require('../../models/StudentNominal.model');
const excelService   = require('../../services/excelImport.service');
const { sendResponse } = require('../../utils/apiResponse');
const asyncHandler   = require('../../utils/asyncHandler');

// ── GET /admin/students ──────────────────────────────────────────────────────
const getStudents = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const { year, branch, batchType, search } = req.query;

  // Build filter query for student users
  const filter = { role: 'student' };

  if (year)       filter.year = parseInt(year, 10);
  if (branch)     filter.branch = branch;
  if (batchType)  filter.batchType = batchType;

  if (search && search.trim()) {
    const regex = new RegExp(search.trim(), 'i');
    filter.$or = [
      { name: { $regex: regex } },
      { rollNo: { $regex: regex } },
    ];
  }

  const [students, total] = await Promise.all([
    User.find(filter)
      .sort({ rollNo: 1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  return sendResponse(res, 200, {
    success: true,
    data: {
      students,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
    message: 'Students list retrieved successfully',
  });
});

// ── POST /admin/students (Create single StudentNominal) ──────────────────────
const addStudentNominal = asyncHandler(async (req, res) => {
  const { rollNo, email, name } = req.body;

  if (!rollNo || !email || !name) {
    return sendResponse(res, 400, {
      success: false,
      message: 'rollNo, email, and name are required.',
      error: 'MISSING_FIELDS',
    });
  }

  const cleanRollNo = rollNo.trim().toUpperCase();
  const cleanEmail = email.trim().toLowerCase();

  // Uniqueness check across Users and Nominals
  const [userExists, nominalExists] = await Promise.all([
    User.exists({ $or: [{ rollNo: cleanRollNo }, { email: cleanEmail }] }),
    StudentNominal.exists({ $or: [{ rollNo: cleanRollNo }, { email: cleanEmail }] }),
  ]);

  if (userExists) {
    return sendResponse(res, 409, {
      success: false,
      message: 'A student with this roll number or email is already registered.',
      error: 'ALREADY_REGISTERED',
    });
  }

  if (nominalExists) {
    return sendResponse(res, 409, {
      success: false,
      message: 'A student with this roll number or email is already present in the nominal roster.',
      error: 'NOMINAL_EXISTS',
    });
  }

  const newNominal = await StudentNominal.create({
    rollNo: cleanRollNo,
    email: cleanEmail,
    name: name.trim(),
    addedBy: req.user._id,
  });

  return sendResponse(res, 201, {
    success: true,
    data: newNominal,
    message: 'Student added to nominal roster successfully.',
  });
});

// ── POST /admin/students/bulk-import ─────────────────────────────────────────
const bulkImportStudents = asyncHandler(async (req, res) => {
  if (!req.file) {
    return sendResponse(res, 400, {
      success: false,
      message: 'No nominal sheet file provided.',
      error: 'NO_FILE',
    });
  }

  // Parse Excel file via excelImport service
  const { validRows, errors } = await excelService.parseStudentNominalSheet(
    req.file.buffer,
    req.user._id
  );

  // Insert valid rows into StudentNominal collection (ignore block fails on db validation)
  let importedCount = 0;
  if (validRows.length > 0) {
    const result = await StudentNominal.insertMany(validRows, { ordered: false });
    importedCount = result.length;
  }

  return sendResponse(res, 200, {
    success: true,
    data: {
      importedCount,
      errors,
    },
    message: `Import completed. Imported ${importedCount} rows successfully, with ${errors.length} errors.`,
  });
});

// ── PATCH /admin/students/:id ────────────────────────────────────────────────
const updateStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  // Prevent email or rollNo modification by admins to preserve roster integrity
  if ('email' in updates || 'rollNo' in updates) {
    return sendResponse(res, 400, {
      success: false,
      message: 'Modifying student email or roll number directly is prohibited.',
      error: 'FIELD_LOCKED',
    });
  }

  const updatedStudent = await User.findOneAndUpdate(
    { _id: id, role: 'student' },
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!updatedStudent) {
    return sendResponse(res, 404, {
      success: false,
      message: 'Active student user profile not found.',
      error: 'NOT_FOUND',
    });
  }

  return sendResponse(res, 200, {
    success: true,
    data: updatedStudent,
    message: 'Student profile updated by administrator.',
  });
});

// ── DELETE /admin/students/:id ───────────────────────────────────────────────
const deleteStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Try to delete from registered Users and nominal approved lists
  const [userDeleted, nominalDeleted] = await Promise.all([
    User.findOneAndDelete({ _id: id, role: 'student' }),
    StudentNominal.findByIdAndDelete(id),
  ]);

  if (!userDeleted && !nominalDeleted) {
    return sendResponse(res, 404, {
      success: false,
      message: 'Student record not found in system databases.',
      error: 'NOT_FOUND',
    });
  }

  return sendResponse(res, 200, {
    success: true,
    message: 'Student record deleted from roster database.',
  });
});

module.exports = {
  getStudents,
  addStudentNominal,
  bulkImportStudents,
  updateStudent,
  deleteStudent,
};
