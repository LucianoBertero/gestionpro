/**
 * Fetches the OpenAPI spec from the running backend and saves it to openapi.json.
 * Usage: node scripts/fetch-spec.mjs [apiUrl]
 *   Default apiUrl: http://localhost:3001
 */
const apiUrl = process.argv[2] || 'http://localhost:3001';

try {
  const res = await fetch(`${apiUrl}/docs-json`);
  if (!res.ok) {
    console.error(`Failed to fetch spec: ${res.status} ${res.statusText}`);
    console.error('Make sure the backend is running.');
    process.exit(1);
  }
  const spec = await res.json();
  const { writeFileSync } = await import('node:fs');
  const { resolve, dirname } = await import('node:path');
  const { fileURLToPath } = await import('node:url');

  const __dirname = dirname(fileURLToPath(import.meta.url));
  const outPath = resolve(__dirname, '..', 'openapi.json');
  writeFileSync(outPath, JSON.stringify(spec, null, 2));
  console.log(`✅ OpenAPI spec saved to ${outPath}`);
  console.log(`   Run: pnpm codegen:cache  to generate types`);
} catch (err) {
  if (err.code === 'ECONNREFUSED' || err.cause?.code === 'ECONNREFUSED') {
    console.error('❌ Could not connect to backend. Is it running?');
  } else {
    console.error('❌', err.message);
  }
  process.exit(1);
}
