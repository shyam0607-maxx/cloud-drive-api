import { fileRepository } from "../repositories/fileRepository";
import { fileVersionRepository } from "../repositories/fileVersionRepository";
import { folderRepository } from "../repositories/folderRepository";
import { shareRepository } from "../repositories/shareRepository";
import { activityRepository } from "../repositories/activityRepository";
import { supabase } from "../config/supabase";
import { config } from "../config/env";
import { ErrorResponses } from "../utils/errors";
import {
  generateStorageKey,
  generateVersionStorageKey,
  sanitizeFileName,
} from "../utils/file";
import {
  UploadInitInput,
  UploadCompleteInput,
  RenameFileInput,
  MoveFileInput,
} from "../validators/resources";
import { PermissionLevel } from "../types";

export class FileService {
  async initUpload(userId: string, input: UploadInitInput) {
    if (input.folderId) {
      const folder = await folderRepository.findById(input.folderId);

      if (!folder || folder.isDeleted) {
        throw ErrorResponses.notFound;
      }

      if (folder.ownerId !== userId) {
        const share = await shareRepository.findByResourceAndGrantee(
          "folder",
          input.folderId,
          userId
        );

        if (!share || share.role === "viewer") {
          throw ErrorResponses.forbidden;
        }
      }
    }

    if (input.sizeBytes > config.file.maxSize) {
      throw ErrorResponses.fileTooLarge;
    }

    if (
      config.file.allowedMimeTypes.length > 0 &&
      !config.file.allowedMimeTypes.includes(input.mimeType)
    ) {
      throw ErrorResponses.invalidMimeType;
    }

    const storageKey = generateStorageKey(
      userId,
      input.folderId || null,
      input.name
    );

    const file = await fileRepository.create(
      input.name,
      input.mimeType,
      input.sizeBytes,
      storageKey,
      userId,
      input.folderId || null
    );

    return {
      fileId: file.id,
      storageKey,
      uploadUrl: `${config.supabase.url}/storage/v1/object/${config.supabase.storageBucket}/${storageKey}`,
    };
  }

  async completeUpload(userId: string, input: UploadCompleteInput) {
    const file = await fileRepository.findById(input.fileId);

    if (!file) {
      throw ErrorResponses.notFound;
    }

    if (file.ownerId !== userId) {
      throw ErrorResponses.forbidden;
    }

    const version = await fileVersionRepository.create(
      input.fileId,
      1,
      file.storageKey,
      file.sizeBytes,
      input.checksum || null
    );

    await activityRepository.create(userId, "upload", "file", input.fileId, {
      fileName: file.name,
      size: file.sizeBytes,
    });

    return file;
  }

  async getFile(userId: string, fileId: string) {
    const file = await fileRepository.findById(fileId);

    if (!file || file.isDeleted) {
      throw ErrorResponses.notFound;
    }

    if (file.ownerId !== userId) {
      const share = await shareRepository.findByResourceAndGrantee(
        "file",
        fileId,
        userId
      );

      if (!share) {
        throw ErrorResponses.forbidden;
      }
    }

    return file;
  }

  async downloadFile(userId: string, fileId: string) {
    const file = await this.getFile(userId, fileId);

    const { data, error } = await supabase.storage
      .from(config.supabase.storageBucket)
      .createSignedUrl(file.storageKey, 3600);

    if (error) {
      throw ErrorResponses.storageError;
    }

    await activityRepository.create(userId, "download", "file", fileId, {
      fileName: file.name,
    });

    return {
      downloadUrl: data.signedUrl,
      fileName: file.name,
    };
  }

  async rename(userId: string, fileId: string, input: RenameFileInput) {
    const file = await fileRepository.findById(fileId);

    if (!file || file.isDeleted) {
      throw ErrorResponses.notFound;
    }

    if (file.ownerId !== userId) {
      throw ErrorResponses.forbidden;
    }

    const updated = await fileRepository.rename(fileId, input.name);

    await activityRepository.create(
      userId,
      "rename",
      "file",
      fileId,
      { oldName: file.name, newName: input.name }
    );

    return updated;
  }

  async move(userId: string, fileId: string, input: MoveFileInput) {
    const file = await fileRepository.findById(fileId);

    if (!file || file.isDeleted) {
      throw ErrorResponses.notFound;
    }

    if (file.ownerId !== userId) {
      throw ErrorResponses.forbidden;
    }

    const newFolderId = input.folderId || null;

    if (newFolderId) {
      const folder = await folderRepository.findById(newFolderId);

      if (!folder || folder.ownerId !== userId) {
        throw ErrorResponses.forbidden;
      }

      if (folder.isDeleted) {
        throw ErrorResponses.notFound;
      }
    }

    const oldFolderId = file.folderId;
    const updated = await fileRepository.move(fileId, newFolderId);

    await activityRepository.create(
      userId,
      "move",
      "file",
      fileId,
      { oldFolderId, newFolderId }
    );

    return updated;
  }

  async delete(userId: string, fileId: string) {
    const file = await fileRepository.findById(fileId);

    if (!file || file.isDeleted) {
      throw ErrorResponses.notFound;
    }

    if (file.ownerId !== userId) {
      throw ErrorResponses.forbidden;
    }

    await fileRepository.softDelete(fileId);

    await activityRepository.create(userId, "delete", "file", fileId, {
      fileName: file.name,
    });

    return file;
  }

  async restore(userId: string, fileId: string) {
    const file = await fileRepository.findByIdIncludingDeleted(fileId);

    if (!file) {
      throw ErrorResponses.notFound;
    }

    if (file.ownerId !== userId) {
      throw ErrorResponses.forbidden;
    }

    if (!file.isDeleted) {
      throw ErrorResponses.conflict("File is not deleted");
    }

    const restored = await fileRepository.restore(fileId);

    await activityRepository.create(userId, "restore", "file", fileId, {
      fileName: file.name,
    });

    return restored;
  }

  getPermissions(
    userId: string,
    file: any,
    userShare?: any
  ): PermissionLevel {
    const isOwner = file.ownerId === userId;
    const isEditor = userShare?.role === "editor";

    return {
      canRead: isOwner || !!userShare,
      canDownload: isOwner || !!userShare,
      canUpload: false,
      canRename: isOwner || isEditor,
      canMove: isOwner || isEditor,
      canDelete: isOwner,
      canShare: isOwner,
      canManageVersions: isOwner,
    };
  }
}

export const fileService = new FileService();
