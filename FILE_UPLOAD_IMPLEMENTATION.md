# File Upload Implementation Guide

## Overview

This implementation adds real Supabase file upload functionality for:
1. **Expert Profile Pictures** - Profile images for expert management
2. **Electronic Identity Verification Documents** - Document uploads for bidding applications

## Database Setup

### 1. Run Database Migrations

Execute these SQL files in your Supabase SQL editor:

```bash
# Add database columns for electronic identity documents
psql -f add_electronic_identity_document_fields.sql

# Set up storage buckets and policies
psql -f setup_storage_buckets.sql
```

### 2. Storage Buckets Created

- **expert-files**: For expert profile images (5MB limit, images only)
- **application-documents**: For identity verification documents (10MB limit, PDF/DOC/images)

## Implementation Details

### Expert Profile Pictures (`/auth/manage/experts`)

**Features:**
- Upload profile images during expert creation/editing
- Image preview with 80x80 avatar display
- File validation (image types, 5MB max)
- Automatic resizing and optimization
- Integration with existing expert CRUD operations

**Files Modified:**
- `src/app/auth/manage/experts/page.tsx`
- `src/utils/supabase/fileUpload.ts`

**Usage:**
1. Click "사진 선택" button in expert form
2. Select image file (JPG, PNG, GIF)
3. Image appears in preview
4. Save expert to upload image to Supabase
5. Image URL stored in `experts.photo_url` column

### Electronic Identity Documents (`/auth/user/history`)

**Features:**
- Upload verification documents in bidding detail view
- Support for PDF, DOC, DOCX, JPG, PNG formats
- Progress indicators during upload
- Download functionality for uploaded documents
- Auto-updates bidding application record

**Files Modified:**
- `src/app/auth/user/history/ServiceHistory.tsx`
- `src/utils/supabase/fileUpload.ts`

**Usage:**
1. Open bidding application detail dialog
2. Click "파일 업로드" in document section
3. Select document file
4. File uploads to Supabase storage
5. Download link appears for uploaded file

## Technical Implementation

### File Upload Utility (`src/utils/supabase/fileUpload.ts`)

```typescript
// Expert profile image upload
uploadExpertProfileImage(expertId: string, file: File): Promise<FileUploadResult>

// Electronic identity document upload  
uploadElectronicIdentityDocument(applicationId: string, file: File): Promise<FileUploadResult>

// File deletion
deleteFile(bucket: string, filePath: string): Promise<FileUploadResult>
```

### Error Handling

- File type validation
- File size limits
- Upload progress tracking
- User-friendly error messages in Korean
- Automatic cleanup on failures

### Security

- RLS policies for authenticated users
- Bucket-specific access controls
- File type restrictions
- Size limitations

## Database Schema Changes

### New Columns in `bidding_applications`:

```sql
- electronic_identity_document_url: TEXT
- electronic_identity_document_name: TEXT  
- electronic_identity_document_uploaded_at: TIMESTAMP WITH TIME ZONE
```

### Existing Column Used:

```sql
experts.photo_url: TEXT -- For profile images
```

## Environment Variables Required

Ensure these are set in your `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Testing

### Expert Profile Upload:
1. Go to `/auth/manage/experts`
2. Create or edit an expert
3. Upload a profile image
4. Verify image appears in expert list
5. Check image is accessible via public URL

### Document Upload:
1. Go to `/auth/user/history`
2. Click detail view on any application
3. Upload an identity document
4. Verify download link works
5. Check database record is updated

## File Organization

```
uploads/
├── experts/
│   └── profiles/
│       └── {expertId}-{timestamp}.{ext}
└── applications/
    └── identity-docs/
        └── {applicationId}-identity-{timestamp}.{ext}
```

## Error Handling

All file operations include:
- Try/catch blocks with proper error logging
- User-friendly Korean error messages
- Loading states and progress indicators
- Automatic cleanup on failures
- File validation before upload

## Performance Considerations

- Images are uploaded directly to Supabase Storage
- Public URLs are generated for immediate access
- File size limits prevent large uploads
- Caching headers set for optimal performance
- Automatic cleanup of old files (can be implemented)

## Future Enhancements

Potential improvements:
- Image compression/resizing before upload
- Multiple file uploads
- Drag & drop interface
- File thumbnails
- Upload progress bars
- File metadata storage
- Automatic file cleanup policies
