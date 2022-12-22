import { serverTimestamp, db } from "./../tools/firebase";
import { gralWriteData } from "./../models/write-data.model";

export const addDocCol = (collection: string | FirebaseFirestore.CollectionReference, data: unknown): Promise<gralWriteData> => {
  const colRef = typeof collection === "string" ? db.collection(collection) : collection;
  return colRef.add({
    createdAt: serverTimestamp(),
    ...(data || {}),
  }).then((docRef) => ({
    path: docRef.path, success: true,
  })).catch((error: Error) => ({
    message: error.message, success: false,
  }));
};
