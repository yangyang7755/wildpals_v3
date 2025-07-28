import { Link } from "react-router-dom";

export default function AuthLanding() {
  return (
    <div className="min-h-screen bg-white font-cabin max-w-md mx-auto relative">
      {/* Skip Button */}
      <div className="absolute top-4 right-4">
        <Link
          to="/explore"
          className="text-sm text-gray-500 underline font-cabin"
        >
          Skip
        </Link>
      </div>

      <div className="flex flex-col justify-center items-center px-9 py-16 min-h-screen">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-12">
          <div className="w-32 h-32 bg-explore-green rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-16 h-16 text-white"
              viewBox="0 0 100 100"
              fill="currentColor"
            >
              <path d="M20 75C25 70, 30 65, 35 70C40 75, 45 70, 50 75C55 80, 60 75, 65 80C70 85, 75 80, 80 85" />
              <path d="M20 65C25 60, 30 55, 35 60C40 65, 45 60, 50 65C55 70, 60 65, 65 70C70 75, 75 70, 80 75" />
              <path d="M20 55C25 50, 30 45, 35 50C40 55, 45 50, 50 55C55 60, 60 55, 65 60C70 65, 75 60, 80 65" />
              <path d="M20 45C25 40, 30 35, 35 40C40 45, 45 40, 50 45C55 50, 60 45, 65 50C70 55, 75 50, 80 55" />
              <path d="M20 35C25 30, 30 25, 35 30C40 35, 45 30, 50 35C55 40, 60 35, 65 40C70 45, 75 40, 80 45" />
              <path d="M20 25C25 20, 30 15, 35 20C40 25, 45 20, 50 25C55 30, 60 25, 65 30C70 35, 75 30, 80 35" />
              <path d="M25 15C30 10, 35 5, 40 10C45 15, 50 10, 55 15C60 20, 65 15, 70 20C75 25, 80 20, 85 25" />
              <path d="M75 15C80 10, 85 5, 90 10" />
              <path d="M80 25C85 20, 90 15, 95 20" />
            </svg>
          </div>
        </div>

        {/* Get Started Text */}
        <h1 className="text-2xl text-black text-center font-cabin mb-12">
          Get started...
        </h1>

        {/* Action Buttons */}
        <div className="w-full max-w-sm space-y-4">
          {/* Sign up with Email Button */}
          <Link
            to="/signup"
            className="w-full bg-explore-green text-white py-3 px-6 rounded-lg text-center font-cabin text-base block"
          >
            Sign up with Email
          </Link>

          {/* Continue with Apple Button */}
          <button className="w-full border-2 border-explore-green bg-white text-explore-green py-3 px-6 rounded-lg font-cabin text-base">
            Continue with Apple
          </button>

          {/* Login Link */}
          <div className="text-center pt-4">
            <span className="text-black font-cabin text-base">
              Already have an account?{" "}
            </span>
            <Link
              to="/login"
              className="text-black font-bold underline font-cabin text-base"
            >
              Log in
            </Link>
          </div>
        </div>

        {/* Bottom Logo */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-black font-cabin">Wildpals</h2>
        </div>
      </div>
    </div>
  );
}
