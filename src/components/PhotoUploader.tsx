import { useRef, useState } from "react";
import { AlertCircle, CheckCircle2, ImagePlus, Loader2, RotateCcw, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { SignedImage } from "@/components/SignedImage";
import { removePhoto, uploadPhoto, validatePhotoFile } from "@/lib/inventory";

type Status = "menunggu" | "mengunggah" | "berhasil" | "gagal";
type Entry = { id: string; name: string; status: Status; message?: string; file: File };

export function PhotoUploader({
  label,
  hint,
  folder,
  paths,
  onChange,
}: {
  label: string;
  hint?: string;
  folder: string;
  paths: string[];
  onChange: (next: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [removing, setRemoving] = useState<string | null>(null);

  function patch(id: string, next: Partial<Entry>) {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...next } : e)));
  }

  async function uploadOne(entry: Entry, current: string[]): Promise<string[]> {
    patch(entry.id, { status: "mengunggah", message: undefined });
    try {
      const path = await uploadPhoto(entry.file, folder);
      patch(entry.id, { status: "berhasil" });
      return [...current, path];
    } catch (error) {
      patch(entry.id, { status: "gagal", message: (error as Error).message });
      return current;
    }
  }

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    const accepted: Entry[] = [];
    for (const file of Array.from(files)) {
      const invalid = validatePhotoFile(file);
      if (invalid) {
        toast.error(`${file.name} ditolak: ${invalid}`);
        continue;
      }
      accepted.push({
        id: `${file.name}-${file.size}-${Date.now()}-${accepted.length}`,
        name: file.name,
        status: "menunggu",
        file,
      });
    }
    if (inputRef.current) inputRef.current.value = "";
    if (!accepted.length) return;

    setEntries((prev) => [...prev, ...accepted]);
    setBusy(true);
    let next = paths;
    for (const entry of accepted) next = await uploadOne(entry, next);
    setBusy(false);

    const added = next.length - paths.length;
    if (added > 0) {
      onChange(next);
      toast.success(`${added} foto diunggah (WebP, maks 300KB)`);
    }
    if (added < accepted.length) {
      toast.error(`${accepted.length - added} foto gagal diunggah — coba lagi dari daftar di bawah`);
    }
  }

  async function retry(entry: Entry) {
    setBusy(true);
    const next = await uploadOne(entry, paths);
    setBusy(false);
    if (next.length !== paths.length) {
      onChange(next);
      toast.success("Foto berhasil diunggah");
    }
  }

  async function handleRemove(path: string) {
    setRemoving(path);
    const previous = paths;
    onChange(paths.filter((p) => p !== path));
    try {
      await removePhoto(path);
      toast.success("Foto dihapus");
    } catch (error) {
      onChange(previous);
      toast.error((error as Error).message);
    } finally {
      setRemoving(null);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-[11px] text-muted-foreground">
            {hint ?? "JPG, PNG, WEBP, atau HEIC — maks 10MB, otomatis jadi WebP maks 300KB."}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-gold-line"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <ImagePlus className="mr-2 h-4 w-4" />
          )}
          Unggah
        </Button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {entries.length > 0 ? (
        <ul className="space-y-1">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="flex items-center justify-between gap-2 rounded-md border border-gold-line bg-card/60 px-2 py-1 text-[11px]"
            >
              <span className="flex min-w-0 items-center gap-2">
                {entry.status === "mengunggah" ? (
                  <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-primary" />
                ) : entry.status === "berhasil" ? (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />
                ) : entry.status === "gagal" ? (
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 text-destructive" />
                ) : (
                  <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-border" />
                )}
                <span className="truncate">{entry.name}</span>
              </span>
              <span className="flex items-center gap-2">
                <span
                  className={
                    entry.status === "gagal" ? "text-destructive" : "text-muted-foreground"
                  }
                >
                  {entry.status === "gagal" ? (entry.message ?? "gagal") : entry.status}
                </span>
                {entry.status === "gagal" ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2"
                    disabled={busy}
                    onClick={() => void retry(entry)}
                  >
                    <RotateCcw className="mr-1 h-3 w-3" /> Coba lagi
                  </Button>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {paths.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {paths.map((path) => (
            <li key={path} className="relative">
              <SignedImage
                path={path}
                alt={label}
                className="h-20 w-20 rounded-lg border border-gold-line object-cover"
              />
              <button
                type="button"
                aria-label="Hapus foto"
                disabled={removing === path}
                className="absolute -top-2 -right-2 rounded-full border border-gold-line bg-card p-1 text-destructive shadow-sm disabled:opacity-50"
                onClick={() => void handleRemove(path)}
              >
                {removing === path ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <X className="h-3.5 w-3.5" />
                )}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground">Belum ada foto.</p>
      )}
    </div>
  );
}
