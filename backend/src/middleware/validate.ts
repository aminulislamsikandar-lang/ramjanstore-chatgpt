import type { RequestHandler } from "express";
import { z, type ZodType } from "zod";

const MAX_BODY_KEYS=100, MAX_STRING_LENGTH=10000;
function abuseCheck(value:unknown,depth=0):void{if(depth>10)throw new Error("Payload nesting too deep");if(typeof value==="string"&&value.length>MAX_STRING_LENGTH)throw new Error("Payload string too long");if(Array.isArray(value)){if(value.length>1000)throw new Error("Payload array too large");for(const item of value)abuseCheck(item,depth+1);return;}if(value&&typeof value==="object"){const entries=Object.entries(value);if(entries.length>MAX_BODY_KEYS)throw new Error("Payload has too many fields");for(const [key,item] of entries){if(key.length>200)throw new Error("Payload key too long");abuseCheck(item,depth+1);}}}

export const validateBody = <T>(schema: ZodType<T>): RequestHandler => (req,res,next) => { try { abuseCheck(req.body); const result=schema.safeParse(req.body); if(!result.success)return res.status(400).json({message:"Invalid request payload",code:"VALIDATION_ERROR",issues:result.error.issues.map(i=>({path:i.path,message:i.message}))}); req.body=result.data; next(); } catch(error) { return res.status(413).json({message:error instanceof Error?error.message:"Request payload rejected",code:"PAYLOAD_REJECTED"}); } };
export const validateQuery = <T>(schema: ZodType<T>): RequestHandler => (req,_res,next) => { const result=schema.safeParse(req.query); if(!result.success)return next(result.error); Object.assign(req.query,result.data); next(); };
export const validateParams = <T>(schema: ZodType<T>): RequestHandler => (req,_res,next) => { const result=schema.safeParse(req.params); if(!result.success)return next(result.error); Object.assign(req.params,result.data); next(); };
export const idParamSchema=z.object({id:z.string().trim().min(1).max(128)}).strict();
export const orderIdParamSchema=z.object({orderId:z.string().trim().min(1).max(128)}).strict();
export const paginationQuerySchema=z.object({limit:z.coerce.number().int().min(1).max(100).default(20),cursor:z.string().trim().min(1).max(256).optional()}).strict();
