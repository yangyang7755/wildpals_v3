import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SignUp() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSignUp = () => {
    if (!agreedToTerms) {
      alert("Please agree to the Terms and Privacy Policy");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    // Handle sign up logic here
    // For now, just navigate to explore
    navigate("/explore");
  };

  return (
    <div className="min-h-screen bg-white font-cabin max-w-md mx-auto relative">
      <div className="flex flex-col justify-center items-center px-7 py-16 min-h-screen">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-6">
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
          <h2 className="text-2xl font-bold text-black font-cabin mb-2">
            Wildpals
          </h2>
        </div>

        {/* Create Account Title */}
        <h1 className="text-3xl text-black text-center font-cabin mb-8">
          Create your account
        </h1>

        {/* Form */}
        <div className="w-full max-w-sm space-y-4">
          {/* Full Name Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border-2 border-explore-green rounded-lg py-3 px-6 font-cabin text-base text-explore-green placeholder-explore-green focus:outline-none focus:ring-2 focus:ring-explore-green"
            />
          </div>

          {/* Email Input */}
          <div className="relative">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-2 border-explore-green rounded-lg py-3 px-6 font-cabin text-base text-explore-green placeholder-explore-green focus:outline-none focus:ring-2 focus:ring-explore-green"
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-2 border-explore-green rounded-lg py-3 px-6 font-cabin text-base text-explore-green placeholder-explore-green focus:outline-none focus:ring-2 focus:ring-explore-green pr-16"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-black opacity-55 text-base font-cabin"
            >
              Show
            </button>
          </div>

          {/* Confirm Password Input */}
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border-2 border-explore-green rounded-lg py-3 px-6 font-cabin text-base text-explore-green placeholder-explore-green focus:outline-none focus:ring-2 focus:ring-explore-green pr-16"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-black opacity-55 text-base font-cabin"
            >
              Show
            </button>
          </div>

          {/* Terms Agreement */}
          <div className="flex items-center gap-3 pt-4">
            <input
              type="checkbox"
              id="terms-agreement"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="w-4 h-4 border-2 border-gray-300 rounded"
            />
            <label
              htmlFor="terms-agreement"
              className="text-sm text-black font-cabin cursor-pointer"
            >
              I agree to the Terms and Privacy Policy
            </label>
          </div>

          {/* Sign Up Button */}
          <button
            onClick={handleSignUp}
            disabled={!agreedToTerms}
            className={`w-full py-3 px-6 rounded-lg font-cabin text-base mt-6 transition-colors ${
              agreedToTerms
                ? "bg-explore-green text-white hover:bg-explore-green-light"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Sign Up
          </button>

          {/* Divider */}
          <div className="text-center py-4">
            <span className="text-gray-400 font-cabin text-base">or</span>
          </div>

          {/* Continue with Apple */}
          <button className="w-full border-2 border-explore-green bg-white text-explore-green py-3 px-6 rounded-lg font-cabin text-base">
            Continue with Apple
          </button>
        </div>
      </div>
    </div>
  );
}
