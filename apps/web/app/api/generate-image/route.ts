import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

type ImageFormat = "png" | "jpeg" | "webp" | "avif";

const SUPPORTED_FORMATS: ImageFormat[] = [
  "png",
  "jpeg",
  "webp",
  "avif",
];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const imageFile = formData.get("image");

    const width = Number(formData.get("width"));
    const height = Number(formData.get("height"));
    const quality = Number(formData.get("quality"));

    // Get requested output format
    const formatValue = formData.get("format");

    const format =
      typeof formatValue === "string"
        ? formatValue.toLowerCase()
        : "webp";

    /*
     * Validate image
     */
    if (!(imageFile instanceof File)) {
      return NextResponse.json(
        {
          error: "Image file is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!imageFile.type.startsWith("image/")) {
      return NextResponse.json(
        {
          error: "Only image files are allowed.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * Validate width
     */
    if (
      !Number.isInteger(width) ||
      width < 1 ||
      width > 10000
    ) {
      return NextResponse.json(
        {
          error: "Width must be between 1 and 10000 pixels.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * Validate height
     */
    if (
      !Number.isInteger(height) ||
      height < 1 ||
      height > 10000
    ) {
      return NextResponse.json(
        {
          error: "Height must be between 1 and 10000 pixels.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * Validate quality
     */
    if (
      !Number.isInteger(quality) ||
      quality < 1 ||
      quality > 100
    ) {
      return NextResponse.json(
        {
          error: "Quality must be between 1 and 100.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * Validate output format
     */
    if (
      !SUPPORTED_FORMATS.includes(
        format as ImageFormat,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Unsupported format. Supported formats are PNG, JPEG, WebP and AVIF.",
        },
        {
          status: 400,
        },
      );
    }

    const outputFormat = format as ImageFormat;

    /*
     * Convert uploaded file to Buffer
     */
    const arrayBuffer = await imageFile.arrayBuffer();

    const inputBuffer = Buffer.from(arrayBuffer);

    /*
     * Read original metadata
     */
    const metadata = await sharp(inputBuffer).metadata();

    if (!metadata.width || !metadata.height) {
      return NextResponse.json(
        {
          error: "Could not read image dimensions.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * Create Sharp pipeline
     */
    let image = sharp(inputBuffer).resize({
      width,
      height,
      fit: "fill",
    });

    /*
     * Convert to requested format
     */
    switch (outputFormat) {
      case "jpeg":
        image = image.jpeg({
          quality,
          mozjpeg: true,
        });
        break;

      case "png":
        image = image.png({
          compressionLevel: 9,
          quality,
        });
        break;

      case "webp":
        image = image.webp({
          quality,
        });
        break;

      case "avif":
        image = image.avif({
          quality,
        });
        break;
    }

    /*
     * Generate output buffer
     */
    const outputBuffer = await image.toBuffer();

    /*
     * Upload to Cloudinary
     */
    const uploadResult = await new Promise<{
      secure_url: string;
      public_id: string;
      width: number;
      height: number;
      format: string;
      bytes: number;
    }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "cwad-images",
          resource_type: "image",

          // Cloudinary output format
          format:
            outputFormat === "jpeg"
              ? "jpg"
              : outputFormat,
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }

          if (!result) {
            reject(
              new Error("Cloudinary upload failed."),
            );
            return;
          }

          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
          });
        },
      );

      uploadStream.end(outputBuffer);
    });

    /*
     * Return response
     */
    return NextResponse.json({
      success: true,

      url: uploadResult.secure_url,

      image: {
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
        size: uploadResult.bytes,
      },

      original: {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: imageFile.size,
      },
    });
  } catch (error) {
    console.error(
      "Image generation failed:",
      error,
    );

    return NextResponse.json(
      {
        error: "Failed to process image.",
      },
      {
        status: 500,
      },
    );
  }
}
