/* eslint-disable @typescript-eslint/no-explicit-any */
import { serverTimestamp, db, admin } from "./../tools/firebase";
import { gralWriteData } from "../models/data.model";

// #region Collections

export const addDocCol = async (collection: string | FirebaseFirestore.CollectionReference, data: unknown, idOther?: string): Promise<gralWriteData> => {
  const colRef = typeof collection === "string" ? db.collection(collection) : collection;
  const docRef = idOther ? colRef.doc(idOther) : colRef.doc();

  if (idOther) {
    const exists = await docRef.get().then((doc) => doc.exists).catch(() => true);
    if (exists) {
      return { success: false, message: "Document already exists" };
    }
  }

  return docRef.set({
    createdAt: serverTimestamp(),
    ...(data || {}),
  }).then(() => ({
    id: docRef.id,
    path: docRef.path,
    success: true,
  })).catch((error: Error) => ({
    message: error.message,
    success: false,
  }));
};

// #endregion

// #region Documents

export const setDoc = (doc: string | FirebaseFirestore.DocumentReference, data: unknown, merge = true): Promise<gralWriteData> => {
  const docRef = typeof doc === "string" ? db.doc(doc) : doc;
  return docRef.set({
    createdAt: serverTimestamp(),
    ...(data || {}),
  }, { merge }).then(() => ({
    path: docRef.path, success: true,
  })).catch((error: Error) => ({
    message: error.message, success: false,
  }));
};

export const updateDoc = (doc: string | FirebaseFirestore.DocumentReference, data: unknown): Promise<gralWriteData> => {
  const docRef = typeof doc === "string" ? db.doc(doc) : doc;
  return docRef.update({
    updatedAt: serverTimestamp(),
    ...(data || {}),
  }).then(() => ({
    path: docRef.path, success: true,
  })).catch((error: Error) => ({
    message: error.message, success: false,
  }));
};

export const getDoc = (doc: string | FirebaseFirestore.DocumentReference): Promise<any> => {
  const docRef = typeof doc === "string" ? db.doc(doc) : doc;
  return docRef.get().then((docSnap) => ({
    id: docSnap.id,
    exists: docSnap.exists,
    path: docSnap.ref.path,
    ...(docSnap.data() || {}),
  })).catch((error: Error) => ({
    id: "",
    exists: false,
    message: error.message,
    path: docRef.path,
    success: false,
  }));
};

// export const deleteDoc = (doc: string | FirebaseFirestore.DocumentReference): Promise<gralWriteData> => {
//   const docRef = typeof doc === "string" ? db.doc(doc) : doc;
//   return docRef.delete().then(() => ({
//     path: docRef.path, success: true,
//   })).catch((error: Error) => ({
//     message: error.message, success: false,
//   }));
// };

export const arrayUnion = (value: any) => {
  return Array.isArray(value) ?
    admin.firestore.FieldValue.arrayUnion(...value) :
    admin.firestore.FieldValue.arrayUnion(value);
};

export const increment = (value: number) => {
  return admin.firestore.FieldValue.increment(value);
};

// #endregion
