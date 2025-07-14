"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get("token");
    const emailParam = urlParams.get("id");

    if (urlToken) setToken(urlToken);
    if (emailParam) setEmail(emailParam);

    if (!urlToken || !emailParam) {
      setError(true);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const resetUser = async () => {
      try {
        const response = await axios.post("/api/auth/resetpassword", { token });
        console.log(response);
        setVerified(true);
        setError(false);
        toast.success("Email verified successfully!");
      } catch (err) {
        setError(true);
        console.error("Error verifying email:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) resetUser();
  }, [token]);

  const onResetPassword = () => {
    router.push(`/auth/newpassword?email=${encodeURIComponent(email)}`);
  };

  const onRetry = () => {
    setError(false);
    setLoading(true);
    setToken("");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
      <Toaster position="top-center" reverseOrder={false} />
      {loading ? (
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
          <h1 className="text-3xl font-semibold text-blue-600 mb-4">
            Verifying...
          </h1>
          <div className="w-12 h-12 mx-auto rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
          <p className="mt-4 text-gray-500">
            Please wait while we verify your link.
          </p>
        </div>
      ) : verified ? (
        <div className="bg-green-50 p-8 rounded-lg shadow-lg max-w-md text-center transition duration-300">
          <h1 className="text-3xl font-semibold text-green-600">
            Email Verified!
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Your email has been successfully verified.
          </p>
          <button
            className="mt-6 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition duration-300 cursor-pointer"
            onClick={onResetPassword}
          >
            Reset Password
          </button>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-8 rounded-lg shadow-lg max-w-md text-center transition duration-300">
          <h1 className="text-3xl font-semibold text-red-600">
            Oops, Something went wrong!
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Please check the link or try again later.
          </p>
          <button
            className="mt-6 bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition duration-300 cursor-pointer"
            onClick={onRetry}
          >
            Retry
          </button>
        </div>
      ) : null}
    </div>
  );
}
