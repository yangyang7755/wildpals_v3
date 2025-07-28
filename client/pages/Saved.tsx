import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bookmark, Clock, MapPin, Users, CheckCircle } from "lucide-react";
import { useSavedActivities } from "../contexts/SavedActivitiesContext";
import { Activity } from "../contexts/ActivitiesContext";

export default function Saved() {
  const { savedActivities, unsaveActivity } = useSavedActivities();
  const [selectedTab, setSelectedTab] = useState("Saved");

  // Sort activities by date (future vs past)
  const now = new Date();
  const today = now.toISOString().split("T")[0];

  const upcomingSavedActivities = savedActivities.filter((activity) => {
    const activityDate = new Date(activity.date);
    const activityDateString = activityDate.toISOString().split("T")[0];
    return activityDateString >= today;
  });

  const pastSavedActivities = savedActivities.filter((activity) => {
    const activityDate = new Date(activity.date);
    const activityDateString = activityDate.toISOString().split("T")[0];
    return activityDateString < today;
  });

  // Sample joined activities (activities the user has joined)
  const joinedActivities = [
    {
      id: "joined-1",
      title: "Westway Women's+ Climbing Morning",
      date: "2025-01-26",
      time: "10:00",
      location: "Westway Climbing Centre",
      organizer: "Coach Holly Peristiani",
      type: "climbing",
      status: "confirmed",
      maxParticipants: "12",
      specialComments: "",
      meetupLocation: "Westway Climbing Centre",
      gender: "Female only",
      visibility: "All",
      createdAt: new Date(),
    },
    {
      id: "joined-2",
      title: "Sunday Morning Social Ride",
      date: "2025-02-02",
      time: "08:00",
      location: "Richmond Park",
      organizer: "Richmond Cycling Club",
      type: "cycling",
      status: "pending",
      distance: "25",
      distanceUnit: "km",
      pace: "20",
      paceUnit: "kph",
      maxParticipants: "15",
      specialComments: "",
      meetupLocation: "Richmond Park Main Gate",
      gender: "All genders",
      visibility: "All",
      createdAt: new Date(),
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

      {/* Scrollable Content */}
      <div className="overflow-y-auto pb-20">
        <div className="px-6">
          {/* Title */}
          <div className="text-center py-6">
            <h1 className="text-4xl font-bold text-explore-green font-cabin">
              My Activities
            </h1>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6">
            {["Saved", "Joined"].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`flex-1 py-3 px-4 rounded-lg border-2 font-cabin font-medium transition-colors ${
                  selectedTab === tab
                    ? "bg-explore-green text-white border-explore-green"
                    : "bg-white text-explore-green border-explore-green hover:bg-gray-50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Saved Activities Tab */}
          {selectedTab === "Saved" && (
            <div>
              {/* No saved activities message */}
              {savedActivities.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <Bookmark className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    No saved activities yet
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Save activities from the explore page to see them here
                  </p>
                  <Link
                    to="/explore"
                    className="inline-block bg-explore-green text-white px-6 py-3 rounded-lg font-cabin font-medium hover:bg-explore-green-dark transition-colors"
                  >
                    Explore Activities
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Upcoming Saved Activities */}
                  {upcomingSavedActivities.length > 0 && (
                    <div>
                      <h2 className="text-xl font-semibold text-black font-cabin mb-4">
                        Upcoming ({upcomingSavedActivities.length})
                      </h2>
                      <div className="space-y-4">
                        {upcomingSavedActivities.map((activity) => (
                          <ActivityCard
                            key={activity.id}
                            activity={activity}
                            onUnsave={unsaveActivity}
                            showSaveButton={true}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Past Saved Activities */}
                  {pastSavedActivities.length > 0 && (
                    <div>
                      <h2 className="text-xl font-semibold text-black font-cabin mb-4">
                        Past ({pastSavedActivities.length})
                      </h2>
                      <div className="space-y-4">
                        {pastSavedActivities.map((activity) => (
                          <ActivityCard
                            key={activity.id}
                            activity={activity}
                            onUnsave={unsaveActivity}
                            showSaveButton={true}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Joined Activities Tab */}
          {selectedTab === "Joined" && (
            <div>
              {joinedActivities.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <CheckCircle className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    No joined activities yet
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Join activities from the explore page to see them here
                  </p>
                  <Link
                    to="/explore"
                    className="inline-block bg-explore-green text-white px-6 py-3 rounded-lg font-cabin font-medium hover:bg-explore-green-dark transition-colors"
                  >
                    Explore Activities
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {joinedActivities.map((activity) => (
                    <ActivityCard
                      key={activity.id}
                      activity={activity}
                      showJoinedStatus={true}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}

function ActivityCard({
  activity,
  onUnsave,
  showSaveButton = false,
  showJoinedStatus = false,
}: {
  activity: Activity | any;
  onUnsave?: (id: string) => void;
  showSaveButton?: boolean;
  showJoinedStatus?: boolean;
}) {
  const navigate = useNavigate();

  const handleUnsave = () => {
    if (onUnsave) {
      onUnsave(activity.id);
    }
  };

  const handleCardClick = () => {
    // Navigate to activity details based on activity type
    if (activity.type === "cycling") {
      navigate("/activity/sunday-morning-ride");
    } else if (activity.type === "climbing") {
      navigate("/activity/westway-womens-climb");
    } else if (activity.type === "running") {
      navigate("/activity/westway-womens-climb"); // Default for now
    } else {
      navigate("/activity/westway-womens-climb"); // Default
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":");
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? "PM" : "AM";
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "cycling":
        return "🚴";
      case "climbing":
        return "🧗";
      case "running":
        return "👟";
      default:
        return "⚡";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div
      className="border-2 border-gray-200 rounded-lg p-4 bg-white cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={handleCardClick}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-xl">{getActivityIcon(activity.type)}</span>
          <h3 className="text-lg font-semibold text-black font-cabin flex-1">
            {activity.title}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {showJoinedStatus && activity.status && (
            <span
              className={`text-xs px-2 py-1 rounded-full font-cabin font-medium ${getStatusColor(activity.status)}`}
            >
              {activity.status.charAt(0).toUpperCase() +
                activity.status.slice(1)}
            </span>
          )}
          {showSaveButton && (
            <button
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleUnsave();
              }}
            >
              <Bookmark className="w-5 h-5 fill-explore-green text-explore-green" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-gray-600">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-cabin">
            {formatDate(activity.date)} • {formatTime(activity.time)}
          </span>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <MapPin className="w-4 h-4" />
          <span className="text-sm font-cabin">{activity.location}</span>
        </div>

        {activity.organizer && (
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="w-4 h-4" />
            <span className="text-sm font-cabin">By {activity.organizer}</span>
          </div>
        )}

        {/* Activity-specific metrics */}
        {activity.type === "cycling" &&
          (activity.distance || activity.pace) && (
            <div className="flex gap-4 text-sm text-gray-600 mt-2">
              {activity.distance && (
                <span>
                  🚴 {activity.distance}
                  {activity.distanceUnit}
                </span>
              )}
              {activity.pace && (
                <span>
                  ⚡ {activity.pace} {activity.paceUnit}
                </span>
              )}
            </div>
          )}

        {activity.type === "running" &&
          (activity.distance || activity.pace) && (
            <div className="flex gap-4 text-sm text-gray-600 mt-2">
              {activity.distance && (
                <span>
                  🏃 {activity.distance}
                  {activity.distanceUnit}
                </span>
              )}
              {activity.pace && (
                <span>
                  ⚡ {activity.pace} {activity.paceUnit}
                </span>
              )}
            </div>
          )}
      </div>

      {/* Status Button for Joined Activities */}
      {showJoinedStatus && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <button
            onClick={(e) => e.stopPropagation()}
            className={`w-full py-2 rounded-lg text-sm font-cabin font-medium transition-colors ${
              activity.status === "confirmed"
                ? "bg-green-100 text-green-700 cursor-default"
                : activity.status === "pending"
                  ? "bg-yellow-100 text-yellow-700 cursor-default"
                  : "bg-gray-100 text-gray-700 cursor-default"
            }`}
          >
            {activity.status === "confirmed"
              ? "✓ Joined"
              : activity.status === "pending"
                ? "⏳ Pending"
                : "Request Status"}
          </button>
        </div>
      )}
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

      {/* Clock Icon - Active */}
      <Link to="/saved" className="p-2 bg-explore-green rounded-full">
        <svg
          className="w-7 h-7"
          viewBox="0 0 30 30"
          fill="none"
          stroke="#FFFFFF"
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
      <div className="absolute bottom-2 left-[112px] w-2 h-2 bg-white border border-explore-green rounded-full"></div>
    </div>
  );
}
