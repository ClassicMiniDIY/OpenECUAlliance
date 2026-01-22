# GitHub to Filesystem Migration

This document describes the migration from GitHub API-based spec fetching to local filesystem-based serving.

## Migration Date

2026-01-21

## Summary

Successfully migrated adapter and protocol YAML specifications from the external `OECUASpecs` GitHub repository to this application's local filesystem. This eliminates external API dependencies, improves performance, and enables proper versioning support.

## Changes Made

### 1. Directory Structure

Created new `specs/` directory in project root:

```
specs/
├── adapters/
│   ├── aim/
│   │   └── aim-xrk.adapter.yaml
│   ├── ecumaster/
│   │   └── ecumaster-emu-csv.adapter.yaml
│   ├── emerald/
│   │   └── emerald-lg.adapter.yaml
│   ├── haltech/
│   │   └── haltech-nsp.adapter.yaml
│   ├── link/
│   │   └── link-llg.adapter.yaml
│   ├── romraider/
│   │   └── romraider-csv.adapter.yaml
│   ├── rusefi/
│   │   └── rusefi-mlg.adapter.yaml
│   └── speeduino/
│       └── speeduino-mlg.adapter.yaml
├── protocols/
│   ├── aem/
│   ├── ecumaster/
│   ├── emtron/
│   ├── haltech/
│   ├── maxxecu/
│   ├── megasquirt/
│   ├── rusefi/
│   └── syvecs/
└── assets/
    ├── logos/
    ├── icons/
    └── banners/
```

All files copied from `OECUASpecs` repository (located at `/Users/colegentry/Development/OECUASpecs`).

### 2. New Server Utilities

**Created:** `/Users/colegentry/Development/OpenECUAlliance/server/utils/filesystem.ts`

Replacement for `server/utils/github.ts` with the following functions:

- `getAllAdapterPaths()` - Lists all adapter files with version metadata
- `getAllProtocolPaths()` - Lists all protocol files with version metadata
- `readAdapterFile(vendor, id, version?)` - Reads and parses adapter YAML
- `readProtocolFile(vendor, id, version?)` - Reads and parses protocol YAML
- `getAdapterVersions(vendor, id)` - Gets available versions for an adapter
- `getProtocolVersions(vendor, id)` - Gets available versions for a protocol
- `getLatestAdapterVersion(vendor, id)` - Gets latest version
- `getLatestProtocolVersion(vendor, id)` - Gets latest version
- `readAssetFile(type, filename)` - Reads asset files (logos, icons, banners)
- `getAssetContentType(filename)` - Determines MIME type for assets
- `getAssetUrl(type, filename)` - Generates local API URLs for assets

**Key Features:**

- Multi-version support with semver sorting
- Path traversal attack prevention
- Comprehensive error handling
- Support for both `.yaml` and `.yml` extensions

### 3. New API Endpoints

Created new public-facing endpoints for direct spec access:

#### Adapter Specs

- **GET** `/api/specs/adapters` - Lists all adapters with download URLs
- **GET** `/api/specs/adapters/:vendor/:id/raw` - Downloads raw adapter YAML
  - Supports `?version=X.Y.Z` query parameter

#### Protocol Specs

- **GET** `/api/specs/protocols` - Lists all protocols with download URLs
- **GET** `/api/specs/protocols/:vendor/:id/raw` - Downloads raw protocol YAML
  - Supports `?version=X.Y.Z` query parameter

#### Assets

- **GET** `/api/assets/:type/:filename` - Serves asset files
  - Types: `logos`, `icons`, `banners`
  - Proper MIME type detection
  - 24-hour cache headers

### 4. Refactored Existing Endpoints

Updated all existing API routes to use filesystem utilities:

- `/api/adapters.get.ts` - Now reads from local filesystem
- `/api/adapters/[vendor]/[id].get.ts` - Added version support via query param
- `/api/protocols.get.ts` - Now reads from local filesystem
- `/api/protocols/[vendor]/[id].get.ts` - Added version support via query param

### 5. Configuration Updates

**nuxt.config.ts:**

- Removed `githubToken` from runtimeConfig (no longer needed)
- Updated `adapterCacheTTL` from 300s (5 min) to 900s (15 min)
- Added new API routes to Supabase auth exclusion list:
  - `/api/adapters`, `/api/adapters/*`
  - `/api/protocols`, `/api/protocols/*`
  - `/api/specs`, `/api/specs/*`
  - `/api/assets`, `/api/assets/*`

**Cache Duration:**

- All adapter/protocol endpoints: **15 minutes** (up from 5 minutes)
- Asset endpoints: **24 hours**

### 6. Removed Files

**Deleted:** `/Users/colegentry/Development/OpenECUAlliance/server/utils/github.ts`

This file contained:

- GitHub API integration
- Rate limiting handling
- Raw file fetching from GitHub
- No longer needed after migration

## Versioning Support

The new filesystem utilities support multi-version specs:

### File Naming Convention

