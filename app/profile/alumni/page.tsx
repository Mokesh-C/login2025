"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut } from "lucide-react";
import ToastCard from "@/components/ToastCard";
import useAuth from "@/hooks/useAuth";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";

export default function AlumniProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorList, setErrorList] = useState<{ id: number; message: string }[]>([]);
  const [errorId, setErrorId] = useState(0);
  const router = useRouter();
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosPrivate.get("/user");
        setUser(res.data);
      } catch {
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  const showError = (msg: string) => {
    setErrorList((prev) => [...prev, { id: errorId, message: msg }]);
    setErrorId((prev) => prev + 1);
  };

  const { logout } = useAuth();
  const handleLogout = async () => {
    const refreshToken = localStorage.getItem("refreshToken") || "";
    await logout(refreshToken);
    window.dispatchEvent(new Event("storageChange"));
    router.push("/");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="text-white min-h-[calc(100vh-5rem)] bg-gradient-to-br from-accent-first via-accent-second to-accent-third"
    >
      <div className="max-w-3xl mx-auto px-4 pt-12 relative ">
        {/* Error Toasts */}
        <AnimatePresence>
          {errorList.map((e) => (
            <ToastCard
              key={e.id}
              id={e.id}
              message={e.message}
              onClose={() => setErrorList((prev) => prev.filter((err) => err.id !== e.id))}
              textColor="text-red-500"
            />
          ))}
        </AnimatePresence>

        {/* Header */}
        <div className="bg-blue-300/10 backdrop-blur-lg border border-white/10 rounded-md shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-blue-300/20 rounded-full flex items-center justify-center">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {user?.name || "Loading..."}
                </h1>
                <p className="text-white/60">ALUMNI PROFILE</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>

        {/* Basic Details */}
        <div className="bg-blue-300/5 p-6 rounded-md space-y-4">
          {isLoading ? (
            <p className="text-white/60 text-center">Loading user data...</p>
          ) : !user ? (
            <p className="text-white/60 text-center">No user data available</p>
          ) : (
            <>
              <div className="flex items-start gap-6">
                <p className="w-[30%] text-sm font-medium text-white/60">Name</p>
                <p className="font-medium text-white/90">{user.name}</p>
              </div>
              <div className="flex items-start gap-6">
                <p className="w-[30%] text-sm font-medium text-white/60">Login Id</p>
                <p className="font-medium text-white/90">{user.id}</p>
              </div>
              <div className="flex items-start gap-6">
                <p className="w-[30%] text-sm font-medium text-white/60">Mobile</p>
                <p className="font-medium text-white/90">{user.mobile}</p>
              </div>
              <div className="flex items-start gap-6">
                <p className="w-[30%] text-sm font-medium text-white/60">Email</p>
                <p className="font-medium text-white/90">{user.email || 'N/A'}</p>
              </div>
              {user.alumniData && (
                <>
                  <div className="flex items-start gap-6">
                    <p className="w-[30%] text-sm font-medium text-white/60">Roll No</p>
                    <p className="font-medium text-white/90">{user.alumniData.rollNo}</p>
                  </div>
                  <div className="flex items-start gap-6">
                    <p className="w-[30%] text-sm font-medium text-white/60">Current Company</p>
                    <p className="font-medium text-white/90">{user.alumniData.currentCompany}</p>
                  </div>
                  <div className="flex items-start gap-6">
                    <p className="w-[30%] text-sm font-medium text-white/60">Current Role</p>
                    <p className="font-medium text-white/90">{user.alumniData.currentRole}</p>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
);
} 