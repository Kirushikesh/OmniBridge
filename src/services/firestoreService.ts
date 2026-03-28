import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import { BridgeResult } from "../types";

export interface IntentSubmission {
  input: string;
  image: { data: string; mimeType: string } | null;
  result: BridgeResult;
  timestamp: any;
  status: "PROCESSED";
}

export async function saveIntent(
  input: string, 
  image: { data: string; mimeType: string } | null, 
  result: BridgeResult
) {
  try {
    const docRef = await addDoc(collection(db, "intents"), {
      input,
      image,
      result,
      timestamp: serverTimestamp(),
      status: "PROCESSED"
    });
    console.log("Document written with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e;
  }
}
