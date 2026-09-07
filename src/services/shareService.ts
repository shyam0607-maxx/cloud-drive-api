import { shareRepository } from "../repositories/shareRepository";
import { linkShareRepository } from "../repositories/linkShareRepository";
import { fileRepository } from "../repositories/fileRepository";
import { folderRepository } from "../repositories/folderRepository";
import { userRepository } from "../repositories/userRepository";
import { activityRepository } from "../repositories/activityRepository";
import { ErrorResponses } from "../utils/errors";
import { CreateShareInput, CreateLinkShareInput, AccessLinkShareInput } from "../validators/resources";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

export class ShareService {
  async createShare(userId: string, input: CreateShareInput) {
    const resource =
      input.resourceType === "file"
        ? await fileRepository.findById(input.resourceId)
        : await folderRepository.findById(input.resourceId);

    if (!resource || resource.isDeleted) {
      throw ErrorResponses.notFound;
    }

    if (resource.ownerId !== userId) {
      throw ErrorResponses.forbidden;
    }

    const grantee = await userRepository.findById(input.granteeUserId);
    if (!grantee) {
      throw ErrorResponses.notFound;
    }

    const existingShare = await shareRepository.findByResourceAndGrantee(
      input.resourceType,
      input.resourceId,
      input.granteeUserId
    );

    if (existingShare) {
      await shareRepository.delete(existingShare.id);
    }

    const share = await shareRepository.create(
      input.resourceType,
      input.resourceId,
      input.granteeUserId,
      input.role,
      userId
    );

    await activityRepository.create(
      userId,
      "share",
      input.resourceType,
      input.resourceId,
      {
        granteeId: input.granteeUserId,
        role: input.role,
      }
    );

    return share;
  }

  async getShares(resourceType: "file" | "folder", resourceId: string) {
    const shares = await shareRepository.findByResource(
      resourceType,
      resourceId
    );

    const enriched = await Promise.all(
      shares.map(async (share) => {
        const grantee = await userRepository.findById(share.granteeUserId);
        return { ...share, grantee };
      })
    );

    return enriched;
  }

  async deleteShare(userId: string, shareId: string) {
    const share = await shareRepository.findById(shareId);

    if (!share) {
      throw ErrorResponses.notFound;
    }

    const resource =
      share.resourceType === "file"
        ? await fileRepository.findById(share.resourceId)
        : await folderRepository.findById(share.resourceId);

    if (!resource || resource.ownerId !== userId) {
      throw ErrorResponses.forbidden;
    }

    await shareRepository.delete(shareId);
  }

  async createLinkShare(userId: string, input: CreateLinkShareInput) {
    const resource =
      input.resourceType === "file"
        ? await fileRepository.findById(input.resourceId)
        : await folderRepository.findById(input.resourceId);

    if (!resource || resource.isDeleted) {
      throw ErrorResponses.notFound;
    }

    if (resource.ownerId !== userId) {
      throw ErrorResponses.forbidden;
    }

    const token = uuidv4();
    const passwordHash = input.password
      ? await bcrypt.hash(input.password, 10)
      : null;

    const link = await linkShareRepository.create(
      input.resourceType,
      input.resourceId,
      token,
      input.role,
      passwordHash,
      input.expiresAt ? new Date(input.expiresAt) : null,
      userId
    );

    return {
      ...link,
      token: link.token,
      url: `/share/${link.token}`,
    };
  }

  async accessLinkShare(input: AccessLinkShareInput) {
    const link = await linkShareRepository.findByToken(input.token);

    if (!link) {
      throw ErrorResponses.notFound;
    }

    if (link.expiresAt && new Date() > link.expiresAt) {
      throw ErrorResponses.conflict("Link has expired");
    }

    if (link.passwordHash && input.password) {
      const passwordValid = await bcrypt.compare(
        input.password,
        link.passwordHash
      );

      if (!passwordValid) {
        throw ErrorResponses.invalidCredentials;
      }
    } else if (link.passwordHash) {
      throw ErrorResponses.forbidden;
    }

    const resource =
      link.resourceType === "file"
        ? await fileRepository.findById(link.resourceId)
        : await folderRepository.findById(link.resourceId);

    if (!resource || resource.isDeleted) {
      throw ErrorResponses.notFound;
    }

    return { resource, link };
  }

  async deleteLinkShare(userId: string, linkShareId: string) {
    const link = await linkShareRepository.findById(linkShareId);

    if (!link) {
      throw ErrorResponses.notFound;
    }

    const resource =
      link.resourceType === "file"
        ? await fileRepository.findById(link.resourceId)
        : await folderRepository.findById(link.resourceId);

    if (!resource || resource.ownerId !== userId) {
      throw ErrorResponses.forbidden;
    }

    await linkShareRepository.delete(linkShareId);
  }
}

export const shareService = new ShareService();
