import { bucket } from "./../tools/firebase";

export const uploadByString = (content: string, path: string, contentType: string, cacheControl = "public, max-age=3600") => {
  const fileUpload = bucket.file(path);
  const buffer = Buffer.from(content);
  return fileUpload.save(buffer, {
    metadata: {
      contentType: contentType ?? "text/plain",
      cacheControl,
    },
    resumable: false,
  });
};
