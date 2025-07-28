import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Following() {
  const following = [
    {
      id: "1",
      name: "Alex Rodriguez",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face",
      activities: "Lead Climbing",
    },
    {
      id: "2",
      name: "Sophie Taylor",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=50&h=50&fit=crop&crop=face",
      activities: "Trail Running, Hiking",
    },
    {
      id: "3",
      name: "Dan Mitchell",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face",
      activities: "Road Cycling",
    },
    {
      id: "4",
      name: "Rachel Green",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=50&h=50&fit=crop&crop=face",
      activities: "Bouldering",
    },
    {
      id: "5",
      name: "Tom Wilson",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face",
      activities: "Mountain Biking",
    },
    {
      id: "6",
      name: "Holly Coach",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=50&h=50&fit=crop&crop=face",
      activities: "Climbing Coach",
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
          Following (105)
        </h1>
      </div>

      {/* Following List */}
      <div className="px-6 py-4">
        <div className="space-y-4">
          {following.map((person) => (
            <div key={person.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={person.avatar}
                  alt={person.name}
                  className="w-12 h-12 rounded-full border border-gray-200 object-cover"
                />
                <div>
                  <div className="font-medium text-black font-cabin">
                    {person.name}
                  </div>
                  <div className="text-sm text-gray-500 font-cabin">
                    {person.activities}
                  </div>
                </div>
              </div>
              <button className="px-4 py-2 border-2 border-gray-300 text-gray-600 rounded-lg text-sm font-cabin hover:border-red-300 hover:text-red-600">
                Unfollow
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
