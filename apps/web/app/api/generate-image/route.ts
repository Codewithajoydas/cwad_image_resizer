import { cloudinaryConfig } from "@/config/cloudinary";
import { generateImage } from "@/lib/generateImage";
import { uploadImage } from "@/lib/UploadImage";
import { ImageFormat } from "@/types/imageFormats.type";
import { imageResizeSchema } from "@/validators/imageResizeSchema.validate";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

cloudinaryConfig();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const imageFile = formData.get("image");

    const width = Number(formData.get("width"));
    const height = Number(formData.get("height"));
    const quality = Number(formData.get("quality"));

    const formatValue = formData.get("format");
    const format =
      typeof formatValue === "string"
        ? formatValue.toLowerCase()
        : "webp";

    // FormData always gives strings
    const generateLink = formData.get("generateLink") === "true";

    console.log("Received form data:", {
      imageFile,
      width,
      height,
      quality,
      format,
      generateLink,
    });

    // Validate input
    const validateData = imageResizeSchema.safeParse({
      imageFile,
      width,
      height,
      quality,
      format,
    });

    if (!validateData.success) {
      return NextResponse.json(
        {
          success: false,
          error: validateData.error.message,
        },
        {
          status: 400,
        },
      );
    }

    const outputFormat = format as ImageFormat;

    // Convert File -> Buffer
    const arrayBuffer = await (imageFile as File).arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // Generate resized/converted image
    const outputBuffer = await generateImage(
      inputBuffer,
      width,
      height,
      quality,
      outputFormat,
    );

    // Get original image metadata
    const originalMetadata = await sharp(inputBuffer).metadata();

    // Get generated image metadata
    const outputMetadata = await sharp(outputBuffer).metadata();

 
    if (generateLink) {
      const uploadResult = await uploadImage(
        outputBuffer,
        outputFormat,
      );

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
          width: originalMetadata.width,
          height: originalMetadata.height,
          format: originalMetadata.format,
          size: (imageFile as File).size,
        },
      });
    }

 

    const contentType = `image/${outputFormat}`;

    return new NextResponse(outputBuffer as BodyInit, {
      status: 200,

      headers: {
        "Content-Type": contentType,

        "Content-Disposition": `attachment; filename="resized.${outputFormat}`,

        "Content-Length": outputBuffer.length.toString(),

        "X-Image-Width": String(outputMetadata.width ?? ""),
        "X-Image-Height": String(outputMetadata.height ?? ""),
        "X-Image-Format": String(outputMetadata.format ?? outputFormat),
      },
    });
  } catch (error) {
    console.error("Image generation failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to process image.",
      },
      {
        status: 500,
      },
    );
  }
}