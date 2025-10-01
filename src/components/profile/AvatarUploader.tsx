"use client";

import { useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "Something went wrong while updating your avatar.";
}

const MAX_FILE_SIZE_BYTES = 3 * 1024 * 1024; // 3MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export type AvatarUploaderProps = {
  userId: string;
  fullName: string;
  initialUrl: string | null;
};

export default function AvatarUploader({ userId, fullName, initialUrl }: AvatarUploaderProps) {
  const supabase = createSupabaseBrowserClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Please select an image file (JPG, PNG, GIF, or WebP).");
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError("Image is too large. Please choose a file up to 3MB.");
      return;
    }

    setUploading(true);
    setError(null);
    setMessage(null);

    const fileExt = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `${userId}/${Date.now()}.${fileExt}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, cacheControl: "3600" });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicData } = supabase.storage.from("avatars").getPublicUrl(path);
      const publicUrl = publicData.publicUrl;

      await Promise.allSettled([
        supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", userId),
        supabase.auth.updateUser({ data: { avatar_url: publicUrl } }),
      ]);

      setPreviewUrl(publicUrl);
      setMessage("Profile picture updated successfully.");
    } catch (err) {
      const friendly = formatError(err);
      if (friendly.toLowerCase().includes("storage")) {
        setError("Avatar storage bucket missing. Ask an admin to create an 'avatars' bucket in Supabase Storage.");
      } else {
        setError(friendly);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    setUploading(true);
    setError(null);
    setMessage(null);

    try {
      await Promise.allSettled([
        supabase.from("profiles").update({ avatar_url: null }).eq("id", userId),
        supabase.auth.updateUser({ data: { avatar_url: null } }),
      ]);

      setPreviewUrl(null);
      setMessage("Profile picture removed.");
    } catch (err) {
      setError(formatError(err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 text-sm text-slate-600">
      <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-2 border-white/70 bg-white/70 shadow-lg ring-4 ring-white/40">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt={`${fullName}'s avatar`} className="h-full w-full object-cover" />
        ) : (
          <span className="text-3xl font-semibold text-[var(--brand-primary)]">
            {fullName?.charAt(0)?.toUpperCase() || "U"}
          </span>
        )}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-[var(--brand-primary)] px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-[var(--brand-primary-dark)]"
          disabled={uploading}
        >
          {uploading ? "Uploading…" : "Update"}
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        className="hidden"
        onChange={handleFileChange}
      />
      {previewUrl && (
        <button
          type="button"
          onClick={handleRemove}
          disabled={uploading}
          className="text-xs font-semibold text-slate-500 underline-offset-4 transition hover:text-slate-700 hover:underline disabled:opacity-60"
        >
          Remove photo
        </button>
      )}
      {message && <p className="text-xs font-medium text-emerald-600">{message}</p>}
      {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
}
