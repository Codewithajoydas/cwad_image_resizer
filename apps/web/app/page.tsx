"use client";

import { useEffect, useState } from "react";
import {
  ArrowDownToLine,
  Check,
  Copy,
  Eye,
  Link as LinkIcon,
  Lock,
  LockOpen,
  UploadCloud,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState("");

  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");

  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);

  const [quality, setQuality] = useState(80);
  const [lockAspectRatio, setLockAspectRatio] = useState(true);

  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    setError("");

    // Basic validation
    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    setFile(selectedFile);

    // Create preview
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    // Clear old generated image
    setGeneratedUrl(null);
    setShareUrl("");

    // Read original dimensions
    const image = new window.Image();

    image.onload = () => {
      const imageWidth = image.naturalWidth;
      const imageHeight = image.naturalHeight;

      setOriginalWidth(imageWidth);
      setOriginalHeight(imageHeight);

      // Use original dimensions as defaults
      setWidth(imageWidth.toString());
      setHeight(imageHeight.toString());

      image.onload = null;
    };

    image.onerror = () => {
      setError("Could not read the image dimensions.");
    };

    image.src = objectUrl;
  };

  const handleWidthChange = (value: string) => {
    setWidth(value);

    if (!lockAspectRatio || !originalWidth || !originalHeight) {
      return;
    }

    const newWidth = Number(value);

    if (!Number.isFinite(newWidth) || newWidth <= 0) {
      return;
    }

    const aspectRatio = originalHeight / originalWidth;

    const newHeight = Math.round(newWidth * aspectRatio);

    setHeight(newHeight.toString());
  };

  const handleHeightChange = (value: string) => {
    setHeight(value);

    if (!lockAspectRatio || !originalWidth || !originalHeight) {
      return;
    }

    const newHeight = Number(value);

    if (!Number.isFinite(newHeight) || newHeight <= 0) {
      return;
    }

    const aspectRatio = originalWidth / originalHeight;

    const newWidth = Math.round(newHeight * aspectRatio);

    setWidth(newWidth.toString());
  };

  const handleGenerateImage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!file) {
      setError("Please select an image.");
      return;
    }

    const widthNumber = Number(width);
    const heightNumber = Number(height);

    if (!widthNumber || widthNumber < 1) {
      setError("Please enter a valid width.");
      return;
    }

    if (!heightNumber || heightNumber < 1) {
      setError("Please enter a valid height.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();

      formData.append("image", file);
      formData.append("width", widthNumber.toString());
      formData.append("height", heightNumber.toString());
      formData.append("quality", quality.toString());

      const response = await fetch("/api/generate-image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate image.");
      }

      if (!data.url) {
        throw new Error("Generated image URL was not returned.");
      }

      setGeneratedUrl(data.url);
      setShareUrl(data.url);
    } catch (error) {
      console.error(error);

      setError(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      setError("Could not copy the URL.");
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreviewUrl(null);
    setGeneratedUrl(null);
    setShareUrl("");

    setWidth("");
    setHeight("");

    setOriginalWidth(0);
    setOriginalHeight(0);

    setQuality(80);
    setError("");
  };

  return (
    <main className="container mx-auto flex min-h-screen flex-col border-x sm:flex-row">
      {/* =====================================================
          LEFT
      ====================================================== */}

      <section className="flex-1 border-b px-5 py-8 sm:border-b-0 sm:border-r">
        <form onSubmit={handleGenerateImage} className="mx-auto flex w-full max-w-xl flex-col">
          {/* Upload */}

          <label
            htmlFor="image"
            className="flex min-h-[320px] w-full cursor-pointer flex-col items-center justify-center gap-5 border border-dashed border-muted-foreground/30 p-6 transition-colors hover:bg-muted/50"
          >
            <div className="flex size-16 items-center justify-center border bg-background">
              {previewUrl ? (
                <img src={previewUrl} alt="Selected image" className="size-16 object-cover" />
              ) : (
                <UploadCloud size={36} className="text-muted-foreground" />
              )}
            </div>

            <div>
              <p className="text-center font-medium">
                {previewUrl ? "Image selected" : "Upload an image"}
              </p>

              <p className="mt-1 text-center text-sm text-muted-foreground">
                {previewUrl
                  ? `${originalWidth} × ${originalHeight}px`
                  : "Drag and drop or click to upload"}
              </p>
            </div>

            <input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          {/* Settings */}

          <FieldGroup className="mt-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="image-width">Width</FieldLabel>

                <Input
                  id="image-width"
                  name="width"
                  type="number"
                  min={1}
                  value={width}
                  onChange={(event) => handleWidthChange(event.target.value)}
                  placeholder="Width"
                  disabled={!file}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="image-height">Height</FieldLabel>

                <Input
                  id="image-height"
                  name="height"
                  type="number"
                  min={1}
                  value={height}
                  onChange={(event) => handleHeightChange(event.target.value)}
                  placeholder="Height"
                  disabled={!file}
                />
              </Field>
            </div>

            {/* Aspect ratio */}

            <div className="flex items-center justify-between border-y py-3">
              <div>
                <p className="text-sm font-medium">Lock aspect ratio</p>

                <p className="text-xs text-muted-foreground">Keep the original image proportions</p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setLockAspectRatio((value) => !value)}
                aria-label={lockAspectRatio ? "Unlock aspect ratio" : "Lock aspect ratio"}
              >
                {lockAspectRatio ? <Lock size={16} /> : <LockOpen size={16} />}
              </Button>
            </div>

            {/* Quality */}

            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="image-quality">Image quality</FieldLabel>

                <span className="text-sm tabular-nums text-muted-foreground">{quality}%</span>
              </div>

              <Slider
                id="image-quality"
                min={1}
                max={100}
                step={1}
                value={[quality]}
                onValueChange={(value) => {
                  const nextValue = Array.isArray(value) ? value[0] : value;

                  if (typeof nextValue === "number") {
                    setQuality(nextValue);
                  }
                }}
              />
            </Field>

            {/* Error */}

            {error && <p className="text-sm text-destructive">{error}</p>}

            {/* Actions */}

            <div className="flex gap-2">
              <Button type="submit" disabled={loading || !file} className="flex-1">
                {loading ? "Generating..." : "Generate image"}
              </Button>

              {file && (
                <Button type="button" variant="outline" onClick={handleReset} disabled={loading}>
                  Reset
                </Button>
              )}
            </div>
          </FieldGroup>
        </form>
      </section>

      {/* =====================================================
          RIGHT
      ====================================================== */}

      <section className="flex-1 px-5 py-8">
        <div className="mx-auto flex w-full max-w-xl flex-col">
          {/* Preview heading */}

          <h3 className="flex items-center gap-2 font-medium">
            <Eye size={18} />
            Preview
          </h3>

          <div className="my-3 h-px w-full bg-border" />

          {/* Preview */}

          <div className="flex min-h-[320px] items-center justify-center border bg-muted/20 p-4">
            {generatedUrl ? (
              <img
                src={generatedUrl}
                alt="Generated image"
                className="max-h-[500px] max-w-full object-contain"
              />
            ) : previewUrl ? (
              <img
                src={previewUrl}
                alt="Image preview"
                className="max-h-[500px] max-w-full object-contain"
              />
            ) : (
              <p className="text-sm text-muted-foreground">Your generated image will appear here</p>
            )}
          </div>

          {/* Generated dimensions */}

          {generatedUrl && (
            <p className="mt-2 text-xs text-muted-foreground">
              Generated at {width} × {height}px · Quality {quality}%
            </p>
          )}

          {/* Download */}

          {generatedUrl ? (
            <a
              href={generatedUrl}
              download
              className="mt-4 flex h-9 w-full items-center justify-center gap-2 bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <ArrowDownToLine size={18} />
              Download Generated Image
            </a>
          ) : (
            <Button className="mt-4 w-full" disabled>
              <ArrowDownToLine size={18} />
              Download Generated Image
            </Button>
          )}

          {/* Share */}

          <div className="my-6 h-px w-full bg-border" />

          <h3 className="mb-3 flex items-center gap-2 font-medium">
            <LinkIcon size={18} />
            Share Link
          </h3>

          <InputGroup>
            <InputGroupInput value={shareUrl} placeholder="Generated image URL" readOnly />

            <InputGroupAddon align="inline-end">
              <InputGroupButton
                type="button"
                onClick={handleCopy}
                disabled={!shareUrl}
                aria-label="Copy share link"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </div>
      </section>
    </main>
  );
}
