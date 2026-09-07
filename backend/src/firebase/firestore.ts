import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { db } from "../config/firebase.js";

export { db, FieldValue, Timestamp };
export const serverTimestamp = () => FieldValue.serverTimestamp();
