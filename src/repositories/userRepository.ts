import { supabase } from "../config/supabase";
import { User } from "../types";
import { v4 as uuidv4 } from "uuid";

export class UserRepository {
  async create(
    email: string,
    passwordHash: string,
    name: string
  ): Promise<User> {
    const id = uuidv4();
    const { data, error } = await supabase
      .from("users")
      .insert({
        id,
        email,
        password_hash: passwordHash,
        name,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      imageUrl: data.image_url,
      createdAt: new Date(data.created_at),
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from("users")
      .select()
      .eq("email", email)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      imageUrl: data.image_url,
      createdAt: new Date(data.created_at),
    };
  }

  async findById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from("users")
      .select()
      .eq("id", id)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      imageUrl: data.image_url,
      createdAt: new Date(data.created_at),
    };
  }

  async findPasswordHash(userId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from("users")
      .select("password_hash")
      .eq("id", userId)
      .single();

    if (error || !data) return null;
    return data.password_hash;
  }

  async update(
    userId: string,
    updates: Partial<{ name: string; imageUrl: string }>
  ): Promise<User> {
    const { data, error } = await supabase
      .from("users")
      .update({
        ...(updates.name && { name: updates.name }),
        ...(updates.imageUrl && { image_url: updates.imageUrl }),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      imageUrl: data.image_url,
      createdAt: new Date(data.created_at),
    };
  }

  async getPasswordHashAndEmail(
    email: string
  ): Promise<{ id: string; passwordHash: string } | null> {
    const { data, error } = await supabase
      .from("users")
      .select("id, password_hash")
      .eq("email", email)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      passwordHash: data.password_hash,
    };
  }
}

export const userRepository = new UserRepository();
