"use client";
import { useEffect, useRef, useState } from "react";
import {
  ArrowDownToLine,
  Check,
  Copy,
  Eye,
  Link as LinkIcon,
  Loader2,
  Lock,
  LockOpen,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageFormat } from "@/types/imageFormats.type";
import { toast } from "@/components/ui/toast";
import { Switch } from "@/components/ui/switch";

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
  const [format, setFormat] = useState<ImageFormat>("webp");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [generateLink, setGenerateLink] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      if (generatedUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(generatedUrl);
      }
    };
  }, [generatedUrl]);

  const handleFile = (selectedFile: File) => {
    setError("");
    if (!selectedFile.type.startsWith("image/")) {
      toast.add({
        type: "warning",
        title: "Invalid file type",
        description: "Please select a valid image file.",
      });
      return;
    }
    if (selectedFile.size > 20 * 1024 * 1024) {
      toast.add({
        type: "warning",
        title: "File too large",
        description: "Please select an image smaller than 20MB.",
      });
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (generatedUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(generatedUrl);
    }
    setFile(selectedFile);
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    setGeneratedUrl(null);
    setShareUrl("");
    setProgress(0);
    setProgressMessage("");
    const image = new window.Image();
    image.onload = () => {
      const imageWidth = image.naturalWidth;
      const imageHeight = image.naturalHeight;
      setOriginalWidth(imageWidth);
      setOriginalHeight(imageHeight);
      setWidth(imageWidth.toString());
      setHeight(imageHeight.toString());
    };
    image.onerror = () => {
      toast.add({
        type: "error",
        title: "Error loading image",
        description: "There was an error loading the image. Please try again.",
      });
    };
    image.src = objectUrl;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;
    handleFile(selectedFile);
    event.target.value = "";
  };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    const droppedFile = event.dataTransfer.files?.[0];
    if (!droppedFile) return;
    handleFile(droppedFile);
  };

  const handleWidthChange = (value: string) => {
    setWidth(value);
    if (!lockAspectRatio || !originalWidth || !originalHeight) return;
    const newWidth = Number(value);
    if (!Number.isFinite(newWidth) || newWidth <= 0) return;
    const aspectRatio = originalHeight / originalWidth;
    setHeight(Math.round(newWidth * aspectRatio).toString());
  };

  const handleHeightChange = (value: string) => {
    setHeight(value);
    if (!lockAspectRatio || !originalWidth || !originalHeight) return;
    const newHeight = Number(value);
    if (!Number.isFinite(newHeight) || newHeight <= 0) return;
    const aspectRatio = originalWidth / originalHeight;
    setWidth(Math.round(newHeight * aspectRatio).toString());
  };

  const handleGenerateImage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      toast.add({
        type: "warning",
        title: "No image selected",
        description: "Please select an image to generate.",
      });
      return;
    }
    const widthNumber = Number(width);
    const heightNumber = Number(height);
    if (!widthNumber || widthNumber < 1) {
      toast.add({
        title: "Invalid width",
        type: "warning",
        description: "Please enter a valid width.",
      });
      return;
    }
    if (!heightNumber || heightNumber < 1) {
      toast.add({
        title: "Invalid height",
        type: "warning",
        description: "Please enter a valid height.",
      });
      return;
    }
    try {
      setLoading(true);
      setError("");
      setProgress(0);
      setProgressMessage("Preparing image...");
      if (generatedUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(generatedUrl);
      }
      setGeneratedUrl(null);
      setShareUrl("");
      const formData = new FormData();
      formData.append("image", file);
      formData.append("width", widthNumber.toString());
      formData.append("height", heightNumber.toString());
      formData.append("quality", quality.toString());
      formData.append("generateLink", generateLink.toString());
      formData.append("format", format);
      const result = await new Promise<{
        blob: Blob;
        cloudinaryData: {
          success: boolean;
          url?: string;
          image?: {
            width: number;
            height: number;
            format: string;
            size: number;
          };
        } | null;
      }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (event) => {
          if (!event.lengthComputable) return;
          const uploadProgress = Math.round((event.loaded / event.total) * 90);
          setProgress(uploadProgress);
          setProgressMessage(`Uploading image... ${uploadProgress}%`);
        };
        xhr.upload.onload = () => {
          setProgress(90);
          setProgressMessage(
            generateLink
              ? "Processing image and uploading to Cloudinary..."
              : "Processing image...",
          );
        };
        xhr.onload = () => {
          if (xhr.status < 200 || xhr.status >= 300) {
            try {
              const errorData = JSON.parse(xhr.responseText);
              reject(new Error(errorData.error || "Failed to generate image."));
            } catch {
              reject(new Error("Failed to generate image."));
            }
            return;
          }
          const responseType = xhr.getResponseHeader("Content-Type") || "";
          if (responseType.includes("application/json")) {
            try {
              const data = JSON.parse(xhr.responseText);
              resolve({
                blob: new Blob(),
                cloudinaryData: data,
              });
            } catch {
              reject(new Error("Invalid server response."));
            }
            return;
          }
          const blob = xhr.response;
          resolve({
            blob,
            cloudinaryData: null,
          });
        };
        xhr.onerror = () => reject(new Error("Network error occurred."));
        xhr.onabort = () => reject(new Error("Request was cancelled."));
        xhr.responseType = "blob";
        xhr.open("POST", "/api/generate-image");
        xhr.send(formData);
      });
      setProgress(100);
      setProgressMessage("Completed");
      if (result.cloudinaryData) {
        const data = result.cloudinaryData;
        setShareUrl(data.url || "");
        setGeneratedUrl(data.url || null);
        toast.add({
          type: "success",
          title: "Image generated successfully",
          description: "Your image has been generated and uploaded.",
        });
      } else {
        const objectUrl = URL.createObjectURL(result.blob);
        setGeneratedUrl(objectUrl);
        toast.add({
          type: "success",
          title: "Image generated successfully",
          description: "Your image is ready to download.",
        });
      }
    } catch (error) {
      console.error(error);
      setError(
        error instanceof Error ? error.message : "Something went wrong.",
      );
      toast.add({
        type: "error",
        title: "Error generating image",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.add({
        type: "error",
        title: "Error copying URL",
        description: "Could not copy the URL to clipboard.",
      });
    }
  };

  const handleDownload = () => {
    if (!generatedUrl) return;
    const link = document.createElement("a");
    link.href = generatedUrl;
    link.download = `resized.${format}`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleReset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (generatedUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(generatedUrl);
    }
    setFile(null);
    setPreviewUrl(null);
    setGeneratedUrl(null);
    setShareUrl("");
    setWidth("");
    setHeight("");
    setOriginalWidth(0);
    setOriginalHeight(0);
    setQuality(80);
    setFormat("webp");
    setProgress(0);
    setProgressMessage("");
    setError("");
    setIsDragging(false);
    setGenerateLink(false);
  };

  return (
    <main className="container mx-auto flex min-h-screen flex-col border-x sm:flex-row">
      <section className="flex-1 border-b px-5 py-8 sm:border-b-0 sm:border-r">
        <form
          onSubmit={handleGenerateImage}
          className="mx-auto flex w-full max-w-xl flex-col"
        >
          <label
            htmlFor="image"
            onDragOver={handleDragOver}
            onDragEnter={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={[
              "flex min-h-[320px] w-full cursor-pointer flex-col items-center justify-center gap-5 border border-dashed p-6 transition-colors",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/30 hover:bg-muted/50",
            ].join(" ")}
          >
            <div className="flex size-16 items-center justify-center border bg-background">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Selected image"
                  className="size-16 object-cover"
                />
              ) : (
                <UploadCloud
                  size={36}
                  className={
                    isDragging
                      ? "text-primary"
                      : "text-muted-foreground"
                  }
                />
              )}
            </div>
            <div>
              <p className="text-center font-medium">
                {isDragging
                  ? "Drop your image here"
                  : previewUrl
                    ? "Image selected"
                    : "Upload an image"}
              </p>
              <p className="mt-1 text-center text-sm text-muted-foreground">
                {previewUrl
                  ? `${originalWidth} × ${originalHeight}px`
                  : "Drag and drop or click to upload"}
              </p>
            </div>
            <input
              ref={fileInputRef}
              id="image"
              name="image"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
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
                  onChange={(event) =>
                    handleWidthChange(event.target.value)
                  }
                  placeholder="Width"
                  disabled={!file || loading}
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
                  onChange={(event) =>
                    handleHeightChange(event.target.value)
                  }
                  placeholder="Height"
                  disabled={!file || loading}
                />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="image-format">Output format</FieldLabel>
              <Select
                value={format}
                onValueChange={(value) =>
                  setFormat(value as ImageFormat)
                }
                disabled={!file || loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="webp">WebP</SelectItem>
                  <SelectItem value="jpeg">JPEG</SelectItem>
                  <SelectItem value="png">PNG</SelectItem>
                  <SelectItem value="avif">AVIF</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field orientation="horizontal" className="max-w-sm">
              <FieldContent>
                <FieldLabel htmlFor="switch-focus-mode">
                  Generate link
                </FieldLabel>
                <FieldDescription>
                  This link will be generated and uploaded to Cloudinary,
                  allowing you to share it with others.
                </FieldDescription>
              </FieldContent>
              <Switch
                id="switch-focus-mode"
                checked={generateLink}
                onCheckedChange={setGenerateLink}
                disabled={loading}
              />
            </Field>
            <div className="flex items-center justify-between border-y py-3">
              <div>
                <p className="text-sm font-medium">
                  Lock aspect ratio
                </p>
                <p className="text-xs text-muted-foreground">
                  Keep the original image proportions
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() =>
                  setLockAspectRatio((value) => !value)
                }
                disabled={loading}
                aria-label={
                  lockAspectRatio
                    ? "Unlock aspect ratio"
                    : "Lock aspect ratio"
                }
              >
                {lockAspectRatio ? (
                  <Lock size={16} />
                ) : (
                  <LockOpen size={16} />
                )}
              </Button>
            </div>
            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="image-quality">
                  Image quality
                </FieldLabel>
                <span className="text-sm tabular-nums text-muted-foreground">
                  {quality}%
                </span>
              </div>
              <Slider
                id="image-quality"
                min={1}
                max={100}
                step={1}
                value={[quality]}
                disabled={!file || loading}
                onValueChange={(value) => {
                  const nextValue = Array.isArray(value)
                    ? value[0]
                    : value;
                  if (typeof nextValue === "number") {
                    setQuality(nextValue);
                  }
                }}
              />
            </Field>
            {loading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Loader2
                      size={15}
                      className="animate-spin"
                    />
                    {progressMessage}
                  </span>
                  <span className="tabular-nums">
                    {progress}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
            {error && (
              <p className="text-sm text-destructive">
                {error}
              </p>
            )}
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={loading || !file}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                    Generating...
                  </>
                ) : (
                  "Generate image"
                )}
              </Button>
              {file && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={loading}
                >
                  Reset
                </Button>
              )}
            </div>
          </FieldGroup>
        </form>
      </section>
      <section className="flex-1 px-5 py-8">
        <div className="mx-auto flex w-full max-w-xl flex-col">
          <h3 className="flex items-center gap-2 font-medium">
            <Eye size={18} />
            Preview
          </h3>
          <div className="my-3 h-px w-full bg-border" />
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
              <p className="text-sm text-muted-foreground">
                Your generated image will appear here
              </p>
            )}
          </div>
          {generatedUrl && (
            <p className="mt-2 text-xs text-muted-foreground">
              Generated at {width} × {height}px · Quality{" "}
              {quality}% · Format {format.toUpperCase()}
            </p>
          )}
          {generatedUrl ? (
            <Button
              type="button"
              className="mt-4 w-full"
              onClick={handleDownload}
            >
              <ArrowDownToLine size={18} />
              Download Generated Image
            </Button>
          ) : (
            <Button
              type="button"
              className="mt-4 w-full"
              disabled
            >
              <ArrowDownToLine size={18} />
              Download Generated Image
            </Button>
          )}
          {generateLink && (
            <>
              <div className="my-6 h-px w-full bg-border" />
              <div>
                <h3 className="mb-3 flex items-center gap-2 font-medium">
                  <LinkIcon size={18} />
                  Share Link
                </h3>
                <InputGroup>
                  <InputGroupInput
                    value={shareUrl}
                    placeholder="Generated image URL"
                    readOnly
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      type="button"
                      onClick={handleCopy}
                      disabled={!shareUrl}
                      aria-label="Copy share link"
                    >
                      {copied ? (
                        <Check size={18} />
                      ) : (
                        <Copy size={18} />
                      )}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
