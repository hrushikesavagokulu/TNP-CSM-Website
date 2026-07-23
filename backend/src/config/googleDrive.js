'use strict';

const fs = require('fs');
const { google } = require('googleapis');

let cachedAuth = null;
let cachedDrive = null;
let cachedServiceAccountEmail = null;

/**
 * Helper to parse service account credentials from GOOGLE_SERVICE_ACCOUNT_JSON env var.
 * Env var can be a raw JSON string or a file path to a .json keyfile.
 */
function getCredentials() {
  const jsonOrPath = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!jsonOrPath) {
    throw new Error(
      'GOOGLE_SERVICE_ACCOUNT_JSON is missing in environment variables. ' +
      'Please provide the service account JSON string or path to service account key file.'
    );
  }

  let creds;
  const trimmed = jsonOrPath.trim();
  if (trimmed.startsWith('{')) {
    try {
      creds = JSON.parse(trimmed);
    } catch (err) {
      throw new Error(`Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON string: ${err.message}`);
    }
  } else {
    // Treat as file path
    try {
      const content = fs.readFileSync(trimmed, 'utf8');
      creds = JSON.parse(content);
    } catch (err) {
      throw new Error(`Failed to read service account JSON keyfile from path "${trimmed}": ${err.message}`);
    }
  }

  // Ensure private key string has proper actual newlines
  if (creds && creds.private_key && typeof creds.private_key === 'string') {
    creds.private_key = creds.private_key.replace(/\\n/g, '\n');
  }

  return creds;
}

/**
 * Initializes and returns Google Drive API v3 client.
 */
function getDriveClient() {
  if (cachedDrive) return cachedDrive;

  const credentials = getCredentials();
  cachedServiceAccountEmail = credentials.client_email || null;

  cachedAuth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });

  cachedDrive = google.drive({ version: 'v3', auth: cachedAuth });
  return cachedDrive;
}

/**
 * Returns the service account's client_email address.
 */
function getServiceAccountEmail() {
  if (cachedServiceAccountEmail) {
    return cachedServiceAccountEmail;
  }
  try {
    const credentials = getCredentials();
    cachedServiceAccountEmail = credentials.client_email || 'Service account email not available';
    return cachedServiceAccountEmail;
  } catch {
    return 'Service account email not configured (Missing GOOGLE_SERVICE_ACCOUNT_JSON)';
  }
}

module.exports = {
  getDriveClient,
  getServiceAccountEmail,
};
