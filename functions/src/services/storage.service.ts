import { bucket } from "./../tools/firebase";

export const uploadByString = (content: string, path: string, contentType: string) => {
  const fileUpload = bucket.file(path);
  const buffer = Buffer.from(content);
  return fileUpload.save(buffer, {
    metadata: {
      contentType: contentType ?? "text/plain",
      cacheControl: "public, max-age=3600",
    },
    resumable: false,
  });
};
