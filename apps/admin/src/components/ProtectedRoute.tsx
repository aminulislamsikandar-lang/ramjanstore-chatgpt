import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
export default function ProtectedRoute(){const {user,loading}=useAuth();const location=useLocation();if(loading)return <div className="min-h-screen grid place-items-center">Loading…</div>;return user?<Outlet/>:<Navigate to="/login" replace state={{from:location.pathname}}/>}
