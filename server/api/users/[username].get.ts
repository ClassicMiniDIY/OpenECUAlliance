import { serverSupabaseClient } from "#supabase/server";

interface PublicProfile {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  website: string | null;
  location: string | null;
  githubUsername: string | null;
  role: "user" | "moderator" | "admin";
  modelsCount: number;
  likesReceived: number;
  createdAt: string;
}

export default defineEventHandler(async (event): Promise<PublicProfile> => {
  const username = getRouterParam(event, "username");

  if (!username) {
    throw createError({
      statusCode: 400,
      statusMessage: "Username is required",
    });
  }

  const supabase = await serverSupabaseClient(event);

  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
      id,
      username,
      display_name,
      avatar_url,
      bio,
      website,
      location,
      github_username,
      role,
      models_count,
      likes_received,
      created_at
    `,
    )
    .eq("username", username.toLowerCase())
    .eq("is_banned", false)
    .single();

  if (error || !data) {
    throw createError({
      statusCode: 404,
      statusMessage: "User not found",
    });
  }

  return {
    id: data.id,
    username: data.username,
    displayName: data.display_name,
    avatarUrl: data.avatar_url,
    bio: data.bio,
    website: data.website,
    location: data.location,
    githubUsername: data.github_username,
    role: data.role ?? "user",
    modelsCount: data.models_count,
    likesReceived: data.likes_received,
    createdAt: data.created_at,
  };
});
