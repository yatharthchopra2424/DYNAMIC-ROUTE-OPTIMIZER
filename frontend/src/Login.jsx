import React from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "./firebase";
import bgImg from "./assets/aesthetic-background-with-patterned-glass-texture.jpg";

export default function Login({ onLogin }) {
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      onLogin(result.user);
    } catch (err) {
      alert("Login failed: " + err.message);
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen"
      style={{
        backgroundImage: `url(${bgImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div
        className="bg-white/30 p-8 rounded-2xl shadow-2xl w-full max-w-xs backdrop-blur-lg border border-white/30"
        style={{
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.18)",
        }}
      >
        <h2 className="text-3xl font-extrabold mb-6 text-center text-gray-800 drop-shadow">
          Welcome to Dynamic Route Optimizer
        </h2>
        <button
          onClick={handleGoogleLogin}
          className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-xl font-bold shadow-lg hover:scale-105 hover:from-green-600 hover:to-blue-600 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g>
              <path
                d="M44.5 20H24V28.5H36.5C35.5 32 32 35 28 35C23 35 19 31 19 26C19 21 23 17 28 17C30.5 17 32.5 18 34 19.5L39 14.5C36.5 12 32.5 10 28 10C18 10 10 18 10 28C10 38 18 46 28 46C38 46 46 38 46 28C46 25.5 45.5 23 44.5 20Z"
                fill="#4285F4"
              />
            </g>
          </svg>
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
