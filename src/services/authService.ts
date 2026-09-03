import { userRepository } from "../repositories/userRepository";
import {
  generateAuthTokens,
  hashPassword,
  verifyPassword,
} from "../utils/auth";
import { ErrorResponses } from "../utils/errors";
import { RegisterInput, LoginInput } from "../validators/auth";

export class AuthService {
  async register(input: RegisterInput) {
    const existingUser = await userRepository.findByEmail(input.email);

    if (existingUser) {
      throw ErrorResponses.userExists;
    }

    const passwordHash = await hashPassword(input.password);
    const user = await userRepository.create(
      input.email,
      passwordHash,
      input.name
    );

    const tokens = generateAuthTokens(user.id, user.email);

    return {
      user,
      ...tokens,
    };
  }

  async login(input: LoginInput) {
    const credResult = await userRepository.getPasswordHashAndEmail(
      input.email
    );

    if (!credResult) {
      throw ErrorResponses.invalidCredentials;
    }

    const passwordMatch = await verifyPassword(
      input.password,
      credResult.passwordHash
    );

    if (!passwordMatch) {
      throw ErrorResponses.invalidCredentials;
    }

    const user = await userRepository.findById(credResult.id);

    if (!user) {
      throw ErrorResponses.invalidCredentials;
    }

    const tokens = generateAuthTokens(user.id, user.email);

    return {
      user,
      ...tokens,
    };
  }

  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw ErrorResponses.notFound;
    }

    return user;
  }

  async updateProfile(
    userId: string,
    updates: { name?: string; imageUrl?: string }
  ) {
    const user = await userRepository.update(userId, updates);
    return user;
  }
}

export const authService = new AuthService();