```
haltech-nsp.adapter.yaml          # Latest/unversioned
haltech-nsp.v1.0.0.adapter.yaml   # Specific version
haltech-nsp.v1.1.0.adapter.yaml   # Newer version
```

### Version Selection Logic

1. If no version specified: returns latest (unversioned file or highest version)
2. If version specified: returns exact version or 404
3. Versions sorted using semantic versioning

### API Usage

```bash
# Get latest version
GET /api/adapters/haltech/haltech-nsp

# Get specific version
GET /api/adapters/haltech/haltech-nsp?version=1.0.0

# Download latest raw YAML
GET /api/specs/adapters/haltech/haltech-nsp/raw

# Download specific version raw YAML
GET /api/specs/adapters/haltech/haltech-nsp/raw?version=1.0.0

# List all versions with download URLs
GET /api/specs/adapters
```

## Asset Handling

Assets are now served through the API instead of GitHub raw URLs:

### Before (GitHub)

```json
{
  "logo": "https://raw.githubusercontent.com/ClassicMiniDIY/OECUASpecs/main/assets/logos/aim-logo.png"
}
```

### After (Local API)

```json
{
  "logo": "/api/assets/logos/aim-logo.png"
}
```

### Supported Asset Types

- **Logos:** `.svg`, `.png`, `.jpg`, `.jpeg`
- **Icons:** `.svg`, `.png`, `.jpg`, `.gif`, `.bmp`
- **Banners:** All image formats

## Performance Improvements

1. **No External API Calls:** Eliminated GitHub API dependency and rate limiting concerns
2. **Faster Response Times:** Direct filesystem reads instead of HTTP requests
3. **Longer Cache Duration:** 15-minute cache (up from 5 minutes)
4. **Reduced Latency:** No network round trips for specs
5. **Parallel Processing:** Local file reads can be parallelized without API quotas

## Breaking Changes

**None.** All existing API endpoints maintain backward compatibility:

- Same response formats
- Same URL structures
- Same query parameters
- Branding URLs updated but remain functional

## Migration Instructions for Updating Specs

To update adapter or protocol specs:

1. **Edit YAML files** in `specs/adapters/` or `specs/protocols/` directories
2. **Add new versions** using naming convention: `name.vX.Y.Z.adapter.yaml`
3. **Update assets** in `specs/assets/{logos,icons,banners}/`
4. **Restart server** to clear cache (or wait 15 minutes)

No GitHub repository access required!

## OECUASpecs Repository

The external `OECUASpecs` repository at `github.com/ClassicMiniDIY/OECUASpecs` can now be:

- **Archived** (no longer needed for runtime)
- **Kept for reference** (historical context)
- **Used for contributions** (community can still submit PRs, then sync to this repo)

Recommendation: Archive it and document the migration in its README.

## Testing Performed

All endpoints tested and verified working:

✅ `/api/adapters` - Lists adapters with local asset URLs
✅ `/api/adapters/:vendor/:id` - Returns adapter details
✅ `/api/protocols` - Lists protocols
✅ `/api/protocols/:vendor/:id` - Returns protocol details
✅ `/api/specs/adapters` - Lists specs with download URLs
✅ `/api/specs/adapters/:vendor/:id/raw` - Downloads YAML
✅ `/api/specs/protocols` - Lists protocol specs
✅ `/api/specs/protocols/:vendor/:id/raw` - Downloads YAML
✅ `/api/assets/:type/:filename` - Serves images with correct MIME types

## Files Modified

- `server/api/adapters.get.ts`
- `server/api/adapters/[vendor]/[id].get.ts`
- `server/api/protocols.get.ts`
- `server/api/protocols/[vendor]/[id].get.ts`
- `nuxt.config.ts`

## Files Created

- `server/utils/filesystem.ts`
- `server/api/specs/adapters.get.ts`
- `server/api/specs/adapters/[vendor]/[id]/raw.get.ts`
- `server/api/specs/protocols.get.ts`
- `server/api/specs/protocols/[vendor]/[id]/raw.get.ts`
- `server/api/assets/[type]/[filename].get.ts`
- `specs/` directory with all subdirectories and files
- `MIGRATION.md` (this file)

## Files Removed

- `server/utils/github.ts`

## Next Steps

1. ✅ **Test in production** - Deploy and verify all endpoints work
2. ✅ **Update documentation** - Update CLAUDE.md with new architecture
3. ⏳ **Archive OECUASpecs repo** - Mark as archived on GitHub
4. ⏳ **Remove GITHUB_TOKEN** - Remove environment variable from production
5. ⏳ **Monitor performance** - Verify improved response times
6. ⏳ **Add version metadata** - Consider adding version info to adapter list responses

## Rollback Plan

If rollback is needed:

1. Restore `server/utils/github.ts` from git history
2. Revert changes to existing API endpoints
3. Restore original `nuxt.config.ts`
4. Remove new API endpoints
5. Delete `specs/` directory
6. Restart server

Git commit before migration: (see git log for reference)
