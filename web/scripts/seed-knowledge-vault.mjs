#!/usr/bin/env node
/**
 * Seed Knowledge Vault with the four source-of-truth PDFs (FR-KNW-08).
 *
 * Copies objects from S3 bucket root → knowledge/{asset_id}/{filename}
 * and inserts knowledge_assets + tags in Supabase (service role).
 *
 * Usage: node scripts/seed-knowledge-vault.mjs
 *        node scripts/seed-knowledge-vault.mjs --dry-run
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";
import { S3Client, ListObjectsV2Command, CopyObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const dryRun = process.argv.includes("--dry-run");

function loadEnv() {
  const envPath = resolve(root, ".env");
  try {
    const text = readFileSync(envPath, "utf8");
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq);
      const val = trimmed.slice(eq + 1);
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    console.warn("No .env file found — using process environment");
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucket = process.env.AWS_S3_BUCKET_NAME ?? process.env.AWS_S3_BUCKET;
const region = process.env.AWS_REGION ?? "eu-north-1";

if (!supabaseUrl || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
if (!bucket || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  console.error("Missing AWS credentials or bucket name");
  process.exit(1);
}

const supabase = {
  rest(table, { method = "GET", query = "", body, prefer } = {}) {
    const headers = {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
    };
    if (prefer) headers.Prefer = prefer;
    return fetch(`${supabaseUrl}/rest/v1/${table}${query}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }).then(async (res) => {
      const text = await res.text();
      if (!res.ok) throw new Error(text || res.statusText);
      if (!text) return null;
      return JSON.parse(text);
    });
  },
  from(table) {
    return {
      select(cols) {
        const state = { table, cols, filters: [], limit: null, single: false, maybeSingle: false };
        const chain = {
          eq(col, val) {
            state.filters.push(`${col}=eq.${encodeURIComponent(val)}`);
            return chain;
          },
          in(col, vals) {
            state.filters.push(`${col}=in.(${vals.map((v) => `"${v}"`).join(",")})`);
            return chain;
          },
          limit(n) {
            state.limit = n;
            return chain;
          },
          single() {
            state.single = true;
            return chain;
          },
          maybeSingle() {
            state.maybeSingle = true;
            return chain;
          },
          async then(resolve, reject) {
            try {
              const params = [`select=${encodeURIComponent(state.cols)}`, ...state.filters];
              if (state.limit) params.push(`limit=${state.limit}`);
              const query = `?${params.join("&")}`;
              const prefer = state.single || state.maybeSingle ? "return=representation" : undefined;
              const data = await supabase.rest(state.table, { query, prefer });
              if (state.single && Array.isArray(data) && data.length === 0) {
                resolve({ data: null, error: { message: "not found" } });
                return;
              }
              if (state.single || state.maybeSingle) {
                resolve({ data: Array.isArray(data) ? data[0] ?? null : data, error: null });
                return;
              }
              resolve({ data, error: null });
            } catch (err) {
              reject(err);
            }
          },
        };
        return chain;
      },
      insert(row) {
        const rows = Array.isArray(row) ? row : [row];
        const state = { table, rows, single: false };
        const chain = {
          select(_cols) {
            state.single = true;
            return chain;
          },
          single() {
            state.single = true;
            return chain;
          },
          async then(resolve, reject) {
            try {
              const data = await supabase.rest(state.table, {
                method: "POST",
                body: state.rows,
                prefer: state.single ? "return=representation" : undefined,
              });
              resolve({
                data: state.single ? (Array.isArray(data) ? data[0] : data) : data,
                error: null,
              });
            } catch (err) {
              resolve({ data: null, error: { message: err.message } });
            }
          },
        };
        return chain;
      },
    };
  },
};

async function getAssetCount() {
  const res = await fetch(`${supabaseUrl}/rest/v1/knowledge_assets?select=id`, {
    method: "HEAD",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      Prefer: "count=exact",
    },
  });
  const range = res.headers.get("content-range");
  return range ? parseInt(range.split("/")[1], 10) : null;
}

const s3 = new S3Client({
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/** Seed spec — s3Source is matched against bucket root keys (substring or exact). */
const SEED_RECORDS = [
  {
    s3Source: "B2G Master Presentation",
    sourceFilename: " B2G Master Presentation  2.pdf",
    title: "B2G Master Presentation — Wealth Tokenisation",
    asset_type: "REGULATORY_BRIEF",
    is_template: true,
    is_restricted: false,
    segment: "B2G",
    product_code: "UBUNTUVERSE",
    summary:
      "B2G sovereign briefing: wealth tokenisation, mining concessions, SPV/NFT model, Africa resource paradox.",
    tags: ["source-of-truth", "b2g", "tokenization", "sovereign", "confidential"],
  },
  {
    s3Source: "Generic Pitch Deck - March 2026",
    sourceFilename: "Generic Pitch Deck - March 2026.pdf",
    title: "Generic Pitch Deck — March 2026",
    asset_type: "PITCH_DECK",
    is_template: true,
    is_restricted: false,
    segment: "B2B",
    product_code: "GIFT",
    summary:
      "Strictly confidential institutional pitch: $300M volume, EU VASP, entity map, GIFT ecosystem, partners.",
    tags: ["source-of-truth", "b2b", "pitch-deck", "confidential", "gift"],
  },
  {
    s3Source: "Mansa Musa (Ubuntu Tribe)Whitepaper",
    sourceFilename: "Mansa Musa (Ubuntu Tribe)Whitepaper_2026.pdf",
    title: "Mansa Musa Whitepaper 2026",
    asset_type: "WHITEPAPER",
    is_template: true,
    is_restricted: false,
    segment: "INSTITUTIONAL",
    product_code: "GIFT",
    summary:
      "Product reference: $GIFT specs, tokenomics, Utribe Wallet, Nigeria ARIP, compliance flows, Ubuntu Academy.",
    tags: ["source-of-truth", "whitepaper", "gift", "wallet", "nigeria", "regulation", "tokenization"],
  },
  {
    s3Source: "CHIMEZIE CHUTA CONTRAT",
    sourceFilename: "CHIMEZIE CHUTA CONTRAT  - Copy – Copie.pdf",
    title: "Commercial Director Contract — Exhibit A Reference",
    asset_type: "SOP",
    is_template: false,
    is_restricted: true,
    segment: null,
    product_code: null,
    summary: "Employment contract — Exhibit A responsibilities (CRM, pipeline reporting). Admin access only.",
    tags: ["restricted", "role-definition"],
  },
];

