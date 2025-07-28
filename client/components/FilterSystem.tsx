import { useState } from "react";
import { X, ChevronDown, MapPin, Calendar, Users, Filter } from "lucide-react";

export interface FilterOptions {
  activityType: string[];
  numberOfPeople: { min: number; max: number };
  location: string;
  date: { start: string; end: string };
  gender: string[];
  age: { min: number; max: number };
  gear: string[];
  pace: { min: number; max: number };
  distance: { min: number; max: number };
  elevation: { min: number; max: number };
  clubOnly: boolean;
}

interface FilterSystemProps {
  onFiltersChange: (filters: FilterOptions) => void;
  onShowMap: () => void;
  currentFilters: FilterOptions;
}

export default function FilterSystem({
  onFiltersChange,
  onShowMap,
  currentFilters,
}: FilterSystemProps) {
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>(currentFilters);

  const activityTypes = [
    "Cycling",
    "Climbing",
    "Running",
    "Hiking",
    "Skiing",
    "Surfing",
    "Tennis",
    "Swimming",
    "Yoga",
  ];
  const genderOptions = ["All genders", "Female only", "Male only", "Mixed"];
  const gearOptions = [
    "Own gear required",
    "Gear provided",
    "Rental available",
    "No gear needed",
  ];

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    const updatedFilters = { ...filters, [key]: value };
    setFilters(updatedFilters);
  };

  const applyFilters = () => {
    onFiltersChange(filters);
    setShowFilterModal(false);
  };

  const clearAllFilters = () => {
    const clearedFilters: FilterOptions = {
      activityType: ["Cycling", "Climbing"], // Keep default activity types
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
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.activityType.length > 0) count++;
    if (filters.location) count++;
    if (filters.date.start || filters.date.end) count++;
    if (filters.gender.length > 0) count++;
    if (filters.gear.length > 0) count++;
    if (filters.clubOnly) count++;
    return count;
  };

  return (
    <>
      {/* Filter Bar */}
      <div className="flex gap-3 mb-6">
        {/* Search Bar */}
        <div className="flex-1 relative">
          <div className="bg-white border-2 border-black rounded-full h-12 flex items-center px-4">
            <svg
              className="w-5 h-5 text-black mr-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search activities..."
              className="flex-1 bg-transparent text-black font-cabin focus:outline-none"
              onChange={(e) => {
                // For now, we'll implement this later
                console.log("Search:", e.target.value);
              }}
            />
          </div>
        </div>

        {/* Filter Button */}
        <button
          onClick={() => setShowFilterModal(true)}
          className="bg-gray-200 rounded-full px-4 h-12 flex items-center gap-2 relative"
        >
          <Filter className="w-5 h-5 text-black" />
          <span className="text-black text-base font-cabin">Filter</span>
          {getActiveFilterCount() > 0 && (
            <div className="absolute -top-1 -right-1 bg-explore-green text-white rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold">
              {getActiveFilterCount()}
            </div>
          )}
        </button>

        {/* Map Button */}
        <button
          onClick={onShowMap}
          className="bg-explore-green text-white rounded-full px-4 h-12 flex items-center gap-2"
        >
          <MapPin className="w-5 h-5" />
          <span className="text-base font-cabin">Map</span>
        </button>
      </div>

      {/* Active Filter Chips */}
      {getActiveFilterCount() > 0 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {filters.activityType.map((type) => (
            <div
              key={type}
              className="flex items-center gap-1 bg-explore-green text-white px-3 py-1 rounded-full text-sm font-cabin whitespace-nowrap"
            >
              {type}
              <button
                onClick={() =>
                  updateFilter(
                    "activityType",
                    filters.activityType.filter((t) => t !== type),
                  )
                }
                className="ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          {filters.location && (
            <div className="flex items-center gap-1 bg-explore-green text-white px-3 py-1 rounded-full text-sm font-cabin whitespace-nowrap">
              📍 {filters.location}
              <button onClick={() => updateFilter("location", "")}>
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {filters.clubOnly && (
            <div className="flex items-center gap-1 bg-explore-green text-white px-3 py-1 rounded-full text-sm font-cabin whitespace-nowrap">
              🏛️ Club only
              <button onClick={() => updateFilter("clubOnly", false)}>
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <button
            onClick={clearAllFilters}
            className="text-explore-green text-sm font-cabin underline whitespace-nowrap"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-explore-green font-cabin">
                Filters
              </h3>
              <button
                onClick={() => setShowFilterModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 space-y-6">
              {/* Activity Type */}
              <div>
                <h4 className="font-bold text-black font-cabin mb-3">
                  Activity Type *
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {activityTypes.map((type) => (
                    <label
                      key={type}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.activityType.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateFilter("activityType", [
                              ...filters.activityType,
                              type,
                            ]);
                          } else {
                            updateFilter(
                              "activityType",
                              filters.activityType.filter((t) => t !== type),
                            );
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-cabin">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Number of People */}
              <div>
                <h4 className="font-bold text-black font-cabin mb-3">
                  Number of People
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-cabin text-gray-600">
                      Min
                    </label>
                    <input
                      type="number"
                      value={filters.numberOfPeople.min}
                      onChange={(e) =>
                        updateFilter("numberOfPeople", {
                          ...filters.numberOfPeople,
                          min: parseInt(e.target.value) || 1,
                        })
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-cabin text-gray-600">
                      Max
                    </label>
                    <input
                      type="number"
                      value={filters.numberOfPeople.max}
                      onChange={(e) =>
                        updateFilter("numberOfPeople", {
                          ...filters.numberOfPeople,
                          max: parseInt(e.target.value) || 50,
                        })
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      min="1"
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <h4 className="font-bold text-black font-cabin mb-3">
                  Location
                </h4>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => updateFilter("location", e.target.value)}
                  placeholder="Enter location or area"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>

              {/* Date Range */}
              <div>
                <h4 className="font-bold text-black font-cabin mb-3">
                  Date Range
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-cabin text-gray-600">
                      From
                    </label>
                    <input
                      type="date"
                      value={filters.date.start}
                      onChange={(e) =>
                        updateFilter("date", {
                          ...filters.date,
                          start: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-cabin text-gray-600">
                      To
                    </label>
                    <input
                      type="date"
                      value={filters.date.end}
                      onChange={(e) =>
                        updateFilter("date", {
                          ...filters.date,
                          end: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Gender */}
              <div>
                <h4 className="font-bold text-black font-cabin mb-3">Gender</h4>
                <div className="space-y-2">
                  {genderOptions.map((option) => (
                    <label
                      key={option}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.gender.includes(option)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateFilter("gender", [...filters.gender, option]);
                          } else {
                            updateFilter(
                              "gender",
                              filters.gender.filter((g) => g !== option),
                            );
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-cabin">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Age Range */}
              <div>
                <h4 className="font-bold text-black font-cabin mb-3">
                  Age Range
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-cabin text-gray-600">
                      Min Age
                    </label>
                    <input
                      type="number"
                      value={filters.age.min}
                      onChange={(e) =>
                        updateFilter("age", {
                          ...filters.age,
                          min: parseInt(e.target.value) || 16,
                        })
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      min="16"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-cabin text-gray-600">
                      Max Age
                    </label>
                    <input
                      type="number"
                      value={filters.age.max}
                      onChange={(e) =>
                        updateFilter("age", {
                          ...filters.age,
                          max: parseInt(e.target.value) || 80,
                        })
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      min="16"
                    />
                  </div>
                </div>
              </div>

              {/* Gear */}
              <div>
                <h4 className="font-bold text-black font-cabin mb-3">
                  Gear Requirements
                </h4>
                <div className="space-y-2">
                  {gearOptions.map((option) => (
                    <label
                      key={option}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.gear.includes(option)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateFilter("gear", [...filters.gear, option]);
                          } else {
                            updateFilter(
                              "gear",
                              filters.gear.filter((g) => g !== option),
                            );
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-cabin">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Distance Range */}
              <div>
                <h4 className="font-bold text-black font-cabin mb-3">
                  Distance (km)
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-cabin text-gray-600">
                      Min
                    </label>
                    <input
                      type="number"
                      value={filters.distance.min}
                      onChange={(e) =>
                        updateFilter("distance", {
                          ...filters.distance,
                          min: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-cabin text-gray-600">
                      Max
                    </label>
                    <input
                      type="number"
                      value={filters.distance.max}
                      onChange={(e) =>
                        updateFilter("distance", {
                          ...filters.distance,
                          max: parseInt(e.target.value) || 200,
                        })
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Elevation Range */}
              <div>
                <h4 className="font-bold text-black font-cabin mb-3">
                  Elevation (m)
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-cabin text-gray-600">
                      Min
                    </label>
                    <input
                      type="number"
                      value={filters.elevation.min}
                      onChange={(e) =>
                        updateFilter("elevation", {
                          ...filters.elevation,
                          min: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-cabin text-gray-600">
                      Max
                    </label>
                    <input
                      type="number"
                      value={filters.elevation.max}
                      onChange={(e) =>
                        updateFilter("elevation", {
                          ...filters.elevation,
                          max: parseInt(e.target.value) || 5000,
                        })
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Club Only */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.clubOnly}
                    onChange={(e) => updateFilter("clubOnly", e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="font-bold text-black font-cabin">
                    Club activities only
                  </span>
                </label>
                <p className="text-xs text-gray-500 font-cabin mt-1">
                  Show only activities from clubs you're a member of
                </p>
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50 sticky bottom-0">
              <div className="flex gap-3">
                <button
                  onClick={clearAllFilters}
                  className="flex-1 py-3 border-2 border-gray-300 rounded-lg text-gray-600 font-cabin font-medium"
                >
                  Clear All
                </button>
                <button
                  onClick={applyFilters}
                  className="flex-1 py-3 bg-explore-green text-white rounded-lg font-cabin font-medium"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
