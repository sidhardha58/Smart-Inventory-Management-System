"use client";

import Image from "next/image";
import { useState } from "react";
import axios from "axios";
import loginImage from "../../../public/images/auth.jpg";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
import { Mail, Eye, EyeOff, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const isFormValid =
    form.email.trim() &&
    form.password.trim().length >= 6 &&
    (isSignUp ? form.username.trim() : true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);

    try {
      if (isSignUp) {
        const res = await axios.post("/api/auth/signup", form);
        toast.success("Registered successfully!");
        toast.success("Signup successful! Please verify your email.");
        setTimeout(() => {
          window.location.href = "/auth";
        }, 2000);
      } else {
        const res = await axios.post("/api/auth/signin", {
          email: form.email,
          password: form.password,
        });

        toast.success("Logged in successfully!");
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message || "An error occurred. Try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const res = await axios.post("/api/auth/save-user", {
        _id: user.uid,
        username: user.displayName || "User",
        email: user.email,
        profileImageURL: user.photoURL,
      });

      toast.success(`Welcome, ${res.data.user.username}`);
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast.error("Google sign-in failed. Try again.");
    }
  };

  return (
    <div className="flex h-screen w-full font-sans overflow-hidden">
      {/* Left Image Section */}
      <div className="hidden md:flex w-1/2 relative">
        <Image
          src={loginImage}
          alt="Login Illustration"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 z-10" />
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center text-white px-6">
          <h1 className="text-4xl font-bold mb-2">SMART ZAIKO</h1>
          <p className="text-lg max-w-md">
            Your smart and seamless inventory solution <br /> – manage, track,
            and control everything effortlessly.
          </p>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            <motion.div
              key={isSignUp ? "signup-header" : "signin-header"}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.25 }}
            >
              <h2 className="text-2xl font-bold text-[#0077b6] mb-2 text-center">
                {isSignUp ? "Create Account" : "Welcome Back!!"}
              </h2>
              <p className="text-center text-sm text-gray-500 mb-6">
                {isSignUp
                  ? "Please create your account"
                  : "Please login to your account"}
              </p>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.form
              key={isSignUp ? "signup" : "signin"}
              onSubmit={handleSubmit}
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium mb-1 text-[#0077b6]">
                    Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Username"
                      className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0077b6]"
                      value={form.username}
                      onChange={(e) =>
                        setForm({ ...form, username: e.target.value })
                      }
                    />
                    <span className="absolute inset-y-0 right-3 flex items-center text-[#0077b6]">
                      <User size={18} />
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1 text-[#0077b6]">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="example@gmail.com"
                    className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0077b6]"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                  <span className="absolute inset-y-0 right-3 flex items-center text-[#0077b6]">
                    <Mail size={18} />
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-[#0077b6]">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="********"
                    className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0077b6]"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                  />
                  <span
                    className="absolute inset-y-0 right-3 flex items-center text-[#0077b6] cursor-pointer"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </span>
                </div>
                {!isSignUp && (
                  <Link
                    href="/auth/forgotpassword"
                    className="text-right text-sm mt-2 font-semibold text-gray-500 hover:text-[#0077b6] hover:underline cursor-pointer block"
                  >
                    Forgot Password
                  </Link>
                )}
              </div>

              <button
                type="submit"
                disabled={!isFormValid || loading}
                className={`w-full py-2 rounded-lg font-semibold transition  ${
                  !isFormValid || loading
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed "
                    : "bg-[#0077b6] text-white hover:bg-[#005f87] cursor-pointer"
                }`}
              >
                {loading ? "Please wait..." : isSignUp ? "Sign up" : "Sign in"}
              </button>

              <div className="flex items-center justify-center gap-2">
                <hr className="flex-grow border-gray-300" />
                <span className="text-sm text-gray-500">OR</span>
                <hr className="flex-grow border-gray-300" />
              </div>

              <button
                type="button"
                className="w-full border border-gray-300 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-100 transition cursor-pointer"
                onClick={handleGoogleSignIn}
              >
                <Image
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                  width={20}
                  height={20}
                />
                <span className="text-sm">
                  {isSignUp ? "Sign up with Google" : "Continue with Google"}
                </span>
              </button>
            </motion.form>
          </AnimatePresence>

          <p className="text-sm text-center mt-6 text-gray-500 font-semibold">
            {isSignUp ? "Already have an account?" : "Don’t have an account?"}
            <span
              className="text-[#0077b6] font-semibold cursor-pointer ml-1 hover:underline"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </span>
          </p>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Auth;
