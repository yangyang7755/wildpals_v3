import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Users,
  Calendar,
  Trophy,
  Heart,
} from "lucide-react";

export default function ClubRichmond() {
  const [isFollowing, setIsFollowing] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const navigate = useNavigate();

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  const handleJoinRequest = () => {
    setShowJoinModal(true);
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
      <div className="flex items-center justify-between p-6 pb-4">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft className="w-6 h-6 text-black" />
        </button>
        <h1 className="text-xl font-bold text-black font-cabin">
          Richmond Park Runners
        </h1>
        <div className="w-6"></div>
      </div>

      {/* Scrollable Content */}
      <div className="overflow-y-auto pb-20 px-6">
        {/* Club Image and Info */}
        <div className="text-center mb-6">
          <img
            src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop"
            alt="Richmond Park Runners"
            className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-explore-green"
          />

          <h2 className="text-2xl font-bold text-black font-cabin mb-2">
            Richmond Park Runners
          </h2>

          <div className="flex items-center justify-center gap-2 text-gray-600 mb-4">
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-cabin">Richmond Park, London</span>
          </div>

          <div className="flex items-center justify-center gap-6 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-explore-green font-cabin">
                245
              </div>
              <div className="text-sm text-gray-600 font-cabin">Members</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-explore-green font-cabin">
                18
              </div>
              <div className="text-sm text-gray-600 font-cabin">
                Events/month
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-explore-green font-cabin">
                4.8
              </div>
              <div className="text-sm text-gray-600 font-cabin">Rating</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={handleFollow}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-cabin font-medium transition-colors ${
                isFollowing
                  ? "bg-gray-200 text-gray-700"
                  : "bg-explore-green text-white hover:bg-explore-green-dark"
              }`}
            >
              <Heart
                className={`w-5 h-5 ${isFollowing ? "fill-current" : ""}`}
              />
              {isFollowing ? "Following" : "Follow"}
            </button>

            <button
              onClick={handleJoinRequest}
              className="flex-1 bg-explore-green text-white py-3 px-4 rounded-lg font-cabin font-medium hover:bg-explore-green-dark transition-colors"
            >
              Request to Join
            </button>
          </div>
        </div>

        {/* About Section */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-black font-cabin mb-3">
            About
          </h3>
          <p className="text-gray-700 font-cabin leading-relaxed">
            Richmond Park Runners is London's premier running community,
            offering everything from casual social runs to competitive training
            sessions. Our beautiful routes through Richmond Park provide the
            perfect setting for runners of all levels to improve their fitness
            and meet like-minded people.
          </p>
        </div>

        {/* Activities */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-black font-cabin mb-3">
            Activities
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">🏃‍♂️</div>
              <div className="text-sm font-medium text-black font-cabin">
                Social Runs
              </div>
              <div className="text-xs text-gray-600 font-cabin">All Paces</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">🏃‍♀️</div>
              <div className="text-sm font-medium text-black font-cabin">
                Women's Runs
              </div>
              <div className="text-xs text-gray-600 font-cabin">Wednesdays</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">⚡</div>
              <div className="text-sm font-medium text-black font-cabin">
                Speed Training
              </div>
              <div className="text-xs text-gray-600 font-cabin">Tuesdays</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">🏆</div>
              <div className="text-sm font-medium text-black font-cabin">
                Race Training
              </div>
              <div className="text-xs text-gray-600 font-cabin">Thursdays</div>
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-black font-cabin mb-3">
            Upcoming Events
          </h3>
          <div className="space-y-3">
            <div className="border-2 border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-black font-cabin">
                  Sunday Long Run
                </h4>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                  Open
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <Calendar className="w-4 h-4" />
                <span>Sunday, 28 January • 8:00 AM</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>Richmond Park Main Gate</span>
              </div>
            </div>

            <div className="border-2 border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-black font-cabin">
                  Speed Session
                </h4>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                  Open
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <Calendar className="w-4 h-4" />
                <span>Tuesday, 30 January • 6:30 PM</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>Richmond Park Athletics Track</span>
              </div>
            </div>
          </div>
        </div>

        {/* Club Leaders */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-black font-cabin mb-3">
            Club Leaders
          </h3>
          <div className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
              alt="Captain"
              className="w-12 h-12 rounded-full border border-black"
            />
            <div className="flex-1">
              <div className="font-medium text-black font-cabin">
                James Mitchell
              </div>
              <div className="text-sm text-gray-600 font-cabin">
                Club Captain
              </div>
            </div>
            <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
              <Trophy className="w-3 h-3 inline mr-1" />
              Marathon PB: 2:45
            </div>
          </div>
        </div>
      </div>

      {/* Join Request Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-sm p-6">
            <h3 className="text-xl font-bold text-explore-green font-cabin mb-4 text-center">
              Join Richmond Park Runners
            </h3>

            <div className="text-center mb-6">
              <img
                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=80&h=80&fit=crop"
                alt="Richmond Park Runners"
                className="w-20 h-20 rounded-full mx-auto mb-4 border-2 border-explore-green"
              />
              <p className="text-gray-700 font-cabin">
                Your membership request will be sent to the club administrators
                for review.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowJoinModal(false)}
                className="flex-1 py-3 border-2 border-gray-300 rounded-lg text-gray-600 font-cabin font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowJoinModal(false);
                  alert("Join request sent!");
                }}
                className="flex-1 py-3 bg-explore-green text-white rounded-lg font-cabin font-medium"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Navigation Indicator */}
      <div className="absolute bottom-2 left-12 w-2 h-2 bg-white border border-explore-green rounded-full"></div>
    </div>
  );
}
