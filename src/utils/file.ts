import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

export const sanitizeFileName = (fileName: string): string => {
  return fileName
    .replace(/[/\\?%*|"<>]/g, "_")
    .replace(/\.{2,}/g, ".")
    .slice(0, 255);
};

export const generateStorageKey = (
  ownerId: string,
  folderId: string | null,
  fileName: string
): string => {
  const fileId = uuidv4();
  const safeName = sanitizeFileName(fileName);
  const folder = folderId || "root";
  return `tenants/${ownerId}/folders/${folder}/files/${fileId}-${safeName}`;
};

export const generateVersionStorageKey = (
  ownerId: string,
  folderId: string | null,
  fileId: string,
  versionNumber: number,
  fileName: string
): string => {
  const safeName = sanitizeFileName(fileName);
  const folder = folderId || "root";
  return `tenants/${ownerId}/folders/${folder}/files/${fileId}/v${versionNumber}-${safeName}`;
};

export const generateChecksum = (data: Buffer): string => {
  return crypto.createHash("sha256").update(data).digest("hex");
};

export const getFileExtension = (fileName: string): string => {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
};

export const getFileIcon = (
  mimeType: string,
  fileName: string
): string => {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType === "application/pdf") return "pdf";
  if (
    mimeType.includes("word") ||
    mimeType.includes("document")
  ) return "doc";
  if (
    mimeType.includes("sheet") ||
    mimeType.includes("spreadsheet")
  ) return "sheet";
  if (mimeType.includes("presentation")) return "presentation";
  if (mimeType.startsWith("text/")) return "text";
  if (mimeType.includes("zip") || mimeType.includes("archive")) return "archive";
  return "file";
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};
