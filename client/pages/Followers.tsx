import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Followers() {
  const followers = [
    {
      id: "1",
      name: "Sarah Wilson",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=50&h=50&fit=crop&crop=face",
      activities: "Climbing, Hiking",
    },
    {
      id: "2",
      name: "Mike Johnson",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face",
      activities: "Cycling, Running",
    },
    {
      id: "3",
      name: "Emma Davis",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=50&h=50&fit=crop&crop=face",
      activities: "Rock Climbing",
    },
    {
      id: "4",
      name: "James Brown",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face",
      activities: "Mountain Biking",
    },
    {
      id: "5",
      name: "Lucy Chen",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=50&h=50&fit=crop&crop=face",
      activities: "Yoga, Climbing",
    },
  ];

  return (
    <div className="min-h-screen bg-white font-cabin max-w-md mx-auto relative">
      {/* Status Bar */}
      <div className="h-11 bg-white flex items-center justify-between px-6 text-black font-medium">
        <span>9:41</span>
        <div className="flex items-center gap-1">
          <div className="flex gap-0.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-1 h-3 bg-black rounded-sm"></div>
            ))}
          </div>
          <svg className="w-6 h-4" viewBox="0 0 24 16" fill="none">
            <rect
              x="1"
              y="3"
              width="22"
              height="10"
              rx="2"
              stroke="black"
              strokeWidth="1"
              fill="none"
            />
            <rect x="23" y="6" width="2" height="4" rx="1" fill="black" />
          </svg>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center px-6 py-4 border-b">
        <Link to="/profile" className="mr-4">
          <ArrowLeft className="w-6 h-6 text-black" />
        </Link>
        <h1 className="text-xl font-bold text-black font-cabin">
          Followers (100)
        </h1>
      </div>

      {/* Followers List */}
      <div className="px-6 py-4">
        <div className="space-y-4">
          {followers.map((follower) => (
            <div
              key={follower.id}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <img
                  src={follower.avatar}
                  alt={follower.name}
                  className="w-12 h-12 rounded-full border border-gray-200 object-cover"
                />
                <div>
                  <div className="font-medium text-black font-cabin">
                    {follower.name}
                  </div>
                  <div className="text-sm text-gray-500 font-cabin">
                    {follower.activities}
                  </div>
                </div>
              </div>
              <button className="px-4 py-2 bg-explore-green text-white rounded-lg text-sm font-cabin">
                Following
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
