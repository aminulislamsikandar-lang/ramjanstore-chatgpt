import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/authenticate.js";
import { db } from "../firebase/firestore.js";
import { addComment, submitRating, toggleLike, toggleWishlist } from "../services/engagement.service.js";

export async function wishlist(req: AuthenticatedRequest, res: Response) { res.json(await toggleWishlist(req.user!.uid, req.params.productId)); }
export async function like(req: AuthenticatedRequest, res: Response) { res.json(await toggleLike(req.user!.uid, req.params.productId)); }
export async function rating(req: AuthenticatedRequest, res: Response) { const b=req.body as {stars:number;text:string}; res.status(201).json(await submitRating(req.user!.uid,req.params.productId,b.stars,b.text)); }
export async function comment(req: AuthenticatedRequest, res: Response) { const b=req.body as {text:string;parentCommentId?:string}; res.status(201).json(await addComment(req.user!.uid,req.params.productId,b.text,b.parentCommentId)); }
export async function moderation(req: AuthenticatedRequest, res: Response) { const {collection,id,isPublished}=req.body as {collection:"comments"|"ratings";id:string;isPublished:boolean}; if(!["comments","ratings"].includes(collection)) return res.status(400).json({message:"Invalid collection"}); await db.collection(collection).doc(id).update({isPublished,updatedAt:new Date()}); return res.json({success:true}); }
