import rateLimit from "express-rate-limit";
const json429={message:"Too many requests. Please try again later.",code:"RATE_LIMITED"};
export const apiRateLimit=rateLimit({windowMs:60_000,limit:120,standardHeaders:"draft-8",legacyHeaders:false,handler:(_req,res)=>res.status(429).json(json429)});
export const authRateLimit=rateLimit({windowMs:15*60_000,limit:20,standardHeaders:"draft-8",legacyHeaders:false,skipSuccessfulRequests:true,handler:(_req,res)=>res.status(429).json({message:"Too many authentication attempts. Please try again later.",code:"AUTH_RATE_LIMITED"})});
export const mutationRateLimit=rateLimit({windowMs:60_000,limit:30,standardHeaders:"draft-8",legacyHeaders:false,handler:(_req,res)=>res.status(429).json(json429)});
