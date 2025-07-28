import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bookmark } from "lucide-react";
import RequestJoinModal from "./RequestJoinModal";
import { useSavedActivities } from "../contexts/SavedActivitiesContext";
import { Activity } from "../contexts/ActivitiesContext";

interface ActivityCardProps {
  title: string;
  date: string;
  location: string;
  imageSrc: string;
  isFirstCard?: boolean;
  organizer?: string;
  type?: string;
  distance?: string;
  pace?: string;
  elevation?: string;
  difficulty?: string;
  activityId?: string;
}

export default function ActivityCard({
  title,
  date,
  location,
  imageSrc,
  isFirstCard = false,
  organizer = "Community",
  type = "climbing",
  distance,
  pace,
  elevation,
  difficulty,
  activityId,
}: ActivityCardProps) {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const navigate = useNavigate();
  const { saveActivity, unsaveActivity, isActivitySaved } =
    useSavedActivities();

  const handleCardClick = () => {
    // Show request modal instead of navigating to activity details
    setShowRequestModal(true);
  };

  const handleRequestClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setShowRequestModal(true);
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    const currentActivityId =
      activityId || `${title}-${organizer}`.replace(/\s+/g, "-").toLowerCase();

    if (isActivitySaved(currentActivityId)) {
      unsaveActivity(currentActivityId);
    } else {
      // Create activity object for saving
      const activityToSave: Activity = {
        id: currentActivityId,
        type: type as "cycling" | "climbing",
        title,
        date: date.includes("📅") ? date.replace("📅 ", "") : date,
        time: "09:00", // Default time
        location: location.includes("📍")
          ? location.replace("📍", "")
          : location,
        meetupLocation: location.includes("📍")
          ? location.replace("📍", "")
          : location,
        organizer,
        distance,
        elevation,
        pace,
        maxParticipants: "10",
        specialComments: "",
        imageSrc,
        climbingLevel: difficulty,
        gender: "All genders",
        visibility: "All",
        createdAt: new Date(),
      };
      saveActivity(activityToSave);
    }
  };

  // Determine difficulty level and color
  const getDifficultyBadge = () => {
    if (!difficulty && type === "cycling") {
      if (pace && parseInt(pace) > 30)
        return { label: "Advanced", color: "bg-red-100 text-red-700" };
      if (pace && parseInt(pace) > 25)
        return {
          label: "Intermediate",
          color: "bg-yellow-100 text-yellow-700",
        };
      return { label: "Beginner", color: "bg-green-100 text-green-700" };
    }
    if (!difficulty)
      return { label: "All levels", color: "bg-gray-100 text-gray-700" };

    const level = difficulty.toLowerCase();
    if (level.includes("beginner") || level.includes("all"))
      return { label: difficulty, color: "bg-green-100 text-green-700" };
    if (level.includes("intermediate"))
      return { label: difficulty, color: "bg-yellow-100 text-yellow-700" };
    if (level.includes("advanced") || level.includes("expert"))
      return { label: difficulty, color: "bg-red-100 text-red-700" };
    return { label: difficulty, color: "bg-blue-100 text-blue-700" };
  };

  const difficultyBadge = getDifficultyBadge();

  return (
    <>
      <div
        className="min-w-72 w-72 border-2 border-explore-green rounded-lg p-4 flex-shrink-0 bg-white cursor-pointer hover:shadow-lg transition-shadow duration-200"
        onClick={handleCardClick}
      >
        {/* Header with title, save button, and difficulty badge */}
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-bold text-black font-cabin text-lg line-clamp-2 leading-tight flex-1 pr-2">
            {title}
          </h3>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleSaveClick}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title={
                isActivitySaved(
                  activityId ||
                    `${title}-${organizer}`.replace(/\s+/g, "-").toLowerCase(),
                )
                  ? "Unsave activity"
                  : "Save activity"
              }
            >
              <Bookmark
                className={`w-5 h-5 ${
                  isActivitySaved(
                    activityId ||
                      `${title}-${organizer}`
                        .replace(/\s+/g, "-")
                        .toLowerCase(),
                  )
                    ? "fill-explore-green text-explore-green"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              />
            </button>
            <span
              className={`text-xs px-3 py-1 rounded-full font-cabin font-medium ${difficultyBadge.color}`}
            >
              {difficultyBadge.label}
            </span>
          </div>
        </div>

        {/* Organizer info */}
        <div className="flex items-center gap-3 mb-4">
          <img
            src={imageSrc}
            alt="Organizer"
            className="w-12 h-12 rounded-full border border-black object-cover flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              if (organizer === "Coach Holly Peristiani") {
                navigate("/profile/coach-holly");
              }
            }}
          />
          <div className="flex-1 min-w-0">
            <div className="text-sm text-gray-600 font-cabin">
              By {organizer}
            </div>
          </div>
        </div>

        {/* Date and Location */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-black font-cabin">{date}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-black font-cabin">{location}</span>
          </div>
        </div>

        {/* Activity Metrics */}
        {type === "cycling" && (distance || pace || elevation) && (
          <div className="mb-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              {distance && (
                <div>
                  <div className="text-xs text-gray-500 font-cabin mb-1">
                    Distance
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-yellow-600">🚴</span>
                    <span className="text-sm font-medium text-black font-cabin">
                      {distance}
                    </span>
                  </div>
                </div>
              )}
              {pace && (
                <div>
                  <div className="text-xs text-gray-500 font-cabin mb-1">
                    Pace
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-yellow-500">⚡</span>
                    <span className="text-sm font-medium text-black font-cabin">
                      {pace}
                    </span>
                  </div>
                </div>
              )}
              {elevation && (
                <div>
                  <div className="text-xs text-gray-500 font-cabin mb-1">
                    Elevation
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-green-600">⛰️</span>
                    <span className="text-sm font-medium text-black font-cabin">
                      {elevation}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Request to join button */}
        <div className="w-full">
          <button
            onClick={handleRequestClick}
            className="w-full bg-explore-green text-white py-3 rounded-lg text-sm font-cabin font-medium hover:bg-explore-green-dark transition-colors"
          >
            Request to join
          </button>
        </div>
      </div>

      {/* Request Modal */}
      <RequestJoinModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        activityTitle={title}
        organizerName={organizer}
        organizerImage={imageSrc}
      />
    </>
  );
}
