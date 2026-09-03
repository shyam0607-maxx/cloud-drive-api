import { folderRepository } from "../repositories/folderRepository";
import { fileRepository } from "../repositories/fileRepository";
import { shareRepository } from "../repositories/shareRepository";
import { starRepository } from "../repositories/starRepository";
import { activityRepository } from "../repositories/activityRepository";
import { ErrorResponses } from "../utils/errors";
import { CreateFolderInput, MoveFolderInput, RenameFolderInput } from "../validators/resources";
import { PermissionLevel } from "../types";

export class FolderService {
  async create(userId: string, input: CreateFolderInput) {
    if (input.parentId) {
      const parentFolder = await folderRepository.findById(input.parentId);

      if (!parentFolder || parentFolder.ownerId !== userId) {
        throw ErrorResponses.forbidden;
      }

      if (parentFolder.isDeleted) {
        throw ErrorResponses.notFound;
      }
    }

    const folder = await folderRepository.create(
      input.name,
      userId,
      input.parentId || null
    );

    await activityRepository.create(
      userId,
      "upload",
      "folder",
      folder.id,
      { folderName: folder.name }
    );

    return folder;
  }

  async getFolder(userId: string, folderId: string) {
    const folder = await folderRepository.findById(folderId);

    if (!folder || folder.isDeleted) {
      throw ErrorResponses.notFound;
    }

    if (folder.ownerId !== userId) {
      const share = await shareRepository.findByResourceAndGrantee(
        "folder",
        folderId,
        userId
      );

      if (!share) {
        throw ErrorResponses.forbidden;
      }
    }

    return folder;
  }

  async getFolderContents(userId: string, folderId: string | null) {
    if (folderId) {
      const folder = await this.getFolder(userId, folderId);
      if (!folder) throw ErrorResponses.notFound;
    }

    const folders = await folderRepository.findChildren(folderId, userId);
    const files = await fileRepository.findByFolder(folderId, userId);

    return { folders, files };
  }

  async rename(userId: string, folderId: string, input: RenameFolderInput) {
    const folder = await folderRepository.findById(folderId);

    if (!folder || folder.isDeleted) {
      throw ErrorResponses.notFound;
    }

    if (folder.ownerId !== userId) {
      throw ErrorResponses.forbidden;
    }

    const updated = await folderRepository.rename(folderId, input.name);

    await activityRepository.create(
      userId,
      "rename",
      "folder",
      folderId,
      { oldName: folder.name, newName: input.name }
    );

    return updated;
  }

  async move(userId: string, folderId: string, input: MoveFolderInput) {
    const folder = await folderRepository.findById(folderId);

    if (!folder || folder.isDeleted) {
      throw ErrorResponses.notFound;
    }

    if (folder.ownerId !== userId) {
      throw ErrorResponses.forbidden;
    }

    const newParentId = input.parentId || null;

    if (newParentId) {
      const parentFolder = await folderRepository.findById(newParentId);

      if (!parentFolder || parentFolder.ownerId !== userId) {
        throw ErrorResponses.forbidden;
      }

      if (parentFolder.isDeleted) {
        throw ErrorResponses.notFound;
      }

      const isDescendant = await folderRepository.checkIfDescendant(
        folderId,
        newParentId
      );

      if (isDescendant) {
        throw ErrorResponses.circularReference;
      }
    }

    const oldParentId = folder.parentId;
    const updated = await folderRepository.move(folderId, newParentId);

    await activityRepository.create(
      userId,
      "move",
      "folder",
      folderId,
      { oldParentId, newParentId }
    );

    return updated;
  }

  async delete(userId: string, folderId: string) {
    const folder = await folderRepository.findById(folderId);

    if (!folder || folder.isDeleted) {
      throw ErrorResponses.notFound;
    }

    if (folder.ownerId !== userId) {
      throw ErrorResponses.forbidden;
    }

    await folderRepository.softDelete(folderId);

    await activityRepository.create(userId, "delete", "folder", folderId, {
      folderName: folder.name,
    });

    return folder;
  }

  async restore(userId: string, folderId: string) {
    const folder = await folderRepository.findByIdIncludingDeleted(folderId);

    if (!folder) {
      throw ErrorResponses.notFound;
    }

    if (folder.ownerId !== userId) {
      throw ErrorResponses.forbidden;
    }

    if (!folder.isDeleted) {
      throw ErrorResponses.conflict("Folder is not deleted");
    }

    const restored = await folderRepository.restore(folderId);

    await activityRepository.create(userId, "restore", "folder", folderId, {
      folderName: folder.name,
    });

    return restored;
  }

  async getBreadcrumbs(folderId: string) {
    const ancestors = await folderRepository.getAncestors(folderId);
    return ancestors;
  }

  getPermissions(
    userId: string,
    folder: any,
    userShare?: any
  ): PermissionLevel {
    const isOwner = folder.ownerId === userId;
    const isEditor = userShare?.role === "editor";

    return {
      canRead: isOwner || !!userShare,
      canDownload: isOwner || !!userShare,
      canUpload: isOwner || isEditor,
      canRename: isOwner || isEditor,
      canMove: isOwner,
      canDelete: isOwner,
      canShare: isOwner,
      canManageVersions: isOwner,
    };
  }
}

export const folderService = new FolderService();
