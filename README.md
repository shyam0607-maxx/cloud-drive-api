# Cloud Drive API

Production-quality cloud media storage and sharing backend service.

## Features

- **Authentication**: Email/password registration, login, JWT tokens, refresh token rotation
- **File Management**: Upload, download, rename, move, delete, restore
- **Folder Management**: Create, organize, rename, move with cycle prevention
- **Sharing**: User-level sharing with viewer/editor roles, public links with expiration and password protection
- **Search**: Full-text search with sorting and filtering
- **Trash**: Soft delete with 30-day retention
- **Activity Logging**: Track all user actions
- **File Versioning**: Support for multiple file versions

## Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL (via Supabase)
- **Storage**: Supabase Storage
- **Language**: TypeScript
- **Validation**: Zod
- **Testing**: Jest & Supertest

## Environment Setup

### Prerequisites

1. Node.js 18+
2. Supabase account (free tier available at https://supabase.com)
3. PostgreSQL (Supabase provides this)

### Installation

```bash
npm install
```

### Configuration

1. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

2. Configure Supabase:
   - Create a new project at https://supabase.com
   - Copy `SUPABASE_URL` from Project Settings → API
   - Copy `SUPABASE_ANON_KEY` from Project Settings → API
   - Copy `SUPABASE_SERVICE_ROLE_KEY` from Project Settings → API
   - Create a storage bucket named `drive` (private)

3. Set JWT secrets (minimum 32 characters):
```bash
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-long
REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars-long
```

4. Update `.env` with your values

### Database Setup

1. Connect to your Supabase PostgreSQL database
2. Run migrations:
   ```sql
   -- Copy contents of migrations/001_initial_schema.sql
   -- Paste and execute in Supabase SQL Editor
   ```

### Running Locally

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production build**:
```bash
npm run build
npm start
```

**Type checking**:
```bash
npm run type-check
```

**Linting**:
```bash
npm run lint
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/logout` - Logout user

### Folders

- `POST /api/folders` - Create folder
- `GET /api/folders` - List root folders
- `GET /api/folders/:folderId` - Get folder details
- `PATCH /api/folders/:folderId/rename` - Rename folder
- `PATCH /api/folders/:folderId/move` - Move folder
- `DELETE /api/folders/:folderId` - Delete folder
- `POST /api/folders/:folderId/restore` - Restore deleted folder
- `GET /api/folders/:folderId/breadcrumbs` - Get folder breadcrumbs

### Files

- `POST /api/files/init` - Initialize file upload
- `POST /api/files/complete` - Complete file upload
- `GET /api/files/:fileId` - Get file details
- `GET /api/files/:fileId/download` - Get signed download URL
- `PATCH /api/files/:fileId/rename` - Rename file
- `PATCH /api/files/:fileId/move` - Move file
- `DELETE /api/files/:fileId` - Delete file
- `POST /api/files/:fileId/restore` - Restore deleted file

### Sharing

- `POST /api/shares` - Create user share
- `GET /api/shares/:resourceType/:resourceId` - List shares for resource
- `DELETE /api/shares/:shareId` - Delete share
- `POST /api/shares/link/create` - Create public link
- `POST /api/shares/link/access` - Access public link
- `DELETE /api/shares/link/:linkShareId` - Delete link share

### Trash

- `GET /api/trash` - List deleted files/folders
- `DELETE /api/trash` - Empty trash permanently

## Testing

```bash
npm test
npm run test:watch
```

## Security Features

- ✅ Password hashing with bcrypt (12 rounds)
- ✅ JWT access tokens (15 minutes)
- ✅ Refresh tokens with rotation
- ✅ CORS configuration
- ✅ Input validation with Zod
- ✅ Authorization checks on all protected endpoints
- ✅ Signed URLs for file downloads (1 hour expiration)
- ✅ Password protection for public links
- ✅ Folder cycle prevention
- ✅ IDOR protection

## Architecture

```
src/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── middleware/     # Express middleware
├── repositories/   # Data access layer
├── routes/        # API route definitions
├── services/      # Business logic
├── types/         # TypeScript interfaces
├── utils/         # Utilities (auth, file, errors)
├── validators/    # Zod validation schemas
├── app.ts        # Express app setup
└── server.ts     # Server entry point
```

## Database Schema

### Users
- Stores user profiles and credentials
- Password stored as bcrypt hash

### Folders
- Hierarchical folder structure (adjacency list)
- Soft delete support
- Unique constraint for non-deleted folders

### Files
- File metadata and Supabase storage reference
- Version tracking
- Soft delete support

### File Versions
- Historical versions of files
- Allows version restore

### Shares
- User-level sharing (viewer/editor roles)
- Folder inheritance model

### Link Shares
- Public sharing links with tokens
- Optional password protection
- Expiration support

### Stars
- User favorites/starred resources
- Quick access to important items

### Activities
- Audit log of all actions
- JSON context for additional data

## Error Handling

All errors follow consistent format:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message"
  }
}
```

HTTP Status Codes:
- `400` - Validation error
- `401` - Authentication required
- `403` - Forbidden (authorization failure)
- `404` - Not found
- `409` - Conflict
- `413` - File too large
- `429` - Rate limited
- `500` - Server error

## Deployment

The backend can be deployed to:
- **Render** (recommended free tier)
- **Fly.io**
- **Heroku**
- **AWS Lambda**
- **Railway**

Set environment variables in your deployment platform and run:
```bash
npm run build
npm start
```

## Limitations

- File upload limited to 5GB
- WebSocket support not included (future enhancement)
- Real-time co-editing not supported
- Desktop sync client not included

## Future Enhancements

- [ ] File compression
- [ ] Thumbnail generation
- [ ] Advanced search filters
- [ ] Webhooks
- [ ] File preview APIs
- [ ] Desktop sync client
- [ ] Real-time notifications
- [ ] Rate limiting per endpoint
- [ ] OAuth2 providers (Google, GitHub)
- [ ] Two-factor authentication

## License

MIT

## Support

For issues and questions, refer to the main project repository.