const EXTRA_TAGS = [{ name: "role-definition", category: "meta" }];

function knowledgeKey(assetId, filename) {
  return `knowledge/${assetId}/${filename}`;
}

function encodeCopySource(bucketName, key) {
  return `${bucketName}/${encodeURIComponent(key).replace(/%2F/g, "/")}`;
}

async function listRootObjects() {
  const { Contents } = await s3.send(new ListObjectsV2Command({ Bucket: bucket, Delimiter: "/" }));
  return (Contents ?? []).map((o) => o.Key).filter(Boolean);
}

function matchSourceKey(rootKeys, hint) {
  const exact = rootKeys.find((k) => k === hint);
  if (exact) return exact;
  const byHint = rootKeys.find((k) => k.includes(hint));
  if (byHint) return byHint;
  throw new Error(`No S3 object matching "${hint}". Root keys: ${rootKeys.join(" | ")}`);
}

async function ensureTags(tagNames) {
  const allNames = [...new Set([...tagNames, ...EXTRA_TAGS.map((t) => t.name)])];
  const { data: existing } = await supabase.from("knowledge_tags").select("id, name").in("name", allNames);
  const map = new Map((existing ?? []).map((t) => [t.name, t.id]));

  for (const extra of EXTRA_TAGS) {
    if (!map.has(extra.name)) {
      if (dryRun) {
        map.set(extra.name, "dry-run-tag-id");
        continue;
      }
      const { data, error } = await supabase
        .from("knowledge_tags")
        .insert(extra)
        .select("id, name")
        .single();
      if (error) throw new Error(`Tag insert failed: ${error.message}`);
      map.set(data.name, data.id);
    }
  }

  return map;
}

