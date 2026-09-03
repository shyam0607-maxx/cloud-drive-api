export interface User {
  id: string;
  email: string;
  name: string | null;
  imageUrl: string | null;
  createdAt: Date;
}

export interface Folder {
  id: string;
  name: string;
  ownerId: string;
  parentId: string | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface File {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  storageKey: string;
  ownerId: string;
  folderId: string | null;
  versionId: string | null;
  checksum: string | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FileVersion {
  id: string;
  fileId: string;
  versionNumber: number;
  storageKey: string;
  sizeBytes: number;
  checksum: string | null;
  createdAt: Date;
}

export interface Share {
  id: string;
  resourceType: "file" | "folder";
  resourceId: string;
  granteeUserId: string;
  role: "viewer" | "editor";
  createdBy: string;
  createdAt: Date;
}

export interface LinkShare {
  id: string;
  resourceType: "file" | "folder";
  resourceId: string;
  token: string;
  role: "viewer";
  passwordHash: string | null;
  expiresAt: Date | null;
  createdBy: string;
  createdAt: Date;
}

export interface Star {
  userId: string;
  resourceType: "file" | "folder";
  resourceId: string;
}

export interface Activity {
  id: string;
  actorId: string;
  action: "upload" | "rename" | "delete" | "restore" | "move" | "share" | "download";
  resourceType: "file" | "folder";
  resourceId: string;
  context: Record<string, any>;
  createdAt: Date;
}

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenFamily: string;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface PermissionLevel {
  canRead: boolean;
  canDownload: boolean;
  canUpload: boolean;
  canRename: boolean;
  canMove: boolean;
  canDelete: boolean;
  canShare: boolean;
  canManageVersions: boolean;
}

export interface PaginationQuery {
  limit: number;
  cursor?: string;
}

export interface SearchQuery {
  q: string;
  type?: "file" | "folder";
  owner?: string;
  starred?: boolean;
  sort?: "name_asc" | "name_desc" | "date_new" | "date_old" | "size_asc" | "size_desc";
  limit?: number;
  cursor?: string;
}
