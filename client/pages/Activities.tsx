import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MapPin, Users, Star, Bookmark } from "lucide-react";
import { useActivities } from "../contexts/ActivitiesContext";
import { useSavedActivities } from "../contexts/SavedActivitiesContext";
import FilterSystem, { FilterOptions } from "../components/FilterSystem";
import MapView from "../components/MapView";

export default function Activities() {
  const { activities } = useActivities();
  const { saveActivity, unsaveActivity, isActivitySaved } =
    useSavedActivities();
  const location = useLocation();
  const navigate = useNavigate();
  const [showMapView, setShowMapView] = useState(false);
  const [filteredActivities, setFilteredActivities] = useState(activities);

  // Check URL parameters for specific activity filter
  const urlParams = new URLSearchParams(location.search);
  const filterParam = urlParams.get("filter");

  const [filters, setFilters] = useState<FilterOptions>({
    activityType: filterParam
      ? [filterParam.charAt(0).toUpperCase() + filterParam.slice(1)]
      : ["Cycling", "Climbing", "Running"],
    numberOfPeople: { min: 1, max: 50 },
    location: "",
    date: { start: "", end: "" },
    gender: [],
    age: { min: 16, max: 80 },
    gear: [],
    pace: { min: 0, max: 100 },
    distance: { min: 0, max: 200 },
    elevation: { min: 0, max: 5000 },
    clubOnly: false,
  });

  const formatActivityDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const applyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleActivitySelect = (activity: any) => {
    setShowMapView(false);
  };

  useEffect(() => {
    let filtered = activities;

    // Apply comprehensive filters
    if (filters.activityType.length > 0) {
      filtered = filtered.filter((activity) =>
        filters.activityType.some(
          (type) =>
            activity.type === type.toLowerCase() ||
            (type === "Cycling" && activity.type === "cycling") ||
            (type === "Climbing" && activity.type === "climbing") ||
            (type === "Running" && activity.type === "running") ||
            (type === "Hiking" && activity.type === "hiking") ||
            (type === "Skiing" && activity.type === "skiing") ||
            (type === "Surfing" && activity.type === "surfing") ||
            (type === "Tennis" && activity.type === "tennis"),
        ),
      );
    }

    // Filter by date range
    if (filters.date.start || filters.date.end) {
      filtered = filtered.filter((activity) => {
        const activityDate = new Date(activity.date);
        const startDate = filters.date.start
          ? new Date(filters.date.start)
          : null;
        const endDate = filters.date.end ? new Date(filters.date.end) : null;

        if (startDate && activityDate < startDate) return false;
        if (endDate && activityDate > endDate) return false;
        return true;
      });
    }

    // Filter by location
    if (filters.location) {
      filtered = filtered.filter(
        (activity) =>
          activity.location
            .toLowerCase()
            .includes(filters.location.toLowerCase()) ||
          activity.meetupLocation
            .toLowerCase()
            .includes(filters.location.toLowerCase()),
      );
    }

    // Filter by number of people
    filtered = filtered.filter((activity) => {
      const maxPeople = parseInt(activity.maxParticipants) || 50;
      return (
        maxPeople >= filters.numberOfPeople.min &&
        maxPeople <= filters.numberOfPeople.max
      );
    });

    // Filter by gender
    if (filters.gender.length > 0) {
      filtered = filtered.filter((activity) =>
        filters.gender.includes(activity.gender || "All genders"),
      );
    }

    setFilteredActivities(filtered);
  }, [activities, filters]);

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

      {/* Main Content */}
      <div className="px-6 pb-20">
        {/* Title */}
        <div className="text-center py-6">
          <h1 className="text-3xl font-bold text-explore-green font-cabin">
            {filterParam
              ? `${filterParam.charAt(0).toUpperCase() + filterParam.slice(1)} Activities`
              : "All Activities"}
          </h1>
        </div>

        {/* Filter System */}
        <FilterSystem
          onFiltersChange={applyFilters}
          onShowMap={() => setShowMapView(true)}
          currentFilters={filters}
        />

        {/* Activities List */}
        <div className="space-y-4 mt-6">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <Users className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No activities found
              </h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your filters or create a new activity
              </p>
              <Link
                to="/create"
                className="inline-block bg-explore-green text-white px-6 py-3 rounded-lg font-cabin font-medium hover:bg-explore-green-dark transition-colors"
              >
                Create Activity
              </Link>
            </div>
          ) : (
            filteredActivities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                formatActivityDate={formatActivityDate}
              />
            ))
          )}
        </div>

        {/* Show sample activities if no user activities */}
        {activities.length === 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Sample Activities
            </h3>
            <div className="space-y-4">
              <SampleActivityCard
                title="Westway Women's Climbing Morning"
                type="climbing"
                date="26 January 2025"
                location="Westway Climbing Centre"
                organizer="Coach Holly Peristiani"
                participants="8/12"
                difficulty="Intermediate"
              />
              <SampleActivityCard
                title="Sunday Morning Social Ride"
                type="cycling"
                date="2 February 2025"
                location="Richmond Park"
                organizer="Richmond Cycling Club"
                participants="12/15"
                difficulty="Beginner"
                distance="25km"
              />
            </div>
          </div>
        )}
      </div>

      {/* Map View */}
      {showMapView && (
        <MapView
          activities={filteredActivities}
          onClose={() => setShowMapView(false)}
          onActivitySelect={handleActivitySelect}
        />
      )}

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}

