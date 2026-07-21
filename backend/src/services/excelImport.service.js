'use strict';

/**
 * excelImport.service.js
 *
 * Choice: SEPARATE COLLECTION DESIGN
 * We store invited unregistered students in the StudentNominal collection.
 * This separates actual registered profiles (User) from pre-approved roster lists (StudentNominal).
 * Only roll numbers/emails in StudentNominal (or AdminAllowList) can register.
 */

const XLSX = require('xlsx');
const User = require('../models/User.model');
const StudentNominal = require('../models/StudentNominal.model');

/**
 * Parses the student nominal spreadsheet.
 * Expects columns: 'rollNo', 'email' (and optionally 'name').
 * Filters duplicates against existing Users and StudentNominals.
 *
 * @param {Buffer} fileBuffer - Spreadsheet file buffer from multer
 * @param {string} adminId - Inviting admin user ID
 * @returns {Promise<Object>} Results containing valid rows and parsing errors list
 */
async function parseStudentNominalSheet(fileBuffer, adminId) {
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json(sheet);

  const validRows = [];
  const errors = [];

  for (let i = 0; i < rawRows.length; i++) {
    const rowNum = i + 2; // Row number in Excel sheet (1-based + 1 for header)
    const rawRow = rawRows[i];

    // Find headers case-insensitively
    let rollNoKey = null;
    let emailKey = null;
    let nameKey = null;

    for (const key of Object.keys(rawRow)) {
      const lowerKey = key.toLowerCase().trim();
      if (lowerKey === 'rollno' || lowerKey === 'roll no' || lowerKey === 'roll_no') {
        rollNoKey = key;
      } else if (lowerKey === 'email' || lowerKey === 'gmail' || lowerKey === 'email address') {
        emailKey = key;
      } else if (lowerKey === 'name' || lowerKey === 'full name' || lowerKey === 'fullname') {
        nameKey = key;
      }
    }

    if (!rollNoKey || !emailKey) {
      errors.push({
        row: rowNum,
        reason: "Missing columns. Row must have 'rollNo' and 'email' headers.",
      });
      continue;
    }

    const rollNo = String(rawRow[rollNoKey] || '').trim().toUpperCase();
    const email = String(rawRow[emailKey] || '').trim().toLowerCase();
    const name = nameKey ? String(rawRow[nameKey] || '').trim() : 'Nominal Student';

    // ── Input validations ────────────────────────────────────────────────────
    if (!rollNo || rollNo.length < 3) {
      errors.push({ row: rowNum, reason: `Invalid or missing roll number: ${rollNo || 'empty'}` });
      continue;
    }

    if (!email || !email.includes('@')) {
      errors.push({ row: rowNum, reason: `Invalid or missing email: ${email || 'empty'}` });
      continue;
    }

    if (!name) {
      errors.push({ row: rowNum, reason: "Student name is required." });
      continue;
    }

    // ── Database checks ──────────────────────────────────────────────────────
    try {
      const userExists = await User.exists({ $or: [{ rollNo }, { email }] });
      if (userExists) {
        errors.push({
          row: rowNum,
          reason: `Student with rollNo ${rollNo} or email ${email} is already registered.`,
        });
        continue;
      }

      const nominalExists = await StudentNominal.exists({ $or: [{ rollNo }, { email }] });
      if (nominalExists) {
        errors.push({
          row: rowNum,
          reason: `Duplicate row: Student with rollNo ${rollNo} or email ${email} already in nominal list.`,
        });
        continue;
      }

      // Check current batch duplicates in active sheet run
      const duplicateInBatch = validRows.some(
        (r) => r.rollNo === rollNo || r.email === email
      );
      if (duplicateInBatch) {
        errors.push({
          row: rowNum,
          reason: `Row duplicates another student in this spreadsheet.`,
        });
        continue;
      }

      validRows.push({
        rollNo,
        email,
        name,
        addedBy: adminId,
      });

    } catch (err) {
      errors.push({ row: rowNum, reason: `DB Verification failed: ${err.message}` });
    }
  }

  return { validRows, errors };
}

/**
 * Parses an Excel/CSV sheet for batch member bulk-import.
 * Expects columns: 'rollNo' and 'email' (case-insensitive headers, same patterns as above).
 * Does NOT perform DB checks — those happen in the batch controller's shared helper
 * so that year-mismatch and duplicate errors can be collected per-row without blocking others.
 *
 * @param {Buffer} fileBuffer - Spreadsheet file buffer from multer
 * @returns {{ validRows: Array<{rollNo, email}>, errors: Array<{row, reason}> }}
 */
function parseBatchMembersSheet(fileBuffer) {
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json(sheet);

  const validRows = [];
  const errors    = [];

  for (let i = 0; i < rawRows.length; i++) {
    const rowNum = i + 2;
    const rawRow = rawRows[i];

    let rollNoKey = null;
    let emailKey  = null;

    for (const key of Object.keys(rawRow)) {
      const lowerKey = key.toLowerCase().trim();
      if (lowerKey === 'rollno' || lowerKey === 'roll no' || lowerKey === 'roll_no') {
        rollNoKey = key;
      } else if (lowerKey === 'email' || lowerKey === 'gmail' || lowerKey === 'email address') {
        emailKey = key;
      }
    }

    if (!rollNoKey && !emailKey) {
      errors.push({ row: rowNum, reason: "Missing columns. Row must have 'rollNo' and/or 'email' headers." });
      continue;
    }

    const rollNo = rollNoKey ? String(rawRow[rollNoKey] || '').trim().toUpperCase() : '';
    const email  = emailKey  ? String(rawRow[emailKey]  || '').trim().toLowerCase() : '';

    if (!rollNo && !email) {
      errors.push({ row: rowNum, reason: 'Both rollNo and email are empty — skipping row.' });
      continue;
    }

    if (email && !email.includes('@')) {
      errors.push({ row: rowNum, reason: `Invalid email format: ${email}` });
      continue;
    }

    // Check for duplicates within this sheet run
    const dupInBatch = validRows.some(
      (r) => (rollNo && r.rollNo === rollNo) || (email && r.email === email)
    );
    if (dupInBatch) {
      errors.push({ row: rowNum, reason: `Duplicate entry in this sheet (rollNo: ${rollNo || '-'} / email: ${email || '-'}).` });
      continue;
    }

    validRows.push({ rollNo, email });
  }

  return { validRows, errors };
}

module.exports = { parseStudentNominalSheet, parseBatchMembersSheet };


