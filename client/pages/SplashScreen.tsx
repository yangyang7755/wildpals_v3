import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/auth");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white font-cabin max-w-md mx-auto relative flex flex-col justify-center items-center">
      {/* Logo */}
      <div className="flex flex-col items-center">
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
        <h1 className="text-2xl font-bold text-black font-cabin">Wildpals</h1>
      </div>
    </div>
  );
}
