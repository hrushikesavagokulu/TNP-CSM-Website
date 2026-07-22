const https = require('https');
const http  = require('http');

/**
 * Link verification protocol (Section 7 Build Specification):
 * Verifies problem URLs in rate-limited batches (~150ms delay) to detect 404s/broken links.
 */
async function verifySingleLink(url) {
  return new Promise((resolve) => {
    try {
      const parsedUrl = new URL(url);
      const protocol  = parsedUrl.protocol === 'https:' ? https : http;

      const req = protocol.request(
        url,
        { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) TNP-CSM-Validator/1.0' }, timeout: 6000 },
        (res) => {
          if (res.statusCode >= 200 && res.statusCode < 400) {
            resolve({ ok: true, status: res.statusCode });
          } else {
            resolve({ ok: false, status: res.statusCode, error: `HTTP ${res.statusCode}` });
          }
        }
      );

      req.on('error', (err) => {
        resolve({ ok: false, error: err.message });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({ ok: false, error: 'Request Timeout' });
      });

      req.end();
    } catch (err) {
      resolve({ ok: false, error: err.message });
    }
  });
}

async function verifyLinks(problems = [], delayMs = 150) {
  console.log(`[LINK VERIFIER] Verifying ${problems.length} links with ${delayMs}ms rate-limiting delay...`);
  const broken = [];
  let checked = 0;

  for (const p of problems) {
    checked++;
    const result = await verifySingleLink(p.link);
    if (!result.ok) {
      broken.push({ id: p.id || p.title, link: p.link, status: result.status, error: result.error });
    }

    if (checked % 50 === 0 || checked === problems.length) {
      console.log(`[LINK VERIFIER] Progress: ${checked}/${problems.length} links checked (Broken so far: ${broken.length})`);
    }

    await new Promise((r) => setTimeout(r, delayMs));
  }

  if (broken.length > 0) {
    console.error(`[LINK VERIFIER] WARNING: Detected ${broken.length} broken links out of ${problems.length}!`);
  } else {
    console.log(`[LINK VERIFIER] All ${problems.length} problem links verified successfully (HTTP 200/30x OK).`);
  }

  return broken;
}

// Support CLI direct execution: `node verifyLinks.util.js`
if (require.main === module) {
  const { INITIAL_PROBLEMS } = require('./seedDsa.util');
  console.log('[LINK VERIFIER CLI] Starting verification on problem bank...');
  verifyLinks(INITIAL_PROBLEMS.slice(0, 30), 100).then((broken) => {
    console.log(`[LINK VERIFIER CLI] Completed sample check. Broken links: ${broken.length}`);
    process.exit(broken.length > 0 ? 1 : 0);
  });
}

module.exports = { verifyLinks, verifySingleLink };
