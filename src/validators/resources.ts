import { z } from "zod";

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const uuid = z.string().uuid().or(z.string().regex(uuidRegex));

export const createFolderSchema = z.object({
  name: z.string().min(1, "Folder name is required").max(255),
  parentId: uuid.nullable().optional(),
});

export const renameFolderSchema = z.object({
  name: z.string().min(1, "Folder name is required").max(255),
});

export const moveFolderSchema = z.object({
  parentId: uuid.nullable().optional(),
});

export const uploadInitSchema = z.object({
  name: z.string().min(1, "File name is required").max(255),
  mimeType: z.string().min(1, "MIME type is required"),
  sizeBytes: z.number().positive("File size must be positive"),
  folderId: uuid.nullable().optional(),
});

export const uploadCompleteSchema = z.object({
  fileId: uuid,
  checksum: z.string().optional(),
});

export const renameFileSchema = z.object({
  name: z.string().min(1, "File name is required").max(255),
});

export const moveFileSchema = z.object({
  folderId: uuid.nullable().optional(),
});

export const createShareSchema = z.object({
  resourceType: z.enum(["file", "folder"]),
  resourceId: uuid,
  granteeUserId: uuid,
  role: z.enum(["viewer", "editor"]),
});

export const createLinkShareSchema = z.object({
  resourceType: z.enum(["file", "folder"]),
  resourceId: uuid,
  role: z.enum(["viewer"]),
  password: z.string().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
});

export const accessLinkShareSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().optional(),
});

export const starSchema = z.object({
  resourceType: z.enum(["file", "folder"]),
  resourceId: uuid,
});

export const searchSchema = z.object({
  q: z.string().min(1, "Search query is required"),
  type: z.enum(["file", "folder"]).optional(),
  owner: uuid.optional(),
  starred: z.boolean().optional(),
  sort: z
    .enum([
      "name_asc",
      "name_desc",
      "date_new",
      "date_old",
      "size_asc",
      "size_desc",
    ])
    .optional(),
  limit: z.number().min(1).max(100).optional().default(50),
  cursor: z.string().optional(),
});

export type CreateFolderInput = z.infer<typeof createFolderSchema>;
export type RenameFolderInput = z.infer<typeof renameFolderSchema>;
export type MoveFolderInput = z.infer<typeof moveFolderSchema>;
export type UploadInitInput = z.infer<typeof uploadInitSchema>;
export type UploadCompleteInput = z.infer<typeof uploadCompleteSchema>;
export type RenameFileInput = z.infer<typeof renameFileSchema>;
export type MoveFileInput = z.infer<typeof moveFileSchema>;
export type CreateShareInput = z.infer<typeof createShareSchema>;
export type CreateLinkShareInput = z.infer<typeof createLinkShareSchema>;
export type AccessLinkShareInput = z.infer<typeof accessLinkShareSchema>;
export type StarInput = z.infer<typeof starSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
