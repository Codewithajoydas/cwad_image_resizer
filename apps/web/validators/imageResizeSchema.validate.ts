import { z } from "zod";

const SUPPORTED_FORMATS = ["png", "jpeg", "webp", "avif"] as const;

export const imageResizeSchema = z.object({
  imageFile: z
    .instanceof(File, {
      message: "Image file is required.",
    })
    .refine(
      (file) => file.type.startsWith("image/"),
      {
        message: "Only image files are allowed.",
      },
    ),

  width: z
    .number()
    .int()
    .min(1, "Width must be between 1 and 10000 pixels.")
    .max(10000, "Width must be between 1 and 10000 pixels."),

  height: z
    .number()
    .int()
    .min(1, "Height must be between 1 and 10000 pixels.")
    .max(10000, "Height must be between 1 and 10000 pixels."),

  quality: z
    .number()
    .int()
    .min(1, "Quality must be between 1 and 100.")
    .max(100, "Quality must be between 1 and 100."),

  format: z.enum(SUPPORTED_FORMATS, {
    message:
      "Unsupported format. Supported formats are PNG, JPEG, WebP and AVIF.",
  }),
});

export type ImageResizeInput = z.infer<typeof imageResizeSchema>;