import { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import {
  MapPin,
  Clock,
  AlertTriangle,
  Info,
  X,
  Calendar,
  Users,
  Target,
  Trophy,
  Bookmark,
} from "lucide-react";
import { useChat } from "../contexts/ChatContext";
import { useSavedActivities } from "../contexts/SavedActivitiesContext";

// Activity data structure
const activitiesData = {
  "westway-womens-climb": {
    id: "westway-womens-climb",
    type: "climbing",
    title: "Westway women's+ climbing morning",
    organizer: {
      name: "Coach Holly Peristiani",
      image:
        "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=80&h=80&fit=crop&crop=face",
    },
    description:
      "This session is perfect for meeting fellow climbers and boosting your confidence. Holly can provide expert tips on top-roping, lead climbing, abseiling, fall practice and more. Standard entry fees apply.",
    location: "Westway Climbing Centre",
    schedule: "Every Wednesday, 10:00-12:00 AM",
    difficulty: "Intermediate",
    requirements: {
      title: "competent top-rope climbers",
      details: [
        "Tie into a harness using a figure-eight knot",
        "Belay using an appropriate device (e.g. GriGri, ATC)",
        "Perform safety checks and communicate clearly",
        "Catch falls and lower a partner safely",
      ],
      warning:
        "If you're unsure about any of the above, please check with a coach or ask in advance. This ensures a safe and enjoyable session for everyone.",
    },
    tags: ["Top rope", "Lead climbing", "Coaching", "Women's+"],
    capacity: 12,
    currentParticipants: 8,
    fee: "Standard entry",
  },
  "sunday-morning-ride": {
    id: "sunday-morning-ride",
    type: "cycling",
    title: "Sunday Morning Social Ride",
    organizer: {
      name: "Richmond Cycling Club",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    },
    description:
      "Join us for a friendly social ride through Richmond Park and surrounding areas. Perfect for cyclists looking to meet new people and explore beautiful routes. Coffee stop included at Roehampton Cafe.",
    location: "Richmond Park Main Gate",
    schedule: "Sunday, 8:00 AM",
    difficulty: "Beginner",
    distance: "25km",
    pace: "20 kph",
    elevation: "150m",
    requirements: {
      title: "road bike and helmet required",
      details: [
        "Road bike in good working condition",
        "Helmet mandatory for all participants",
        "Basic bike maintenance knowledge helpful",
        "Ability to ride 25km at moderate pace",
      ],
      warning:
        "Please ensure your bike is roadworthy and bring a spare tube and basic tools.",
    },
    tags: ["Social", "Coffee stop", "Scenic route", "All levels"],
    capacity: 15,
    currentParticipants: 12,
    route: "Richmond Park → Kingston → Roehampton",
    cafeStop: "Roehampton Cafe",
  },
  "peak-district-climb": {
    id: "peak-district-climb",
    type: "climbing",
    title: "Peak District Sport Climbing",
    organizer: {
      name: "Peak Adventures",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    },
    description:
      "Weekend climbing adventure in the Peak District. We'll tackle some classic sport routes at Stanage Edge and Burbage. Perfect for those looking to transition from indoor to outdoor climbing or improve their outdoor skills.",
    location: "Stanage Edge & Burbage",
    schedule: "Weekend, July 22-23",
    difficulty: "Advanced",
    requirements: {
      title: "experienced indoor climbers",
      details: [
        "Comfortable leading 6a+ routes indoors",
        "Basic outdoor climbing experience preferred",
        "Own climbing shoes and harness",
        "Comfortable with multi-pitch belaying",
      ],
      warning:
        "Outdoor climbing involves additional risks. Weather conditions may affect the trip.",
    },
    tags: ["Outdoor", "Sport climbing", "Weekend trip", "Camping"],
    capacity: 8,
    currentParticipants: 6,
    accommodation: "Camping included",
    transport: "Minibus from London",
    gradeRange: "E1 - E4 / 5.6 - 5.10",
  },
  "chaingang-training": {
    id: "chaingang-training",
    type: "cycling",
    title: "Intermediate Chaingang",
    organizer: {
      name: "Surrey Road Cycling",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    },
    description:
      "High-intensity training session for intermediate to advanced cyclists. We'll focus on paceline skills, hill repeats, and interval training. This is a structured workout designed to improve your cycling performance.",
    location: "Box Hill, Surrey",
    schedule: "Tuesday, 6:30 PM",
    difficulty: "Intermediate",
    distance: "40km",
    pace: "32 kph",
    elevation: "420m",
    requirements: {
      title: "intermediate cycling experience",
      details: [
        "Comfortable maintaining 30+ kph on flats",
        "Experience riding in groups",
        "Good bike handling skills",
        "Able to ride for 1.5+ hours continuously",
      ],
      warning:
        "This is a demanding training session. Please ensure you're adequately fit and experienced.",
    },
    tags: ["Training", "High intensity", "Group riding", "Hill climbs"],
    capacity: 12,
    currentParticipants: 9,
    trainingFocus: "Power & climbing",
  },
};

export default function ActivityDetails() {
  const navigate = useNavigate();
  const { activityId } = useParams();
  const { addJoinRequest } = useChat();
  const { saveActivity, unsaveActivity, isActivitySaved } =
    useSavedActivities();
  const [agreedToRequirements, setAgreedToRequirements] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);

  // Get activity data based on ID
  const activity = activityId
    ? activitiesData[activityId as keyof typeof activitiesData]
    : null;

  useEffect(() => {
    if (!activity) {
      navigate("/explore");
    }
  }, [activity, navigate]);

  if (!activity) {
    return null;
  }

  const handleRequestToJoin = () => {
    if (agreedToRequirements) {
      setShowRequestModal(true);
    }
  };

  const handleSendRequest = () => {
    addJoinRequest({
      activityTitle: activity.title,
      activityOrganizer: activity.organizer.name,
      requesterName: "You",
      message: requestMessage || "Hi! I'd like to join this activity.",
    });

    setShowRequestModal(false);
    setRequestMessage("");
    alert("Request sent! You can check your message in the Chat page.");
    navigate("/chat");
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
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

  const handleSaveActivity = () => {
    if (!activity) return;

    // Create a simplified activity object for saving
    const activityToSave = {
      id: activity.id,
      title: activity.title,
      type: activity.type,
      date: "2025-01-26", // Use the activity schedule as date
      time: "10:00", // Extract time from schedule
      location: activity.location,
      organizer: activity.organizer.name,
      difficulty: activity.difficulty,
      maxParticipants: activity.capacity.toString(),
      imageSrc: activity.organizer.image,
      specialComments: "",
      gender: "All genders",
      visibility: "All",
      createdAt: new Date(),
    };

    if (isActivitySaved(activity.id)) {
      unsaveActivity(activity.id);
    } else {
      saveActivity(activityToSave);
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

      {/* Main Content */}
      <div className="px-6 pb-24">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mt-4 mb-4 text-explore-green font-cabin"
        >
          ← Back to activities
        </button>

        {/* Title and Difficulty */}
        <div className="mb-6">
          <div className="flex justify-between items-start mb-3">
            <h1 className="text-2xl font-bold text-explore-green font-cabin leading-tight flex-1 pr-4">
              {activity.title}
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveActivity}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title={
                  isActivitySaved(activity.id)
                    ? "Unsave activity"
                    : "Save activity"
                }
              >
                <Bookmark
                  className={`w-6 h-6 ${
                    isActivitySaved(activity.id)
                      ? "fill-explore-green text-explore-green"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                />
              </button>
              <span
                className={`text-sm px-3 py-1 rounded-full font-cabin font-medium ${getDifficultyColor(activity.difficulty)}`}
              >
                {activity.difficulty}
              </span>
            </div>
          </div>
        </div>

        {/* Organizer Section */}
        <div
          className="flex items-center gap-3 mb-6 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
          onClick={() => {
            if (activity.organizer.name === "Coach Holly Peristiani") {
              navigate("/profile/coach-holly");
            }
          }}
        >
          <img
            src={activity.organizer.image}
            alt={activity.organizer.name}
            className="w-12 h-12 rounded-full border border-black object-cover"
          />
          <div>
            <h2 className="text-lg font-bold text-black font-cabin">
              {activity.organizer.name}
            </h2>
            {activity.organizer.name === "Coach Holly Peristiani" && (
              <p className="text-xs text-gray-500 font-cabin">
                Click to view profile
              </p>
            )}
          </div>
        </div>

        {/* Description Section */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-black font-cabin mb-3">
            Description
          </h3>
          <p className="text-sm text-black font-cabin leading-relaxed">
            {activity.description}
          </p>
        </div>

        {/* Activity Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Location */}
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-1">
              <MapPin className="w-5 h-5 text-red-500" />
              <h3 className="text-xl font-bold text-black font-cabin">
                Location
              </h3>
            </div>
            <p className="text-sm text-gray-600 font-cabin ml-8">
              {activity.location}
            </p>
          </div>

          {/* Time */}
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-1">
              <Clock className="w-5 h-5 text-gray-400" />
              <h3 className="text-xl font-bold text-black font-cabin">Time</h3>
            </div>
            <p className="text-sm text-black font-cabin ml-8">
              {activity.schedule}
            </p>
          </div>

          {/* Capacity */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-blue-500" />
              <h4 className="text-lg font-bold text-black font-cabin">
                Capacity
              </h4>
            </div>
            <p className="text-sm text-black font-cabin ml-6">
              {activity.currentParticipants}/{activity.capacity} joined
            </p>
          </div>

          {/* Activity-specific details */}
          {activity.type === "cycling" && (
            <>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-green-500" />
                  <h4 className="text-lg font-bold text-black font-cabin">
                    Distance
                  </h4>
                </div>
                <p className="text-sm text-black font-cabin ml-6">
                  {activity.distance}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-yellow-500">⚡</span>
                  <h4 className="text-lg font-bold text-black font-cabin">
                    Pace
                  </h4>
                </div>
                <p className="text-sm text-black font-cabin ml-6">
                  {activity.pace}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-green-600">⛰️</span>
                  <h4 className="text-lg font-bold text-black font-cabin">
                    Elevation
                  </h4>
                </div>
                <p className="text-sm text-black font-cabin ml-6">
                  {activity.elevation}
                </p>
              </div>
            </>
          )}

          {activity.type === "climbing" && activity.gradeRange && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-4 h-4 text-purple-500" />
                <h4 className="text-lg font-bold text-black font-cabin">
                  Grade Range
                </h4>
              </div>
              <p className="text-sm text-black font-cabin ml-6">
                {activity.gradeRange}
              </p>
            </div>
          )}
        </div>

        {/* Additional Info */}
        {(activity.fee ||
          activity.accommodation ||
          activity.transport ||
          activity.cafeStop ||
          activity.route ||
          activity.trainingFocus) && (
          <div className="mb-6">
            <h3 className="text-xl font-bold text-black font-cabin mb-3">
              Additional Information
            </h3>
            <div className="space-y-2">
              {activity.fee && (
                <div className="flex items-center gap-2">
                  <span className="text-green-600">💰</span>
                  <span className="text-sm font-cabin">
                    Fee: {activity.fee}
                  </span>
                </div>
              )}
              {activity.accommodation && (
                <div className="flex items-center gap-2">
                  <span className="text-purple-600">🏕️</span>
                  <span className="text-sm font-cabin">
                    Accommodation: {activity.accommodation}
                  </span>
                </div>
              )}
              {activity.transport && (
                <div className="flex items-center gap-2">
                  <span className="text-orange-600">🚐</span>
                  <span className="text-sm font-cabin">
                    Transport: {activity.transport}
                  </span>
                </div>
              )}
              {activity.cafeStop && (
                <div className="flex items-center gap-2">
                  <span className="text-brown-600">☕</span>
                  <span className="text-sm font-cabin">
                    Cafe stop: {activity.cafeStop}
                  </span>
                </div>
              )}
              {activity.route && (
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">🗺️</span>
                  <span className="text-sm font-cabin">
                    Route: {activity.route}
                  </span>
                </div>
              )}
              {activity.trainingFocus && (
                <div className="flex items-center gap-2">
                  <span className="text-red-600">🎯</span>
                  <span className="text-sm font-cabin">
                    Focus: {activity.trainingFocus}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tags */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-black font-cabin mb-3">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {activity.tags.map((tag, index) => (
              <span
                key={index}
                className="text-xs bg-explore-green bg-opacity-10 text-explore-green px-3 py-1 rounded-full font-cabin"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Requirements Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <h3 className="text-xl font-bold text-black font-cabin">
              Requirements
            </h3>
          </div>
          <div className="ml-8 relative">
            <p className="text-sm text-black font-cabin mb-6">
              Participants must be{" "}
              <span
                className="underline cursor-pointer"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                {activity.requirements.title}
              </span>{" "}
              <Info className="inline w-4 h-4 text-gray-400" />.
            </p>

            {/* Tooltip positioned outside the paragraph */}
            {showTooltip && (
              <div className="absolute left-0 top-16 bg-explore-green text-white p-4 rounded-lg shadow-lg z-50 w-80 text-sm font-cabin">
                <div className="font-bold text-base mb-2">
                  Requirements Details
                </div>
                <div className="mb-2">
                  To join this session, you should be able to:
                </div>
                <ul className="space-y-1 mb-3">
                  {activity.requirements.details.map((detail, index) => (
                    <li key={index}>• {detail}</li>
                  ))}
                </ul>
                <div className="flex items-start gap-2 bg-yellow-500 bg-opacity-20 p-2 rounded">
                  <span className="text-yellow-300 font-bold">⚠</span>
                  <div className="text-sm">{activity.requirements.warning}</div>
                </div>
              </div>
            )}

            {/* Checkbox */}
            <div className="flex items-start gap-3 mb-8">
              <input
                type="checkbox"
                id="requirements-agreement"
                checked={agreedToRequirements}
                onChange={(e) => setAgreedToRequirements(e.target.checked)}
                className="w-4 h-4 mt-0.5 border-2 border-gray-300 rounded"
              />
              <label
                htmlFor="requirements-agreement"
                className="text-sm text-black font-cabin cursor-pointer"
              >
                I agree I adhere to the requirements{" "}
                <Info className="inline w-4 h-4 text-gray-400" />
              </label>
            </div>
          </div>
        </div>

        {/* Request to Join Button */}
        <button
          onClick={handleRequestToJoin}
          disabled={!agreedToRequirements}
          className={`w-full py-3 rounded-lg text-lg font-cabin font-medium transition-colors ${
            agreedToRequirements
              ? "bg-explore-green text-white hover:bg-explore-green-light"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Request to join
        </button>
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-explore-green font-cabin">
                Send Request
              </h3>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 font-cabin mb-3">
                Send a message to {activity.organizer.name} (optional):
              </p>
              <textarea
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder="Hi! I'd like to join this activity..."
                className="w-full border-2 border-gray-300 rounded-lg py-3 px-4 font-cabin h-24 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRequestModal(false)}
                className="flex-1 py-3 border-2 border-gray-300 rounded-lg text-gray-600 font-cabin font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSendRequest}
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
