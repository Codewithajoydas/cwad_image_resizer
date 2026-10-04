import sharp from "sharp";

export const generateImage = async (
  inputBuffer: Buffer,
  width: number,
  height: number,
  quality: number,
  outputFormat: string,
): Promise<Buffer> => {
  const metadata = await sharp(inputBuffer).metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error("Failed to retrieve image metadata.");
  }
  let image = sharp(inputBuffer).resize({
    width,
    height,
    fit: "fill",
  });
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

    return await image.toBuffer();
};
