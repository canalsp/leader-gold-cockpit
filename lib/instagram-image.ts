import sharp from "sharp";

export type InstagramFormat = "feed" | "story";

const SPECS: Record<InstagramFormat, { width: number; height: number }> = {
  feed: { width: 1080, height: 1350 },
  story: { width: 1080, height: 1920 },
};

export async function cropForInstagram(
  imageBuffer: Buffer,
  format: InstagramFormat
): Promise<{ buffer: Buffer; width: number; height: number; mime: string }> {
  const { width, height } = SPECS[format] ?? SPECS.feed;

  const buffer = await sharp(imageBuffer)
    .rotate()
    .resize(width, height, { fit: "cover", position: "centre" })
    .jpeg({ quality: 90, mozjpeg: true })
    .toBuffer();

  return { buffer, width, height, mime: "image/jpeg" };
}

export async function fetchImageBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) {
    throw new Error(`Nao foi possivel baixar a imagem destacada (HTTP ${res.status})`);
  }
  const mime = res.headers.get("content-type") || "";
  if (!mime.startsWith("image/")) {
    throw new Error("URL da imagem destacada nao retornou um arquivo de imagem");
  }
  const ab = await res.arrayBuffer();
  if (ab.byteLength > 8 * 1024 * 1024) {
    throw new Error("Imagem destacada muito grande (max 8MB)");
  }
  return Buffer.from(ab);
}
