import { Search, Menu, MapPin, ChevronDown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useActivities } from "../contexts/ActivitiesContext";
import FilterSystem, { FilterOptions } from "../components/FilterSystem";
import MapView from "../components/MapView";
import ActivityCard from "../components/ActivityCard";

export default function Index() {
  const { activities, searchActivities } = useActivities();

  const formatActivityDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredActivities, setFilteredActivities] = useState(activities);
  const [isSearching, setIsSearching] = useState(false);
  const [showMapView, setShowMapView] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    activityType: ["Cycling", "Climbing"],
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

  const applyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleActivitySelect = (activity: any) => {
    setShowMapView(false);
    // Navigate to activity details if needed
  };

  useEffect(() => {
    let filtered = activities;

    if (searchQuery.trim()) {
      filtered = searchActivities(searchQuery);
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }

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

    // Filter by club only
    if (filters.clubOnly) {
      // User is member of westway and oxford-cycling
      const userClubs = ["westway", "oxford-cycling"];
      filtered = filtered.filter(
        (activity) => activity.club && userClubs.includes(activity.club),
      );
    }

    setFilteredActivities(filtered);
  }, [searchQuery, activities, searchActivities, filters]);

  const handleSearchClick = () => {
    const searchInput = document.getElementById(
      "search-input",
    ) as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
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
      <div className="px-3 pb-20">
        {/* Header */}
        <div className="text-center py-4">
          <h1 className="text-3xl font-bold text-explore-green font-cabin">
            Explore!
          </h1>
        </div>

        {/* Location Selector */}
        <div className="flex items-center gap-2 mb-6">
          <MapPin className="w-6 h-6 text-black" />
          <div className="flex-1">
            <span className="text-xs text-black font-poppins">
              Chosen location
            </span>
            <span className="text-sm text-explore-text-light font-poppins ml-2">
              Notting hill, London
            </span>
          </div>
          <ChevronDown className="w-6 h-6 text-black" />
        </div>

        {/* Filter System */}
        <FilterSystem
          onFiltersChange={applyFilters}
          onShowMap={() => setShowMapView(true)}
          currentFilters={filters}
        />

        {/* Cycling-Focused Activities Section */}
        {!isSearching &&
        filters.activityType.length === 1 &&
        filters.activityType.includes("Cycling") ? (
          <CyclingExploreSection />
        ) : !isSearching &&
          filters.activityType.length === 1 &&
          filters.activityType.includes("Climbing") ? (
          <ClimbingExploreSection />
        ) : (
          /* Mixed Activities Section */
          <MixedActivitiesSection
            filters={filters}
            filteredActivities={filteredActivities}
            isSearching={isSearching}
            searchQuery={searchQuery}
            activities={activities}
            formatActivityDate={formatActivityDate}
          />
        )}

        {/* Partner Requests Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-black font-poppins">
              Partner requests
            </h2>
            <Link
              to="/activities"
              className="text-sm text-black underline font-poppins"
            >
              See all
            </Link>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <PartnerCard
              title="Looking for a belay partner..."
              date="📅 Friday evenings"
              location="📍 Westway"
              imageSrc="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
            />
            <PartnerCard
              title="Looking for a belay partner..."
              date="📅 Monday evenings"
              location="📍 The Castle"
              imageSrc="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
            />
          </div>
        </div>

        {/* My Clubs Section */}
        <div className="mb-6">
          <h2 className="text-base font-semibold text-black font-poppins mb-3">
            Your clubs & communities
          </h2>
          <div className="flex gap-4 justify-start">
            <ClubLogo
              src="https://cdn.builder.io/api/v1/image/assets%2Ff84d5d174b6b486a8c8b5017bb90c068%2F1e4beaadbd444b8497b8d2ef2ac43e70?format=webp&width=800"
              alt="Westway climbing gym"
              isMember={true}
              clubId="westway"
            />
            <ClubLogo
              src="https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=70&h=70&fit=crop"
              alt="Oxford university cycling club"
              isMember={true}
              clubId="oxford-cycling"
            />
          </div>
        </div>

        {/* Discover More Clubs Section */}
        <div className="mb-8">
          <h2 className="text-base font-semibold text-black font-poppins mb-3">
            Discover local clubs
          </h2>
          <div className="flex gap-4 justify-start flex-wrap">
            <ClubLogo
              src="https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=70&h=70&fit=crop"
              alt="Rapha Cycling Club London"
              isMember={false}
              clubId="rapha-cycling"
            />
            <ClubLogo
              src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=70&h=70&fit=crop"
              alt="VauxWall East Climbing Centre"
              isMember={false}
              clubId="vauxwall-climbing"
            />
            <ClubLogo
              src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=70&h=70&fit=crop"
              alt="Richmond Park Runners"
              isMember={false}
              clubId="richmond-runners"
            />
            <ClubLogo
              src="https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=70&h=70&fit=crop"
              alt="Thames Path Cyclists"
              isMember={false}
              clubId="thames-cyclists"
            />
          </div>
          <p className="text-xs text-gray-500 font-cabin mt-2">
            Request to join clubs to see their activities and events
          </p>
        </div>

        {/* Car Sharing Section */}
        <div className="mb-8">
          <h2 className="text-base font-semibold text-black font-poppins mb-3">
            Car sharing for trips
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <CarShareCard
              destination="Peak District"
              date="📅 2 February 2025"
              time="7:00 AM"
              driver="Mike Johnson"
              availableSeats={3}
              cost="£15 per person"
              imageSrc="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
            />
            <CarShareCard
              destination="Snowdonia"
              date="📅 9 February 2025"
              time="6:00 AM"
              driver="Sarah Chen"
              availableSeats={2}
              cost="£25 per person"
              imageSrc="https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face"
            />
            <CarShareCard
              destination="Brighton Beach"
              date="📅 15 February 2025"
              time="8:00 AM"
              driver="Alex Rodriguez"
              availableSeats={4}
              cost="£12 per person"
              imageSrc="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
            />
          </div>
          <p className="text-xs text-gray-500 font-cabin mt-2">
            Share transport costs and meet fellow adventurers
          </p>
        </div>
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

function MixedActivitiesSection({
  filters,
  filteredActivities,
  isSearching,
  searchQuery,
  activities,
  formatActivityDate,
}: {
  filters: any;
  filteredActivities: any[];
  isSearching: boolean;
  searchQuery: string;
  activities: any[];
  formatActivityDate: (dateStr: string) => string;
}) {
  // Mixed activities with alternating cycling and climbing
  const mixedActivities = [
    // Climbing activity
    {
      title: "Westway women's+ climbing morning",
      date: `📅 ${formatActivityDate("2025-01-26")}`,
      location: "📍 London, UK",
      imageSrc:
        "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=40&h=40&fit=crop&crop=face",
      type: "climbing",
      organizer: "Coach Holly Peristiani",
      difficulty: "Intermediate",
      isFirstCard: true,
    },
    // Cycling activity
    {
      title: "Sunday Morning Social Ride",
      date: `📅 ${formatActivityDate("2025-02-02")}`,
      location: "📍 Richmond Park, London",
      imageSrc:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      organizer: "Richmond Cycling Club",
      type: "cycling",
      distance: "25km",
      pace: "20 kph",
      elevation: "150m",
      difficulty: "Beginner",
    },
    // Climbing activity
    {
      title: "Sport climbing trip",
      date: `📅 ${formatActivityDate("2025-02-15")}`,
      location: "📍 Malham Cove, UK",
      imageSrc:
        "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=40&h=40&fit=crop&crop=face",
      type: "climbing",
      organizer: "Peak Adventures",
      difficulty: "Advanced",
    },
    // Cycling activity
    {
      title: "Intermediate Chaingang",
      date: `📅 ${formatActivityDate("2025-01-28")}`,
      location: "📍 Box Hill, Surrey",
      imageSrc:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      type: "cycling",
      organizer: "Surrey Road Cycling",
      distance: "40km",
      pace: "32 kph",
      elevation: "420m",
      difficulty: "Intermediate",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Recent Activities Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-black font-poppins">
            {isSearching
              ? `Search Results (${filteredActivities.length})`
              : "Recent activities nearby"}
          </h2>
          {!isSearching && (
            <Link
              to="/activities"
              className="text-sm text-black underline font-poppins"
            >
              See all
            </Link>
          )}
        </div>

        {/* No Activities Message */}
        {!isSearching && filteredActivities.length === 0 && (
          <div className="text-center py-4 text-gray-500 font-cabin">
            Change filters to see more activities...
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto pb-2">
          {/* Show mixed activities or search results */}
          {isSearching ? (
            filteredActivities.length === 0 ? (
              <div className="text-center py-8 text-gray-500 w-full">
                No activities found matching "{searchQuery}"
              </div>
            ) : (
              filteredActivities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  title={activity.title}
                  date={`📅 ${activity.date}`}
                  location={`����${activity.location}`}
                  imageSrc={
                    activity.imageSrc ||
                    "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=40&h=40&fit=crop&crop=face"
                  }
                  organizer={activity.organizer}
                  type={activity.type}
                  distance={activity.distance}
                  pace={activity.pace}
                  elevation={activity.elevation}
                  difficulty="Intermediate"
                  activityId={
                    activity.type === "cycling"
                      ? "sunday-morning-ride"
                      : "westway-womens-climb"
                  }
                />
              ))
            )
          ) : (
            <>
              {/* Mixed default activities */}
              {mixedActivities
                .filter((activity) =>
                  filters.activityType.some(
                    (type) =>
                      type.toLowerCase() === activity.type ||
                      (type === "Cycling" && activity.type === "cycling") ||
                      (type === "Climbing" && activity.type === "climbing") ||
                      (type === "Running" && activity.type === "running"),
                  ),
                )
                .map((activity, index) => (
                  <ActivityCard
                    key={index}
                    title={activity.title}
                    date={activity.date}
                    location={activity.location}
                    imageSrc={activity.imageSrc}
                    organizer={activity.organizer}
                    type={activity.type}
                    distance={activity.distance}
                    pace={activity.pace}
                    elevation={activity.elevation}
                    difficulty={activity.difficulty}
                    isFirstCard={activity.isFirstCard}
                    activityId={
                      activity.type === "climbing"
                        ? "westway-womens-climb"
                        : activity.type === "cycling"
                          ? "sunday-morning-ride"
                          : "westway-womens-climb"
                    }
                  />
                ))}

              {/* User created activities */}
              {activities.slice(0, 2).map((activity) => (
                <ActivityCard
                  key={activity.id}
                  title={activity.title}
                  date={`📅 ${formatActivityDate(activity.date)}`}
                  location={`📍 ${activity.location}`}
                  imageSrc={
                    activity.imageSrc ||
                    "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=40&h=40&fit=crop&crop=face"
                  }
                  organizer={activity.organizer}
                  type={activity.type}
                  distance={activity.distance}
                  pace={activity.pace}
                  elevation={activity.elevation}
                  difficulty="Intermediate"
                  activityId={
                    activity.type === "cycling"
                      ? "sunday-morning-ride"
                      : "westway-womens-climb"
                  }
                />
              ))}
            </>
          )}
        </div>
      </div>

      {/* Cycling Activities Section */}
      {!isSearching && filters.activityType.includes("Cycling") && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-black font-poppins">
              Cycling Activities
            </h2>
            <Link
              to="/activities?filter=cycling"
              className="text-sm text-black underline font-poppins"
            >
              See all
            </Link>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {mixedActivities
              .filter((activity) => activity.type === "cycling")
              .slice(0, 2)
              .map((activity, index) => (
                <ActivityCard
                  key={`cycling-${index}`}
                  title={activity.title}
                  date={activity.date}
                  location={activity.location}
                  imageSrc={activity.imageSrc}
                  organizer={activity.organizer}
                  type={activity.type}
                  distance={activity.distance}
                  pace={activity.pace}
                  elevation={activity.elevation}
                  difficulty={activity.difficulty}
                  activityId={
                    index === 0 ? "sunday-morning-ride" : "chaingang-training"
                  }
                />
              ))}
          </div>
        </div>
      )}

      {/* Climbing Activities Section */}
      {!isSearching && filters.activityType.includes("Climbing") && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-black font-poppins">
              Climbing Activities
            </h2>
            <Link
              to="/activities?filter=climbing"
              className="text-sm text-black underline font-poppins"
            >
              See all
            </Link>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {mixedActivities
              .filter((activity) => activity.type === "climbing")
              .slice(0, 2)
              .map((activity, index) => (
                <ActivityCard
                  key={`climbing-${index}`}
                  title={activity.title}
                  date={activity.date}
                  location={activity.location}
                  imageSrc={activity.imageSrc}
                  organizer={activity.organizer}
                  type={activity.type}
                  difficulty={activity.difficulty}
                  isFirstCard={activity.isFirstCard}
                  activityId={
                    index === 0 ? "westway-womens-climb" : "peak-district-climb"
                  }
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ClimbingExploreSection() {
  const partnerRequests = [
    {
      title: "Looking for belay partner",
      date: "📅 Tonight, 7:00 PM",
      location: "📍Westway Climbing Centre",
      organizer: "Sarah Chen",
      grade: "5.9 - 5.11a",
      discipline: "Top rope",
      level: "Intermediate",
      imageSrc:
        "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face",
    },
    {
      title: "Lead climbing session",
      date: "📅 Friday evenings",
      location: "📍The Castle Climbing Centre",
      organizer: "Alex Rodriguez",
      grade: "6a - 6c",
      discipline: "Lead climbing",
      level: "Advanced",
      imageSrc:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    },
  ];

  const gymActivities = [
    {
      title: "Women's+ Climbing Morning",
      date: "📅 Every Wednesday, 10:00 AM",
      location: "📍Westway Climbing Centre",
      organizer: "Coach Holly Peristiani",
      grade: "Competent top-rope climbers",
      discipline: "Top rope coaching",
      level: "All levels",
      fee: "Standard entry",
      imageSrc:
        "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=40&h=40&fit=crop&crop=face",
    },
    {
      title: "Bouldering Competition Training",
      date: "📅 Saturday, 2:00 PM",
      location: "📍The Arch Climbing Wall",
      organizer: "The Arch Coaching Team",
      grade: "V4 - V8",
      discipline: "Bouldering",
      level: "Advanced",
      equipment: "Shoes provided",
      imageSrc:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    },
    {
      title: "Youth Climbing Club",
      date: "📅 Saturday, 11:00 AM",
      location: "📍VauxWall East",
      organizer: "Youth Development Team",
      grade: "Beginner to 6a",
      discipline: "Multi-discipline",
      level: "Youth (8-16)",
      imageSrc:
        "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face",
    },
  ];

  const competitions = [
    {
      title: "London Bouldering League",
      date: "📅 Monthly, Next: July 20",
      location: "📍Various London gyms",
      organizer: "London Climbing Coalition",
      grade: "V0 - V12",
      discipline: "Bouldering competition",
      level: "All categories",
      prize: "Prizes & rankings",
      registration: "Open",
      imageSrc:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    },
    {
      title: "Lead Climbing Championships",
      date: "📅 Saturday, August 5, 9:00 AM",
      location: "📍Westway Climbing Centre",
      organizer: "British Mountaineering Council",
      grade: "5.10a - 5.13d",
      discipline: "Lead competition",
      level: "Regional qualifiers",
      registration: "Closes July 15",
      imageSrc:
        "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=40&h=40&fit=crop&crop=face",
    },
  ];

  const outdoorTrips = [
    {
      title: "Peak District Sport Climbing",
      date: "📅 Weekend, July 22-23",
      location: "📍Stanage Edge & Burbage",
      organizer: "Peak Adventures",
      grade: "E1 - E4 / 5.6 - 5.10",
      discipline: "Trad & Sport",
      level: "Experienced outdoor",
      accommodation: "Camping included",
      transport: "Minibus from London",
      imageSrc:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    },
    {
      title: "Multi-pitch Climbing Course",
      date: "📅 3 days, Aug 12-14",
      location: "📍Lake District",
      organizer: "Mountain Skills Academy",
      grade: "Multi-pitch routes",
      discipline: "Trad climbing",
      level: "Lead climbing experience required",
      certification: "RCI certification",
      imageSrc:
        "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=40&h=40&fit=crop&crop=face",
    },
    {
      title: "Portland Sport Trip",
      date: "📅 Long weekend, Sept 15-18",
      location: "📍Portland, Dorset",
      organizer: "South Coast Climbing",
      grade: "5.8 - 5.12",
      discipline: "Sport climbing",
      level: "Intermediate+",
      accommodation: "Shared cottages",
      imageSrc:
        "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Partner Requests Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-black font-poppins">
            Partner Requests
          </h2>
          <span className="text-sm text-gray-500 font-cabin">
            Find climbing partners
          </span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {partnerRequests.map((request, index) => (
            <ClimbingActivityCard key={index} activity={request} />
          ))}
        </div>
      </div>

      {/* Gym Activities Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-black font-poppins">
            Climbing Gym Activities
          </h2>
          <span className="text-sm text-gray-500 font-cabin">
            Sessions & coaching
          </span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {gymActivities.map((activity, index) => (
            <ClimbingActivityCard key={index} activity={activity} />
          ))}
        </div>
      </div>

      {/* Competitions Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-black font-poppins">
            Competitions
          </h2>
          <span className="text-sm text-gray-500 font-cabin">
            Events & contests
          </span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {competitions.map((comp, index) => (
            <ClimbingActivityCard key={index} activity={comp} />
          ))}
        </div>
      </div>

      {/* Outdoor Trips Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-black font-poppins">
            Climbing Trips
          </h2>
          <span className="text-sm text-gray-500 font-cabin">
            Outdoor adventures
          </span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {outdoorTrips.map((trip, index) => (
            <ClimbingActivityCard key={index} activity={trip} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ClimbingActivityCard({ activity }: { activity: any }) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    // Navigate to appropriate climbing activity based on type
    if (
      activity.title?.includes("Peak") ||
      activity.title?.includes("Sport") ||
      activity.title?.includes("Outdoor")
    ) {
      navigate("/activity/peak-district-climb");
    } else {
      navigate("/activity/westway-womens-climb");
    }
  };

  return (
    <div
      className="min-w-72 w-72 border-2 border-explore-green rounded-lg p-4 flex-shrink-0 bg-white cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-explore-green font-cabin text-base line-clamp-2 leading-tight flex-1 pr-2">
          {activity.title}
        </h3>
        <div className="flex-shrink-0">
          <span
            className={`text-xs px-2 py-1 rounded-full font-cabin font-medium ${
              activity.level === "Beginner" || activity.level === "All levels"
                ? "bg-green-100 text-green-700"
                : activity.level === "Intermediate" ||
                    activity.level === "Intermediate+"
                  ? "bg-yellow-100 text-yellow-700"
                  : activity.level === "Advanced" ||
                      activity.level === "Experienced outdoor"
                    ? "bg-red-100 text-red-700"
                    : activity.level === "Youth (8-16)"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-gray-100 text-gray-700"
            }`}
          >
            {activity.level}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex gap-3 mb-4">
        <img
          src={activity.imageSrc}
          alt="Organizer"
          className="w-12 h-12 rounded-full border border-black object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="text-xs text-gray-600 font-cabin mb-1 truncate">
            By {activity.organizer}
          </div>
          <div className="text-sm text-explore-green font-cabin mb-1 truncate">
            {activity.date}
          </div>
          <div className="text-sm text-explore-green font-cabin truncate">
            {activity.location}
          </div>
        </div>
      </div>

      {/* Climbing Details */}
      <div className="space-y-2 mb-4">
        <div className="grid grid-cols-2 gap-2 text-xs font-cabin">
          <div>
            <div className="text-gray-500">Grade/Difficulty</div>
            <div className="font-medium text-black">🧗 {activity.grade}</div>
          </div>
          <div>
            <div className="text-gray-500">Discipline</div>
            <div className="font-medium text-black">
              ⛰️ {activity.discipline}
            </div>
          </div>
        </div>

        {/* Additional Info */}
        {(activity.fee ||
          activity.equipment ||
          activity.prize ||
          activity.accommodation ||
          activity.transport ||
          activity.certification ||
          activity.registration) && (
          <div className="flex flex-wrap gap-1 mt-2">
            {activity.fee && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-cabin">
                💰 {activity.fee}
              </span>
            )}
            {activity.equipment && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-cabin">
                🥾 {activity.equipment}
              </span>
            )}
            {activity.prize && (
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded font-cabin">
                🏆 {activity.prize}
              </span>
            )}
            {activity.accommodation && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded font-cabin">
                🏕️ {activity.accommodation}
              </span>
            )}
            {activity.transport && (
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded font-cabin">
                🚐 {activity.transport}
              </span>
            )}
            {activity.certification && (
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded font-cabin">
                📜 {activity.certification}
              </span>
            )}
            {activity.registration && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-cabin">
                📝 {activity.registration}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          alert(`Request to join ${activity.title}`);
        }}
        className="w-full bg-explore-green text-white py-3 rounded-lg text-sm font-cabin font-medium hover:bg-explore-green-dark transition-colors"
      >
        Request to join
      </button>
    </div>
  );
}

function CyclingExploreSection() {
  const groupRides = [
    {
      title: "Sunday Morning Social Ride",
      date: "📅 Sunday, 8:00 AM",
      location: "📍Richmond Park, London",
      organizer: "Richmond Cycling Club",
      distance: "25km",
      pace: "20 kph",
      elevation: "150m",
      difficulty: "Beginner",
      imageSrc:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    },
    {
      title: "Intermediate Chaingang",
      date: "📅 Tuesday, 6:30 PM",
      location: "📍Box Hill, Surrey",
      organizer: "Surrey Road Cycling",
      distance: "40km",
      pace: "32 kph",
      elevation: "420m",
      difficulty: "Intermediate",
      imageSrc:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    },
  ];

  const sportives = [
    {
      title: "London to Brighton Challenge",
      date: "📅 Saturday, 7:00 AM",
      location: "📍Clapham Common, London",
      organizer: "British Heart Foundation",
      distance: "54 miles",
      pace: "Self-paced",
      elevation: "900m",
      difficulty: "Challenge",
      fee: "£45",
      imageSrc:
        "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face",
    },
    {
      title: "Cotswolds Century",
      date: "📅 Sunday, 8:00 AM",
      location: "📍Chipping Campden",
      organizer: "Sportive Series",
      distance: "100 miles",
      pace: "Self-paced",
      elevation: "1850m",
      difficulty: "Epic",
      fee: "£38",
      imageSrc:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    },
  ];

  const bikepacking = [
    {
      title: "South Downs Way Bikepacking",
      date: "📅 Fri-Sun, July 15-17",
      location: "📍Winchester to Eastbourne",
      organizer: "Adventure Cycling UK",
      distance: "160km over 3 days",
      pace: "Touring pace",
      elevation: "2100m total",
      difficulty: "Multi-day",
      gear: "Camping required",
      imageSrc:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    },
  ];

  const training = [
    {
      title: "Hill Climbing Intervals",
      date: "📅 Thursday, 6:00 PM",
      location: "📍Leith Hill, Surrey",
      organizer: "Watts Cycling Club",
      distance: "35km",
      pace: "Interval training",
      elevation: "650m",
      difficulty: "Advanced",
      focus: "Power & climbing",
      imageSrc:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Group Rides Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-black font-poppins">
            Group Rides
          </h2>
          <span className="text-sm text-gray-500 font-cabin">
            Social & Club rides
          </span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {groupRides.map((ride, index) => (
            <CyclingActivityCard key={index} activity={ride} />
          ))}
        </div>
      </div>

      {/* Sportives Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-black font-poppins">
            Sportives & Events
          </h2>
          <span className="text-sm text-gray-500 font-cabin">
            Organized events
          </span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {sportives.map((event, index) => (
            <CyclingActivityCard key={index} activity={event} />
          ))}
        </div>
      </div>

      {/* Bikepacking Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-black font-poppins">
            Bikepacking Adventures
          </h2>
          <span className="text-sm text-gray-500 font-cabin">
            Multi-day tours
          </span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {bikepacking.map((adventure, index) => (
            <CyclingActivityCard key={index} activity={adventure} />
          ))}
        </div>
      </div>

      {/* Training Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-black font-poppins">
            Training Sessions
          </h2>
          <span className="text-sm text-gray-500 font-cabin">
            Structured workouts
          </span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {training.map((session, index) => (
            <CyclingActivityCard key={index} activity={session} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CyclingActivityCard({ activity }: { activity: any }) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    // Navigate to appropriate cycling activity based on type
    if (
      activity.title?.includes("Chaingang") ||
      activity.title?.includes("Training") ||
      activity.title?.includes("Hill")
    ) {
      navigate("/activity/chaingang-training");
    } else {
      navigate("/activity/sunday-morning-ride");
    }
  };

  return (
    <div
      className="min-w-72 w-72 border-2 border-explore-green rounded-lg p-4 flex-shrink-0 bg-white cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-explore-green font-cabin text-base line-clamp-2 leading-tight flex-1 pr-2">
          {activity.title}
        </h3>
        <div className="flex-shrink-0">
          <span
            className={`text-xs px-2 py-1 rounded-full font-cabin font-medium ${
              activity.difficulty === "Beginner"
                ? "bg-green-100 text-green-700"
                : activity.difficulty === "Intermediate"
                  ? "bg-yellow-100 text-yellow-700"
                  : activity.difficulty === "Advanced"
                    ? "bg-red-100 text-red-700"
                    : activity.difficulty === "Epic"
                      ? "bg-purple-100 text-purple-700"
                      : activity.difficulty === "Challenge"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
            }`}
          >
            {activity.difficulty}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex gap-3 mb-4">
        <img
          src={activity.imageSrc}
          alt="Organizer"
          className="w-12 h-12 rounded-full border border-black object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="text-xs text-gray-600 font-cabin mb-1 truncate">
            By {activity.organizer}
          </div>
          <div className="text-sm text-explore-green font-cabin mb-1 truncate">
            {activity.date}
          </div>
          <div className="text-sm text-explore-green font-cabin truncate">
            {activity.location}
          </div>
        </div>
      </div>

      {/* Cycling Details */}
      <div className="space-y-2 mb-4">
        <div className="grid grid-cols-3 gap-2 text-xs font-cabin">
          <div className="text-center">
            <div className="text-gray-500">Distance</div>
            <div className="font-medium text-black">🚴 {activity.distance}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-500">Pace</div>
            <div className="font-medium text-black">⚡ {activity.pace}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-500">Elevation</div>
            <div className="font-medium text-black">
              ⛰️ {activity.elevation}
            </div>
          </div>
        </div>

        {/* Additional Info */}
        {(activity.fee || activity.gear || activity.focus) && (
          <div className="flex flex-wrap gap-1 mt-2">
            {activity.fee && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-cabin">
                💰 {activity.fee}
              </span>
            )}
            {activity.gear && (
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded font-cabin">
                ��� {activity.gear}
              </span>
            )}
            {activity.focus && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-cabin">
                🎯 {activity.focus}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          alert(`Request to join ${activity.title}`);
        }}
        className="w-full bg-explore-green text-white py-3 rounded-lg text-sm font-cabin font-medium hover:bg-explore-green-dark transition-colors"
      >
        Request to join
      </button>
    </div>
  );
}

function ActivityCard({
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
}: {
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
}) {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (activityId) {
      navigate(`/activity/${activityId}`);
    } else {
      // For default activities without specific IDs, navigate to westway-womens-climb as example
      navigate("/activity/westway-womens-climb");
    }
  };

  const handleRequestClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setShowRequestModal(true);
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
    <div
      className="min-w-72 w-72 border-2 border-explore-green rounded-lg p-4 flex-shrink-0 bg-white cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={handleCardClick}
    >
      {/* Header with title and difficulty badge */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-bold text-black font-cabin text-lg line-clamp-2 leading-tight flex-1 pr-2">
          {title}
        </h3>
        <span
          className={`text-xs px-3 py-1 rounded-full font-cabin font-medium flex-shrink-0 ${difficultyBadge.color}`}
        >
          {difficultyBadge.label}
        </span>
      </div>

      {/* Organizer info */}
      <div className="flex items-center gap-3 mb-4">
        <img
          src={imageSrc}
          alt="Organizer"
          className="w-12 h-12 rounded-full border border-black object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="text-sm text-gray-600 font-cabin">By {organizer}</div>
        </div>
      </div>

      {/* Date and Location */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-orange-500 text-base">📅</span>
          <span className="text-sm text-black font-cabin">
            {date.replace("��� ", "")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-red-500 text-base">📍</span>
          <span className="text-sm text-black font-cabin">
            {location.replace("📍", "")}
          </span>
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
        {isFirstCard ? (
          <button
            onClick={handleRequestClick}
            className="w-full bg-explore-green text-white py-3 rounded-lg text-sm font-cabin font-medium hover:bg-explore-green-dark transition-colors"
          >
            Request to join
          </button>
        ) : (
          <button
            onClick={handleRequestClick}
            className="w-full bg-explore-green text-white py-3 rounded-lg text-sm font-cabin font-medium hover:bg-explore-green-dark transition-colors"
          >
            Request to join
          </button>
        )}
      </div>
    </div>
  );
}

function PartnerCard({
  title,
  date,
  location,
  imageSrc,
}: {
  title: string;
  date: string;
  location: string;
  imageSrc: string;
}) {
  return (
    <div className="min-w-60 w-60 h-32 border-2 border-explore-green rounded-lg p-3 flex-shrink-0 bg-white">
      <h3 className="font-bold text-explore-green font-cabin text-base mb-2">
        {title}
      </h3>
      <div className="flex items-start gap-3">
        <img
          src={imageSrc}
          alt="Profile"
          className="w-10 h-10 rounded-full border border-black object-cover"
        />
        <div className="flex-1">
          <div className="text-sm text-explore-green font-cabin mb-1">
            {date}
          </div>
          <div className="text-sm text-explore-green font-cabin">
            {location}
          </div>
        </div>
        <button className="bg-explore-green text-white px-3 py-2 rounded-lg text-sm font-cabin">
          Request to join
        </button>
      </div>
    </div>
  );
}

function ClubLogo({
  src,
  alt,
  isMember,
  clubId,
}: {
  src: string;
  alt: string;
  isMember: boolean;
  clubId: string;
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (isMember) {
      navigate(`/club/${clubId}`);
    } else {
      // For non-member clubs, navigate to club detail page
      navigate(`/club/${clubId}`);
    }
  };

  return (
    <div
      className={`relative w-16 h-16 rounded-full border-2 overflow-hidden cursor-pointer transition-all duration-200 hover:scale-105 ${
        isMember
          ? "border-explore-green shadow-lg"
          : "border-gray-300 hover:border-explore-green"
      }`}
      onClick={handleClick}
    >
      <img src={src} alt={alt} className="w-full h-full object-cover" />
      {isMember && (
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-explore-green rounded-full flex items-center justify-center">
          <span className="text-white text-xs">✓</span>
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
            d="M31.4958 7.46836L21.4451 1.22114C18.7055 -0.484058 14.5003 -0.391047 11.8655 1.42266L3.12341 7.48386C1.37849 8.693 0 11.1733 0 13.1264V23.8227C0 27.7756 3.61199 31 8.06155 31H26.8718C31.3213 31 34.9333 27.7911 34.9333 23.8382V13.328C34.9333 11.2353 33.4152 8.662 31.4958 7.46836ZM18.7753 24.7993C18.7753 25.4349 18.1821 25.9619 17.4666 25.9619C16.7512 25.9619 16.1579 25.4349 16.1579 24.7993V20.1487C16.1579 19.5132 16.7512 18.9861 17.4666 18.9861C18.1821 18.9861 18.7753 20.1487V24.7993Z"
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

function CarShareCard({
  destination,
  date,
  time,
  driver,
  availableSeats,
  cost,
  imageSrc,
}: {
  destination: string;
  date: string;
  time: string;
  driver: string;
  availableSeats: number;
  cost: string;
  imageSrc: string;
}) {
  return (
    <div className="min-w-72 w-72 border-2 border-blue-300 rounded-lg p-4 flex-shrink-0 bg-blue-50 cursor-pointer hover:shadow-lg transition-shadow duration-200">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-blue-800 font-cabin text-lg line-clamp-2 leading-tight flex-1 pr-2">
          🚗 {destination}
        </h3>
        <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full font-cabin font-medium">
          {availableSeats} seats
        </span>
      </div>

      {/* Driver info */}
      <div className="flex items-center gap-3 mb-4">
        <img
          src={imageSrc}
          alt={driver}
          className="w-10 h-10 rounded-full border border-blue-600 object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="text-sm text-blue-700 font-cabin font-medium">
            Driver: {driver}
          </div>
        </div>
      </div>

      {/* Trip details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-blue-800 font-cabin">{date}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-blue-800 font-cabin">
            🕐 Departure: {time}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-blue-800 font-cabin font-medium">
            💰 {cost}
          </span>
        </div>
      </div>

      {/* Request button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          alert(`Request seat for ${destination} trip`);
        }}
        className="w-full bg-blue-600 text-white py-3 rounded-lg text-sm font-cabin font-medium hover:bg-blue-700 transition-colors"
      >
        Request seat
      </button>
    </div>
  );
}
