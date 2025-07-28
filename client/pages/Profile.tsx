import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  CheckCircle,
  Circle,
  Star,
  Settings,
  Trophy,
  Award,
} from "lucide-react";

export default function Profile() {
  const [selectedTab, setSelectedTab] = useState("Climb");
  const navigate = useNavigate();

  // Sample user data - this would normally come from a context or API
  const userProfile = {
    name: "Ben Stuart",
    bio: "Weekend warrior. Always up for some mountain adventures",
    location: "Notting Hill, London",
    profileImage:
      "https://cdn.builder.io/api/v1/image/assets%2Ff84d5d174b6b486a8c8b5017bb90c068%2F23fa8ee56cbe4c7e834fbdf7cdf6cfd3?format=webp&width=800",
    followers: 100,
    following: 105,
    overallRating: 4.8,
    totalReviews: 24,
    sports: ["climbing", "cycling", "running"],
    skillLevels: {
      climbing: "Intermediate",
      cycling: "Advanced",
      running: "Beginner",
    },
  };

  const reviews = [
    {
      id: 1,
      reviewer: "Sarah Chen",
      reviewerImage:
        "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face",
      rating: 5,
      comment: "Great climbing partner! Very supportive and reliable.",
      activity: "Westway Women's Climb",
      date: "2025-01-15",
    },
    {
      id: 2,
      reviewer: "Mike Johnson",
      reviewerImage:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      rating: 5,
      comment: "Excellent cyclist, kept great pace throughout the ride.",
      activity: "Richmond Park Social",
      date: "2025-01-20",
    },
    {
      id: 3,
      reviewer: "Emma Wilson",
      reviewerImage:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
      rating: 4,
      comment: "Fun running companion, very motivating!",
      activity: "Hyde Park Morning Run",
      date: "2025-01-28",
    },
  ];

  const climbingData = {
    activities: {
      created: [
        {
          id: 1,
          title: "Beginner Sport Climbing",
          date: "2025-02-05",
          participants: 8,
          location: "Westway",
        },
        {
          id: 2,
          title: "Trad Climbing Workshop",
          date: "2025-01-22",
          participants: 6,
          location: "Peak District",
        },
      ],
      participated: [
        {
          id: 1,
          title: "Westway Women's+ Climb",
          date: "2025-01-26",
          organizer: "Coach Holly",
          rating: 5,
        },
        {
          id: 2,
          title: "Portland Sport Trip",
          date: "2025-01-15",
          organizer: "Peak Adventures",
          rating: 5,
        },
        {
          id: 3,
          title: "Indoor Bouldering Session",
          date: "2025-01-08",
          organizer: "The Castle",
          rating: 4,
        },
      ],
    },
    gear: [
      { name: "Lead belay", owned: true, icon: "🧗" },
      { name: "Multipitch", owned: true, icon: "⛰️" },
      { name: "Trad rack", owned: false, icon: "🔧" },
      { name: "Rope", owned: false, icon: "🪢" },
      { name: "Quickdraws", owned: false, icon: "🔗" },
      { name: "Helmet", owned: false, icon: "⛑️" },
    ],
    stats: {
      totalClimbs: 18,
      favoriteGrades: ["5.8", "5.9", "5.10a"],
      preferredTerrain: ["Indoor", "Sport"],
    },
  };

  const cyclingData = {
    activities: {
      created: [
        {
          id: 1,
          title: "Weekend Gravel Ride",
          date: "2025-02-08",
          participants: 12,
          location: "Surrey Hills",
        },
        {
          id: 2,
          title: "Morning Commuter Ride",
          date: "2025-01-30",
          participants: 15,
          location: "Hyde Park",
        },
      ],
      participated: [
        {
          id: 1,
          title: "Sunday Morning Social",
          date: "2025-02-02",
          organizer: "Richmond Cycling",
          rating: 5,
        },
        {
          id: 2,
          title: "Intermediate Chaingang",
          date: "2025-01-28",
          organizer: "Surrey Road Cycling",
          rating: 4,
        },
        {
          id: 3,
          title: "London to Brighton",
          date: "2025-01-20",
          organizer: "British Heart Foundation",
          rating: 5,
        },
      ],
    },
    gear: [
      { name: "Road bike", owned: true, icon: "🚴" },
      { name: "Helmet", owned: true, icon: "⛑️" },
      { name: "Cycling shoes", owned: true, icon: "👟" },
      { name: "Power meter", owned: false, icon: "⚡" },
      { name: "GPS computer", owned: true, icon: "📱" },
      { name: "Repair kit", owned: false, icon: "🔧" },
    ],
    stats: {
      totalRides: 24,
      totalDistance: "1,250 km",
      averageSpeed: "25 kph",
      preferredTypes: ["Road cycling", "Sportives", "Social rides"],
    },
  };

  const runningData = {
    activities: {
      created: [
        {
          id: 1,
          title: "Beginner's Running Group",
          date: "2025-02-10",
          participants: 10,
          location: "Regent's Park",
        },
      ],
      participated: [
        {
          id: 1,
          title: "Hyde Park Morning Run",
          date: "2025-01-28",
          organizer: "London Runners",
          rating: 4,
        },
        {
          id: 2,
          title: "Parkrun Richmond",
          date: "2025-01-25",
          organizer: "Parkrun",
          rating: 5,
        },
        {
          id: 3,
          title: "Half Marathon Training",
          date: "2025-01-18",
          organizer: "Running Club",
          rating: 4,
        },
      ],
    },
    gear: [
      { name: "Running shoes", owned: true, icon: "👟" },
      { name: "GPS watch", owned: true, icon: "⌚" },
      { name: "Running belt", owned: false, icon: "🎽" },
      { name: "Hydration pack", owned: false, icon: "💧" },
      { name: "Reflective gear", owned: true, icon: "🦺" },
      { name: "Heart rate monitor", owned: false, icon: "❤️" },
    ],
    stats: {
      totalRuns: 12,
      totalDistance: "185 km",
      personalBests: {
        "5K": "22:15",
        "10K": "46:30",
        "Half Marathon": "1:42:00",
      },
      preferredTypes: ["Park runs", "Trail running", "Social runs"],
    },
  };

  const clubs = [
    {
      name: "Westway",
      logo: "https://cdn.builder.io/api/v1/image/assets%2Ff84d5d174b6b486a8c8b5017bb90c068%2F1e4beaadbd444b8497b8d2ef2ac43e70?format=webp&width=800",
      path: "/club/westway",
    },
    {
      name: "CULMC",
      logo: "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=50&h=50&fit=crop",
      path: "/club/oxford-cycling",
    },
  ];

  const getCurrentSportData = () => {
    switch (selectedTab) {
      case "Climb":
        return climbingData;
      case "Ride":
        return cyclingData;
      case "Run":
        return runningData;
      default:
        return climbingData;
    }
  };

  const handleFollowersClick = () => {
    navigate("/followers");
  };

  const handleFollowingClick = () => {
    navigate("/following");
  };

  const handleSettingsClick = () => {
    navigate("/settings");
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ));
  };

  const currentSportData = getCurrentSportData();

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

      {/* Scrollable Content */}
      <div className="overflow-y-auto pb-20">
        <div className="px-6">
          {/* Profile Header */}
          <div className="flex items-start justify-between mt-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-full border border-black overflow-hidden">
                <img
                  src={userProfile.profileImage}
                  alt={userProfile.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h1 className="text-xl font-bold text-black font-cabin mb-2">
                  {userProfile.name}
                </h1>
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={handleFollowersClick}
                    className="text-sm text-explore-green font-cabin underline"
                  >
                    {userProfile.followers} Followers
                  </button>
                  <span className="text-sm text-gray-400">•</span>
                  <button
                    onClick={handleFollowingClick}
                    className="text-sm text-explore-green font-cabin underline"
                  >
                    {userProfile.following} Following
                  </button>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {renderStars(Math.floor(userProfile.overallRating))}
                  </div>
                  <span className="text-sm text-gray-600 font-cabin">
                    {userProfile.overallRating} ({userProfile.totalReviews}{" "}
                    reviews)
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button className="px-4 py-2 border-2 border-explore-green rounded-lg text-explore-green text-sm font-cabin">
                Share
              </button>
              <button
                onClick={handleSettingsClick}
                className="p-2 border-2 border-explore-green rounded-lg text-explore-green hover:bg-explore-green hover:text-white transition-colors"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Activity Tags with Skill Levels */}
          <div className="flex gap-3 mb-6 flex-wrap">
            <div className="bg-explore-green text-white px-4 py-2 rounded-lg text-sm font-bold font-cabin">
              Sport climber • {userProfile.skillLevels.climbing}
            </div>
            <div className="border-2 border-explore-green text-explore-green px-4 py-2 rounded-lg text-sm font-cabin">
              Road cyclist • {userProfile.skillLevels.cycling}
            </div>
            <div className="border-2 border-explore-green text-explore-green px-4 py-2 rounded-lg text-sm font-cabin">
              Runner • {userProfile.skillLevels.running}
            </div>
          </div>

          {/* Bio */}
          <p className="text-lg text-explore-green font-cabin mb-6">
            {userProfile.bio}
          </p>

          {/* Activity Filter Tabs */}
          <div className="flex gap-2 mb-6">
            {["Climb", "Ride", "Run"].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-6 py-2 rounded-lg border border-black text-sm font-bold font-cabin ${
                  selectedTab === tab
                    ? "bg-explore-green text-white"
                    : "bg-gray-100 text-explore-green"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Sport-Specific Content */}
          <div className="space-y-8">
            {/* Stats Overview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-black font-cabin mb-3">
                {selectedTab} Statistics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {selectedTab === "Climb" && (
                  <>
                    <div>
                      <div className="text-2xl font-bold text-explore-green">
                        {currentSportData.stats.totalClimbs}
                      </div>
                      <div className="text-sm text-gray-600">Total Climbs</div>
                    </div>
                    <div>
                      <div className="text-lg font-medium text-explore-green">
                        {currentSportData.stats.favoriteGrades.join(", ")}
                      </div>
                      <div className="text-sm text-gray-600">
                        Favorite Grades
                      </div>
                    </div>
                  </>
                )}
                {selectedTab === "Ride" && (
                  <>
                    <div>
                      <div className="text-2xl font-bold text-explore-green">
                        {currentSportData.stats.totalRides}
                      </div>
                      <div className="text-sm text-gray-600">Total Rides</div>
                    </div>
                    <div>
                      <div className="text-lg font-medium text-explore-green">
                        {currentSportData.stats.totalDistance}
                      </div>
                      <div className="text-sm text-gray-600">Distance</div>
                    </div>
                  </>
                )}
                {selectedTab === "Run" && (
                  <>
                    <div>
                      <div className="text-2xl font-bold text-explore-green">
                        {currentSportData.stats.totalRuns}
                      </div>
                      <div className="text-sm text-gray-600">Total Runs</div>
                    </div>
                    <div>
                      <div className="text-lg font-medium text-explore-green">
                        {currentSportData.stats.totalDistance}
                      </div>
                      <div className="text-sm text-gray-600">Distance</div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Activities Created */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-explore-green" />
                Activities Created
              </h3>
              <div className="space-y-3">
                {currentSportData.activities.created.map((activity) => (
                  <div
                    key={activity.id}
                    className="border-2 border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-black font-cabin">
                        {activity.title}
                      </h4>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {activity.participants} joined
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 font-cabin">
                      {activity.date} • {activity.location}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Activities Participated */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-explore-green" />
                Activities Participated
              </h3>
              <div className="space-y-3">
                {currentSportData.activities.participated.map((activity) => (
                  <div
                    key={activity.id}
                    className="border-2 border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-black font-cabin">
                        {activity.title}
                      </h4>
                      <div className="flex">{renderStars(activity.rating)}</div>
                    </div>
                    <div className="text-sm text-gray-600 font-cabin">
                      {activity.date} • By {activity.organizer}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gear & Equipment */}
            <div>
              <h3 className="text-xl font-medium text-black font-cabin mb-4">
                Gear & Equipment
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {currentSportData.gear.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm text-black font-cabin flex-1">
                      {item.name}
                    </span>
                    {item.owned ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-300" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-8">
            <h3 className="text-xl font-medium text-black font-cabin mb-4">
              Recent Reviews
            </h3>
            <div className="space-y-4">
              {reviews.slice(0, 3).map((review) => (
                <div
                  key={review.id}
                  className="border-2 border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <img
                      src={review.reviewerImage}
                      alt={review.reviewer}
                      className="w-10 h-10 rounded-full border border-black"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-black font-cabin text-sm">
                          {review.reviewer}
                        </span>
                        <div className="flex">{renderStars(review.rating)}</div>
                      </div>
                      <div className="text-xs text-gray-500 font-cabin">
                        {review.activity} • {review.date}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 font-cabin">
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Clubs Section */}
          <div className="mt-8">
            <h3 className="text-xl font-medium text-black font-cabin mb-4">
              Clubs
            </h3>
            <div className="flex gap-4">
              {clubs.map((club, index) => (
                <Link
                  key={index}
                  to={club.path}
                  className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full overflow-hidden">
                    <img
                      src={club.logo}
                      alt={club.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-sm font-cabin text-black hover:text-explore-green transition-colors">
                    {club.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Location Section */}
          <div className="mt-8">
            <h3 className="text-xl font-medium text-black font-cabin mb-2">
              Location
            </h3>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-black font-cabin">
                {userProfile.location}
              </span>
            </div>
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

      {/* Profile Icon - Active */}
      <Link to="/profile" className="p-2 bg-explore-green rounded-full">
        <svg className="w-8 h-8" viewBox="0 0 35 35" fill="none">
          <path
            d="M17.5 17.4999C15.8958 17.4999 14.5225 16.9287 13.3802 15.7864C12.2378 14.644 11.6666 13.2708 11.6666 11.6666C11.6666 10.0624 12.2378 8.68915 13.3802 7.54679C14.5225 6.40443 15.8958 5.83325 17.5 5.83325C19.1041 5.83325 20.4774 6.40443 21.6198 7.54679C22.7621 8.68915 23.3333 10.0624 23.3333 11.6666C23.3333 13.2708 22.7621 14.644 21.6198 15.7864C20.4774 16.9287 19.1041 17.4999 17.5 17.4999ZM5.83331 29.1666V25.0833C5.83331 24.2569 6.04599 23.4973 6.47133 22.8046C6.89668 22.1119 7.46179 21.5833 8.16665 21.2187C9.67359 20.4652 11.2048 19.9001 12.7604 19.5234C14.316 19.1466 15.8958 18.9583 17.5 18.9583C19.1041 18.9583 20.684 19.1466 22.2396 19.5234C23.7951 19.9001 25.3264 20.4652 26.8333 21.2187C27.5382 21.5833 28.1033 22.1119 28.5286 22.8046C28.954 23.4973 29.1666 24.2569 29.1666 25.0833V29.1666H5.83331Z"
            fill="#FFFFFF"
          />
        </svg>
      </Link>

      {/* Navigation Indicator */}
      <div className="absolute bottom-2 right-12 w-2 h-2 bg-white border border-explore-green rounded-full"></div>
    </div>
  );
}
