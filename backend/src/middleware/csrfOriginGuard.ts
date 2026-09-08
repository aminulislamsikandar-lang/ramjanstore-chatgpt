import type { RequestHandler } from "express";
import { env } from "../config/env.js";
const SAFE_METHODS=new Set(["GET","HEAD","OPTIONS"]);
export const csrfOriginGuard:RequestHandler=(req,res,next)=>{if(SAFE_METHODS.has(req.method))return next();const origin=req.get("origin");if(!origin)return next();const allowed=new Set((env.CLIENT_URLS??`${env.CLIENT_URL},${env.ADMIN_URL}`).split(",").map(v=>v.trim()).filter(Boolean));if(!allowed.has(origin))return res.status(403).json({success:false,error:{code:"CSRF_ORIGIN_REJECTED",message:"Request origin is not allowed."}});next();};
