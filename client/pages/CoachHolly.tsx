import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus, UserCheck } from "lucide-react";

export default function CoachHolly() {
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(false);

  const profileData = {
    bio: "Professional climbing coach with 10+ years experience. Love helping people reach new heights!",
    activities: ["Climbing", "Bouldering"],
    joinedActivities: 45,
    preferredTerrain: ["Indoor", "Sport", "Trad"],
    gear: ["Lead belay ✓", "Multipitch ✓", "Rescue", "First aid"],
    clubs: ["Westway", "London Climbers"],
    location: "London, UK",
    tags: ["Coach", "Expert"],
  };

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
  };

  const handleActivityClick = (activity: string) => {
    if (activity === "Climbing") {
      navigate("/activities?filter=climbing");
    } else if (activity === "Bouldering") {
      navigate("/activities?filter=climbing&type=bouldering");
    }
  };

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
      <div className="p-6 text-center">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-6 top-16 text-explore-green"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <img
          src="https://images.unsplash.com/photo-1522163182402-834f871fd851?w=120&h=120&fit=crop&crop=face"
          alt="Coach Holly Peristiani"
          className="w-24 h-24 rounded-full border-2 border-black mx-auto mb-4 object-cover"
        />
        <h2 className="text-xl font-bold text-black font-cabin">
          Coach Holly Peristiani
        </h2>
        <p className="text-gray-600 text-sm font-cabin mt-1">
          {profileData.location}
        </p>

        <div className="flex justify-center gap-3 mt-4">
          <button
            onClick={handleFollowToggle}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-cabin font-medium transition-colors ${
              isFollowing
                ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                : "bg-explore-green text-white hover:bg-explore-green-dark"
            }`}
          >
            {isFollowing ? (
              <>
                <UserCheck className="w-4 h-4" />
                Following
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Follow
              </>
            )}
          </button>
          <Link
            to="/chat/coach-holly"
            className="px-6 py-2 border border-explore-green text-explore-green rounded-lg text-sm font-cabin font-medium hover:bg-explore-green hover:text-white transition-colors"
          >
            Message
          </Link>
        </div>
      </div>

      {/* Profile Content */}
      <div className="px-6 space-y-6">
        {/* Bio */}
        <div>
          <h3 className="text-lg font-bold text-black font-cabin mb-2">
            About
          </h3>
          <p className="text-sm text-gray-700 font-cabin leading-relaxed">
            {profileData.bio}
          </p>
        </div>

        {/* Tags */}
        <div>
          <h3 className="text-lg font-bold text-black font-cabin mb-3">
            Specialties
          </h3>
          <div className="flex gap-2 flex-wrap">
            {profileData.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-explore-green bg-opacity-10 text-explore-green rounded-full text-sm font-cabin"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Activities - Clickable */}
        <div>
          <h3 className="text-lg font-bold text-black font-cabin mb-3">
            Activities & Expertise
          </h3>
          <div className="flex gap-2 flex-wrap">
            {profileData.activities.map((activity, index) => (
              <button
                key={index}
                onClick={() => handleActivityClick(activity)}
                className="px-4 py-2 bg-explore-green text-white rounded-lg text-sm font-cabin font-medium hover:bg-explore-green-dark transition-colors"
              >
                {activity}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div>
          <h3 className="text-lg font-bold text-black font-cabin mb-3">
            Stats
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-xl font-bold text-explore-green font-cabin">
                {profileData.joinedActivities}
              </div>
              <div className="text-sm text-gray-600 font-cabin">
                Activities Led
              </div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-xl font-bold text-explore-green font-cabin">
                {isFollowing ? "324" : "323"}
              </div>
              <div className="text-sm text-gray-600 font-cabin">Followers</div>
            </div>
          </div>
        </div>

        {/* Preferred Terrain */}
        <div>
          <h3 className="text-lg font-bold text-black font-cabin mb-3">
            Preferred Terrain
          </h3>
          <div className="flex gap-2 flex-wrap">
            {profileData.preferredTerrain.map((terrain, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-cabin"
              >
                {terrain}
              </span>
            ))}
          </div>
        </div>

        {/* Gear & Skills */}
        <div>
          <h3 className="text-lg font-bold text-black font-cabin mb-3">
            Gear & Skills
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {profileData.gear.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-sm font-cabin"
              >
                <span className="text-explore-green">✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Clubs */}
        <div className="pb-20">
          <h3 className="text-lg font-bold text-black font-cabin mb-3">
            Clubs
          </h3>
          <div className="space-y-2">
            {profileData.clubs.map((club, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="w-10 h-10 bg-explore-green rounded-full flex items-center justify-center">
                  <span className="text-white font-bold font-cabin text-sm">
                    {club.charAt(0)}
                  </span>
                </div>
                <span className="font-medium font-cabin">{club}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}

function BottomNavigation() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white h-14 flex items-center justify-around border-t border-gray-200 max-w-md mx-auto">
      {/* Home Icon */}
      <Link to="/explore" className="p-2">
        <svg className="w-8 h-7" viewBox="0 0 35 31" fill="none">
          <path
            d="M31.4958 7.46836L21.4451 1.22114C18.7055 -0.484058 14.5003 -0.391047 11.8655 1.42266L3.12341 7.48386C1.37849 8.693 0 11.1733 0 13.1264V23.8227C0 27.7756 3.61199 31 8.06155 31H26.8718C31.3213 31 34.9333 27.7911 34.9333 23.8382V13.328C34.9333 11.2353 33.4152 8.662 31.4958 7.46836ZM18.7753 24.7993C18.7753 25.4349 18.1821 25.9619 17.4666 25.9619C16.7512 25.9619 16.1579 25.4349 16.1579 24.7993V20.1487C16.1579 19.5132 16.7512 18.9861 17.4666 18.9861C18.1821 18.9861 18.7753 19.5132 18.7753 20.1487V24.7993Z"
            fill="#2F2F2F"
          />
        </svg>
      </Link>

      {/* Clock Icon */}
      <Link to="/saved" className="p-2">
        <svg
          className="w-7 h-7"
          viewBox="0 0 30 30"
          fill="none"
          stroke="#1E1E1E"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="15" cy="15" r="12.5" />
          <path d="M15 7.5V15L20 17.5" />
        </svg>
      </Link>

      {/* Plus Icon */}
      <Link to="/create" className="p-2">
        <svg
          className="w-7 h-7"
          viewBox="0 0 30 30"
          fill="none"
          stroke="#1E1E1E"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 6.25V23.75M6.25 15H23.75" />
        </svg>
      </Link>

      {/* Chat Icon */}
      <Link to="/chat" className="p-2">
        <svg className="w-7 h-7" viewBox="0 0 30 30" fill="none">
          <path
            d="M2.5 27.5V5C2.5 4.3125 2.74479 3.72396 3.23438 3.23438C3.72396 2.74479 4.3125 2.5 5 2.5H25C25.6875 2.5 26.276 2.74479 26.7656 3.23438C27.2552 3.72396 27.5 4.3125 27.5 5V20C27.5 20.6875 27.2552 21.276 26.7656 21.7656C26.276 22.2552 25.6875 22.5 25 22.5H7.5L2.5 27.5Z"
            fill="#1D1B20"
          />
        </svg>
      </Link>

      {/* Profile Icon */}
      <Link to="/profile" className="p-2">
        <svg className="w-8 h-8" viewBox="0 0 35 35" fill="none">
          <path
            d="M17.5 17.4999C15.8958 17.4999 14.5225 16.9287 13.3802 15.7864C12.2378 14.644 11.6666 13.2708 11.6666 11.6666C11.6666 10.0624 12.2378 8.68915 13.3802 7.54679C14.5225 6.40443 15.8958 5.83325 17.5 5.83325C19.1041 5.83325 20.4774 6.40443 21.6198 7.54679C22.7621 8.68915 23.3333 10.0624 23.3333 11.6666C23.3333 13.2708 22.7621 14.644 21.6198 15.7864C20.4774 16.9287 19.1041 17.4999 17.5 17.4999ZM5.83331 29.1666V25.0833C5.83331 24.2569 6.04599 23.4973 6.47133 22.8046C6.89668 22.1119 7.46179 21.5833 8.16665 21.2187C9.67359 20.4652 11.2048 19.9001 12.7604 19.5234C14.316 19.1466 15.8958 18.9583 17.5 18.9583C19.1041 18.9583 20.684 19.1466 22.2396 19.5234C23.7951 19.9001 25.3264 20.4652 26.8333 21.2187C27.5382 21.5833 28.1033 22.1119 28.5286 22.8046C28.954 23.4973 29.1666 24.2569 29.1666 25.0833V29.1666H5.83331Z"
            fill="#1D1B20"
          />
        </svg>
      </Link>
    </div>
  );
}
