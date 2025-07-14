"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

function NewPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [equal, setEqual] = useState(true);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const emailId = searchParams.get("email");
    if (emailId) setEmail(emailId);
  }, [searchParams]);

  useEffect(() => {
    if (newPassword === confirmPassword && newPassword.length > 7) {
      setEqual(false);
    } else {
      setEqual(true);
    }
  }, [confirmPassword, newPassword]);

  const onResetPassword = async () => {
    if (equal) {
      toast.error("Passwords do not match or are too short!");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post("/api/auth/newpassword", {
        email,
        newPassword,
      });
      console.log(response);
      toast.success("Password reset successfully!");
      setTimeout(() => {
        router.push("/auth");
      }, 2000);
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error("Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-[#d5e2fb] to-[#eef2fb] p-4">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md transition-all duration-300 border border-[#b4c8f3]">
        <h1 className="text-3xl font-bold text-[#3b61d1] mb-6 text-center">
          Reset Your Password
        </h1>

        <div className="space-y-5">
          {/* New Password Field */}
          <div className="relative">
            <label
              htmlFor="newpassword"
              className="block text-sm font-medium text-[#3b61d1] mb-1"
            >
              New Password
            </label>
            <input
              type={showNewPassword ? "text" : "password"}
              id="newpassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-[#c3d4f6] rounded-lg bg-[#f6f9ff] text-gray-800 shadow-sm focus:ring-2 focus:ring-[#5e7fd6] focus:border-[#5e7fd6] transition-all duration-300"
              placeholder="Enter new password"
            />
            <button
              type="button"
              aria-label={showNewPassword ? "Hide password" : "Show password"}
              onClick={() => setShowNewPassword((prev) => !prev)}
              className="absolute right-3 top-[38px] text-[#6c89cf] hover:text-[#3b61d1] focus:outline-none cursor-pointer"
            >
              {showNewPassword ? <Eye /> : <EyeOff />}
            </button>
          </div>

          {/* Confirm Password Field */}
          <div className="relative">
            <label
              htmlFor="confirmpassword"
              className="block text-sm font-medium text-[#3b61d1] mb-1"
            >
              Confirm Password
            </label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmpassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-[#c3d4f6] rounded-lg bg-[#f6f9ff] text-gray-800 shadow-sm focus:ring-2 focus:ring-[#5e7fd6] focus:border-[#5e7fd6] transition-all duration-300"
              placeholder="Confirm new password"
            />
            <button
              type="button"
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-3 top-[38px] text-[#6c89cf] hover:text-[#3b61d1] focus:outline-none cursor-pointer"
            >
              {showConfirmPassword ? <Eye /> : <EyeOff />}
            </button>
          </div>

          {/* Reset Button */}
          <button
            disabled={equal || loading}
            onClick={onResetPassword}
            className={`w-full px-4 py-2 font-semibold rounded-lg shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer
            ${
              equal || loading
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-[#3b61d1] text-white hover:bg-[#5e7fd6] hover:scale-105"
            }`}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </div>
      </div>
    </div>
  );
}

function NewPasswordPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewPasswordPage />
    </Suspense>
  );
}

export default NewPasswordPageWrapper;