function ActivityCard({
  activity,
  formatActivityDate,
}: {
  activity: any;
  formatActivityDate: (date: string) => string;
}) {
  const { saveActivity, unsaveActivity, isActivitySaved } =
    useSavedActivities();
  const navigate = useNavigate();

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isActivitySaved(activity.id)) {
      unsaveActivity(activity.id);
    } else {
      saveActivity(activity);
    }
  };

  const handleCardClick = () => {
    if (activity.type === "cycling") {
      navigate("/activity/sunday-morning-ride");
    } else if (activity.type === "climbing") {
      navigate("/activity/westway-womens-climb");
    } else {
      navigate("/activity/westway-womens-climb"); // Default
    }
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-700";
      case "intermediate":
        return "bg-yellow-100 text-yellow-700";
      case "advanced":
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
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-xl">{getActivityIcon(activity.type)}</span>
          <h3 className="font-bold text-black font-cabin text-lg line-clamp-2 leading-tight flex-1">
            {activity.title}
          </h3>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleSaveClick}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title={
              isActivitySaved(activity.id) ? "Unsave activity" : "Save activity"
            }
          >
            <Bookmark
              className={`w-5 h-5 ${
                isActivitySaved(activity.id)
                  ? "fill-explore-green text-explore-green"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            />
          </button>
          {activity.difficulty && (
            <span
              className={`text-xs px-2 py-1 rounded-full font-cabin font-medium ${getDifficultyColor(activity.difficulty)}`}
            >
              {activity.difficulty}
            </span>
          )}
        </div>
      </div>

      {/* Organizer */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm text-gray-600 font-cabin">
          By {activity.organizer}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700 font-cabin">
            📅 {formatActivityDate(activity.date)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-700 font-cabin">
            {activity.location}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-700 font-cabin">
            Max {activity.maxParticipants} participants
          </span>
        </div>
      </div>

      {/* Activity-specific metrics */}
      {activity.type === "cycling" && (activity.distance || activity.pace) && (
        <div className="mt-3 flex gap-4">
          {activity.distance && (
            <div className="text-sm text-gray-600">
              🚴 {activity.distance}
              {activity.distanceUnit}
            </div>
          )}
          {activity.pace && (
            <div className="text-sm text-gray-600">
              ⚡ {activity.pace} {activity.paceUnit}
            </div>
          )}
        </div>
      )}

      {activity.type === "climbing" && activity.climbingLevel && (
        <div className="mt-3">
          <div className="text-sm text-gray-600">
            🧗 Level: {activity.climbingLevel}
          </div>
        </div>
      )}

      {activity.type === "running" && (activity.distance || activity.pace) && (
        <div className="mt-3 flex gap-4">
          {activity.distance && (
            <div className="text-sm text-gray-600">
              🏃 {activity.distance}
              {activity.distanceUnit}
            </div>
          )}
          {activity.pace && (
            <div className="text-sm text-gray-600">
              ⚡ {activity.pace} {activity.paceUnit}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SampleActivityCard({
  title,
  type,
  date,
  location,
  organizer,
  participants,
  difficulty,
  distance,
}: {
  title: string;
  type: string;
  date: string;
  location: string;
  organizer: string;
  participants: string;
  difficulty: string;
  distance?: string;
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (type === "cycling") {
      navigate("/activity/sunday-morning-ride");
    } else {
      navigate("/activity/westway-womens-climb");
    }
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-700";
      case "intermediate":
        return "bg-yellow-100 text-yellow-700";
      case "advanced":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div
      className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50 cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={handleClick}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-xl">{getActivityIcon(type)}</span>
          <h3 className="font-bold text-black font-cabin text-lg line-clamp-2 leading-tight flex-1">
            {title}
          </h3>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full font-cabin font-medium ${getDifficultyColor(difficulty)}`}
        >
          {difficulty}
        </span>
      </div>

      {/* Organizer */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm text-gray-600 font-cabin">By {organizer}</span>
      </div>

      {/* Details */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700 font-cabin">📅 {date}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-700 font-cabin">{location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-700 font-cabin">
            {participants} participants
          </span>
        </div>
      </div>

      {distance && (
        <div className="mt-3">
          <div className="text-sm text-gray-600">
            {getActivityIcon(type)} {distance}
          </div>
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
