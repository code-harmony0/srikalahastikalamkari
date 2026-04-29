# Supabase .blob Image Migration (Hardened)

Safely converts all `.blob` images to proper extensions (`.jpg`/`.png`/`.webp`) with full verification and no data loss.

## Prerequisites

```bash
cd scripts
npm install
```

## Environment Variables

Create a `.env` file in the scripts folder:

```env
SUPABASE_URL=https://vovbnbmfzehlgtkvhzzj.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**⚠️ IMPORTANT:** Use the **Service Role Key** (not anon key) for storage operations.

## Usage

### Dry Run (Preview)

```bash
npm run dry-run
```

Shows what would be migrated without making any changes:

- Lists all `.blob` files found
- Shows oldName → newName mapping
- No uploads or DB updates

### Run Migration

```bash
npm run migrate
```

### What It Does (Safe Flow)

1. **Fetch** - Lists all `.blob` files in the products bucket
2. **Download** - Downloads file with MIME type from Supabase metadata
3. **Detect** - Uses MIME type from file (image/jpeg → .jpg, etc.)
4. **Rename** - Generates new filename with correct extension
5. **Upload** - Re-uploads with proper extension and content-type
6. **Verify** - Tests both RAW and RENDER URLs return 200 (GET request)
7. **Update DB** - Only after verification, updates database URLs
8. **Cleanup** - Only after DB update, deletes the old `.blob` file

## Safety Features

- ✅ **MIME type trust** - Uses Supabase-detected MIME type, not filename
- ✅ **Verification before DB** - Only updates DB after RAW + RENDER both 200
- ✅ **GET verification** - Uses GET request for reliable status check
- ✅ **Keep until verified** - Old `.blob` kept until both URLs verified
- ✅ **Exact match replace** - Only replaces exact filename matches in array
- ✅ **Granular updates** - Only updates rows containing specific file
- ✅ **No overwrites** - Skips if target file already exists
- ✅ **Dry-run mode** - Preview changes before running
- ✅ **Separate failures** - Download/Upload/Verify/DB/Cleanup failures tracked separately
- ✅ **No data loss** - Original files kept until all steps verified

## Migration Flow

```
Download → Upload → Verify (RAW 200, RENDER 200) → Update DB → Cleanup
   ↓          ↓           ↓ (if fails, stop)         ↓           ↓
  Fail       Fail      Keep .blob, fix issue     Rollback    Keep file
```

## Output

### Dry Run Output

```
[DRY_RUN] Files to migrate:
  1. p955aqcshm_1774335729921.blob
  2. a1xgpagfuhl_1774335730530.blob
  ...
```

### Migration Output

```
[1/25] p955aqcshm_1774335729921.blob
   ✅ Downloaded: p955aqcshm_1774335729921.blob (190172 bytes)
   🔍 MIME type: image/jpeg
   📝 Will rename to: p955aqcshm_1774335729921.jpg
   ⬆️  Uploading: p955aqcshm_1774335729921.jpg
   ✅ Uploaded: p955aqcshm_1774335729921.jpg
   🔍 Verifying: p955aqcshm_1774335729921.jpg
   ✅ RAW URL: 200
   ✅ RENDER URL: 200
   🔄 Updating DB: p955aqcshm_1774335729921.blob → p955aqcshm_1774335729921.jpg
   📋 Found 2 products to update
   ✅ Updated product: Cotton Kalamkari Saree
   ✅ Updated product: Another Product
   🗑️  Cleaning up: p955aqcshm_1774335729921.blob
   ✅ Removed: p955aqcshm_1774335729921.blob

============================================================
📊 MIGRATION SUMMARY
============================================================
Total files:         25
Downloaded:          25
Uploaded:            25
Verified (both 200): 25
DB rows updated:     47
Cleaned up:          25

✅ Working sample URL:
   https://vovbnbmfzehlgtkvhzzj.supabase.co/storage/v1/render/image/public/products/p955aqcshm_1774335729921.jpg?width=400

🎉 Migration complete!
```

## Failure Scenarios

### Download Failure

```
❌ Download failures: 1
   - broken.blob: Network error
```

File remains in `.blob` state, no changes made.

### Upload Failure

```
❌ Upload failures: 1
   - p955aqcshm_1774335729921.blob: File already exists
```

Old `.blob` kept, no DB changes.

### Verification Failure

```
❌ Verification failures: 1
   - p955aqcshm_1774335729921.blob: RENDER GET failed: 403
```

New file uploaded but not working, old `.blob` kept, no DB changes. Manual fix required.

### DB Update Failure

```
❌ DB update failures: 1
   - p955aqcshm_1774335729921.blob: Connection timeout
```

New file uploaded and working, old `.blob` kept for retry. No broken references.

## Troubleshooting

### "Render URL returns 403"

The MIME type may be incorrect. Check the file manually:

```bash
curl -I "https://.../storage/v1/object/public/products/filename.blob"
# Check Content-Type header
```

### "File already exists"

If a previous migration was interrupted, you may need to:

1. Delete the partial `.jpg` file manually
2. Re-run migration

### "No products found with file"

The file exists in storage but isn't referenced in any product. The script will still migrate it for safety.

## Output

```
🚀 Starting .blob to proper extension migration
📍 Supabase URL: https://vovbnbmfzehlgtkvhzzj.supabase.co
📦 Bucket: products

[1/25] Processing: p955aqcshm_1774335729921.blob
   ⬇️  Downloading p955aqcshm_1774335729921.blob...
   ✅ Downloaded: p955aqcshm_1774335729921.blob (190172 bytes)
   🔍 Detected MIME type: image/jpeg
   📝 New name: p955aqcshm_1774335729921.jpg (extension: .jpg)
   ⬆️  Uploading as p955aqcshm_1774335729921.jpg...
   ✅ Uploaded: p955aqcshm_1774335729921.jpg
   🔄 Updating database: p955aqcshm_1774335729921.blob → p955aqcshm_1774335729921.jpg
   📋 Found 2 products to update
   ✅ Updated product: Cotton Kalamkari Saree
   🔍 Verifying: p955aqcshm_1774335729921.jpg
   ✅ RAW URL: 200
   ✅ RENDER URL: 200
   🗑️  Cleaning up: p955aqcshm_1774335729921.blob
   ✅ Removed: p955aqcshm_1774335729921.blob

============================================================
📊 MIGRATION SUMMARY
============================================================
Total .blob files:     25
Successfully downloaded: 25
Successfully uploaded:   25
Database rows updated: 47
Verified (both URLs):    25
Cleaned up:            25
Failed:                0

✅ Working sample URL:
   https://vovbnbmfzehlgtkvhzzj.supabase.co/storage/v1/render/image/public/products/p955aqcshm_1774335729921.jpg?width=400

📁 Remaining .blob files: 0

🎉 Migration complete!
```

## Troubleshooting

### "Failed to list files"

- Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are correct
- Verify bucket "products" exists

### "Upload failed"

- File might already exist - check logs for "already exists, skipping"
- Check RLS policies allow uploads

### "Database update failed"

- Check products table exists
- Verify images column is text[] array type

### Files remain in .blob

Check logs for failed files and their specific error messages.

## Manual Verification

After migration, test a URL:

```bash
curl -I "https://vovbnbmfzehlgtkvhzzj.supabase.co/storage/v1/render/image/public/products/FILENAME.jpg?width=400"
```

Should return `HTTP/2 200`
