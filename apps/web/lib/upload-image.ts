import { cloudinaryConfig } from "@/config/cloudinary";

export const uploadImage = async (
  outputBuffer: Buffer,
  outputFormat: string,
): Promise<{
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}> => {
  try {
    const cloudinary = cloudinaryConfig();

    return await new Promise<{
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
          format: outputFormat === "jpeg" ? "jpg" : outputFormat,
        },
        (
          error: unknown,
          result?: {
            secure_url: string;
            public_id: string;
            width: number;
            height: number;
            format: string;
            bytes: number;
          },
        ) => {
          if (error) {
            reject(new Error(`Cloudinary upload failed: ${String(error)}`));
            return;
          }

          if (!result) {
            reject(new Error("Cloudinary upload failed."));
            return;
          }

          resolve(result);
        },
      );

      uploadStream.end(outputBuffer);
    });
  } catch (error) {
    throw new Error(`Failed to upload image: ${error}`);
  }
};