async function getProductId(code) {
  if (!code) return null;
  const { data, error } = await supabase.from("products").select("id").eq("code", code).single();
  if (error || !data) throw new Error(`Product not found: ${code}`);
  return data.id;
}

async function getAuthorId() {
  const email = process.env.SEED_AUTHOR_EMAIL;
  if (email) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, role")
      .eq("email", email)
      .single();
    if (error || !data) throw new Error(`Profile not found for ${email}`);
    console.log(`Author: ${data.email}`);
    return data.id;
  }

  const { data: admin } = await supabase
    .from("profiles")
    .select("id, email, role")
    .eq("role", "ADMIN")
    .limit(1)
    .maybeSingle();
  if (admin) {
    console.log(`Author: ${admin.email}`);
    return admin.id;
  }

  const { data: anyProfile } = await supabase.from("profiles").select("id, email").limit(1).single();
  if (!anyProfile) throw new Error("No profiles found — sign up at least one user first");
  console.warn(`Using profile ${anyProfile.email} as author`);
  return anyProfile.id;
}

async function seedOne(record, rootKeys, tagMap, authorId) {
  const { data: existing } = await supabase
    .from("knowledge_assets")
    .select("id, title, storage_url")
    .eq("title", record.title)
    .maybeSingle();

  if (existing) {
    console.log(`  skip (exists): ${record.title}`);
    return existing.id;
  }

  const sourceKey = matchSourceKey(rootKeys, record.s3Source);
  const filename = record.sourceFilename;
  const assetId = randomUUID();
  const destKey = knowledgeKey(assetId, filename);
  const storageUrl = `s3://${bucket}/${destKey}`;

  console.log(`  source: ${JSON.stringify(sourceKey)}`);
  console.log(`  dest:   ${destKey}`);

  if (!dryRun) {
    await s3.send(
      new CopyObjectCommand({
        Bucket: bucket,
        CopySource: encodeCopySource(bucket, sourceKey),
        Key: destKey,
        ContentType: "application/pdf",
        MetadataDirective: "REPLACE",
      })
    );

    await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: destKey }));
  }

  const productId = await getProductId(record.product_code);

  if (dryRun) {
    console.log(`  [dry-run] would insert asset ${assetId}`);
    return assetId;
  }

  const { data: asset, error } = await supabase
    .from("knowledge_assets")
    .insert({
      id: assetId,
      title: record.title,
      asset_type: record.asset_type,
      storage_url: storageUrl,
      summary: record.summary,
      segment: record.segment,
      product_id: productId,
      is_template: record.is_template,
      is_restricted: record.is_restricted,
      source_filename: filename,
      author_id: authorId,
      created_by: authorId,
    })
    .select("id")
    .single();

  if (error) throw new Error(`Asset insert failed: ${error.message}`);

  const tagRows = record.tags
    .map((name) => tagMap.get(name))
    .filter(Boolean)
    .map((tag_id) => ({ knowledge_asset_id: asset.id, tag_id }));

  if (tagRows.length) {
    const { error: tagErr } = await supabase.from("knowledge_asset_tags").insert(tagRows);
    if (tagErr) throw new Error(`Tag link failed: ${tagErr.message}`);
  }

  console.log(`  ✓ seeded ${record.title}`);
  return asset.id;
}

async function main() {
  console.log(dryRun ? "=== DRY RUN ===" : "=== Knowledge Vault Seed ===");
  console.log(`Bucket: ${bucket} (${region})`);

  const rootKeys = await listRootObjects();
  console.log(`S3 root objects (${rootKeys.length}):`);
  for (const k of rootKeys) console.log(`  - ${JSON.stringify(k)}`);

  const allTags = SEED_RECORDS.flatMap((r) => r.tags);
  const tagMap = await ensureTags(allTags);
  const authorId = dryRun ? null : await getAuthorId();

  for (const record of SEED_RECORDS) {
    console.log(`\n→ ${record.title}`);
    await seedOne(record, rootKeys, tagMap, authorId);
  }

  const count = await getAssetCount();
  console.log(`\nDone. knowledge_assets count: ${count ?? "?"}`);
}

main().catch((err) => {
  console.error("\nSeed failed:", err.message ?? err);
  process.exit(1);
});
