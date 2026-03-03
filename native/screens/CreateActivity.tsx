import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type ActivityType = 'cycling' | 'climbing' | 'running';
type RoadSurface = 'road' | 'gravel' | 'mtb' | 'track' | 'social';
type ClimbingType = 'indoor_bouldering' | 'indoor_top_rope' | 'indoor_lead_climbing' | 'outdoor_climbing';
type RunningTerrain = 'road' | 'trail' | 'track' | 'mixed';
type ActivityScheduleType = 'one_off' | 'recurrent' | 'multi_day';

export default function CreateActivity() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState<ActivityType | null>(null);
  const [activityScheduleType, setActivityScheduleType] = useState<ActivityScheduleType>('one_off');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [recurrenceDayOfWeek, setRecurrenceDayOfWeek] = useState<number>(1); // Default Monday
  const [location, setLocation] = useState('');
  const [meetupLocation, setMeetupLocation] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [specialComments, setSpecialComments] = useState('');
  
  // Cycling specific
  const [distance, setDistance] = useState('');
  const [elevation, setElevation] = useState('');
  const [pace, setPace] = useState('');
  const [roadSurface, setRoadSurface] = useState<RoadSurface>('road');
  const [routeLink, setRouteLink] = useState('');
  const [cafeStop, setCafeStop] = useState('');
  
  // Climbing specific
  const [climbingLevel, setClimbingLevel] = useState('');
  const [climbingType, setClimbingType] = useState<ClimbingType>('indoor_bouldering');
  const [gearRequired, setGearRequired] = useState('');
  
  // Running specific
  const [runningTerrain, setRunningTerrain] = useState<RunningTerrain>('road');
  const [runningPace, setRunningPace] = useState('');
  const [runningDistance, setRunningDistance] = useState('');
  const [runningElevation, setRunningElevation] = useState('');
  
  // Club visibility
  const [clubMembersOnly, setClubMembersOnly] = useState(false);
  const [selectedClubs, setSelectedClubs] = useState<string[]>([]);
  const [userClubs, setUserClubs] = useState<any[]>([]);
  
  const [creating, setCreating] = useState(false);

  const activityTypes = [
    { id: 'cycling' as ActivityType, name: 'Cycling', icon: '🚴' },
    { id: 'climbing' as ActivityType, name: 'Climbing', icon: '🧗' },
    { id: 'running' as ActivityType, name: 'Running', icon: '🏃' },
  ];

  // Fetch user's clubs when component mounts
  useEffect(() => {
    fetchUserClubs();
  }, [user]);

  const fetchUserClubs = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('club_members')
        .select(`
          club_id,
          clubs (
            id,
            name
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (error) throw error;

      const clubs = data?.map((item: any) => ({
        id: item.clubs.id,
        name: item.clubs.name,
      })) || [];

      setUserClubs(clubs);
    } catch (error) {
      console.error('Error fetching user clubs:', error);
    }
  };

  const toggleClubSelection = (clubId: string) => {
    setSelectedClubs(prev => 
      prev.includes(clubId)
        ? prev.filter(id => id !== clubId)
        : [...prev, clubId]
    );
  };

  const handleCreate = async () => {
    // Validation
    if (!selectedType || !title || !time || !location || !maxParticipants) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Validate based on activity schedule type
    if (activityScheduleType === 'one_off' && !date) {
      Alert.alert('Error', 'Please provide a date for one-off activity');
      return;
    }

    if (activityScheduleType === 'multi_day' && (!date || !endDate || !endTime)) {
      Alert.alert('Error', 'Please provide start date, end date, and end time for multi-day activity');
      return;
    }

    if (activityScheduleType === 'recurrent' && recurrenceDayOfWeek === undefined) {
      Alert.alert('Error', 'Please select a day of week for recurrent activity');
      return;
    }

    if (clubMembersOnly && selectedClubs.length === 0) {
      Alert.alert('Error', 'Please select at least one club for club-only visibility');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to create an activity');
      return;
    }

    setCreating(true);

    try {
      const activityData: any = {
        organizer_id: user.id,
        type: selectedType,
        title,
        time,
        location,
        meetup_location: meetupLocation || location,
        max_participants: parseInt(maxParticipants),
        special_comments: specialComments,
        activity_type: activityScheduleType,
      };

      // Add schedule-specific fields
      if (activityScheduleType === 'one_off') {
        activityData.date = date;
        activityData.is_recurrent_template = false;
      } else if (activityScheduleType === 'recurrent') {
        // For recurrent, use the date as the first occurrence
        activityData.date = date || new Date().toISOString().split('T')[0];
        activityData.recurrence_day_of_week = recurrenceDayOfWeek;
        activityData.is_recurrent_template = true; // Mark as template
      } else if (activityScheduleType === 'multi_day') {
        activityData.date = date;
        activityData.end_date = endDate;
        activityData.end_time = endTime;
        activityData.is_recurrent_template = false;
      }

      // Add type-specific fields
      if (selectedType === 'cycling') {
        if (distance) activityData.distance = parseFloat(distance);
        if (elevation) activityData.elevation = parseFloat(elevation);
        if (pace) activityData.pace = parseFloat(pace);
        activityData.distance_unit = 'km';
        activityData.elevation_unit = 'm';
        activityData.pace_unit = 'kph';
        activityData.road_surface = roadSurface;
        if (routeLink) activityData.route_link = routeLink;
        if (cafeStop) activityData.cafe_stop = cafeStop;
      } else if (selectedType === 'climbing') {
        if (climbingLevel) activityData.climbing_level = climbingLevel;
        activityData.climbing_type = climbingType;
        if (gearRequired) activityData.gear_required = gearRequired;
      } else if (selectedType === 'running') {
        if (runningDistance) activityData.distance = parseFloat(runningDistance);
        if (runningElevation) activityData.elevation = parseFloat(runningElevation);
        if (runningPace) activityData.pace = parseFloat(runningPace);
        activityData.distance_unit = 'km';
        activityData.elevation_unit = 'm';
        activityData.pace_unit = 'min/km';
        activityData.running_terrain = runningTerrain;
      }

      // Add club visibility setting
      activityData.club_members_only = clubMembersOnly;
      if (clubMembersOnly && selectedClubs.length > 0) {
        activityData.visible_to_clubs = selectedClubs;
      }

      const { error } = await supabase
        .from('activities')
        .insert([activityData]);

      if (error) throw error;

      Alert.alert(
        'Success!',
        'Your activity has been created',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setSelectedType(null);
              setTitle('');
              setDate('');
              setTime('');
              setLocation('');
              setMeetupLocation('');
              setMaxParticipants('');
              setSpecialComments('');
              setDistance('');
              setElevation('');
              setPace('');
              setRoadSurface('road');
              setRouteLink('');
              setCafeStop('');
              setClimbingLevel('');
              setClimbingType('indoor_bouldering');
              setGearRequired('');
              setRunningTerrain('road');
              setRunningPace('');
              setRunningDistance('');
              setRunningElevation('');
              setClubMembersOnly(false);
              setSelectedClubs([]);
              
              // Navigate to Explore
              navigation.navigate('Explore' as never);
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Error creating activity:', error);
      Alert.alert('Error', error.message || 'Failed to create activity');
    } finally {
      setCreating(false);
    }
  };

  if (!selectedType) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Create Activity</Text>
        </View>

        <View style={styles.typeSelection}>
          <Text style={styles.typeTitle}>What type of activity?</Text>
          
          {activityTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={styles.typeCard}
              onPress={() => setSelectedType(type.id)}
            >
              <Text style={styles.typeIcon}>{type.icon}</Text>
              <Text style={styles.typeName}>{type.name}</Text>
              <Text style={styles.typeArrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setSelectedType(null)}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {activityTypes.find(t => t.id === selectedType)?.name}
        </Text>
      </View>

      <ScrollView style={styles.form} contentContainerStyle={styles.formContent}>
        <TextInput
          style={styles.input}
          placeholder="Activity title *"
          placeholderTextColor="#999"
          value={title}
          onChangeText={setTitle}
        />

        {/* Activity Schedule Type */}
        <Text style={styles.sectionTitle}>Activity Schedule</Text>
        <View style={styles.chipContainer}>
          <TouchableOpacity
            style={[styles.chip, activityScheduleType === 'one_off' && styles.chipActive]}
            onPress={() => setActivityScheduleType('one_off')}
          >
            <Text style={[styles.chipText, activityScheduleType === 'one_off' && styles.chipTextActive]}>
              One-Off
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, activityScheduleType === 'recurrent' && styles.chipActive]}
            onPress={() => setActivityScheduleType('recurrent')}
          >
            <Text style={[styles.chipText, activityScheduleType === 'recurrent' && styles.chipTextActive]}>
              🔄 Recurrent
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, activityScheduleType === 'multi_day' && styles.chipActive]}
            onPress={() => setActivityScheduleType('multi_day')}
          >
            <Text style={[styles.chipText, activityScheduleType === 'multi_day' && styles.chipTextActive]}>
              📅 Multi-Day
            </Text>
          </TouchableOpacity>
        </View>

        {/* Date/Time fields based on schedule type */}
        {activityScheduleType === 'one_off' && (
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Date (YYYY-MM-DD) *"
              placeholderTextColor="#999"
              value={date}
              onChangeText={setDate}
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Time (HH:MM) *"
              placeholderTextColor="#999"
              value={time}
              onChangeText={setTime}
            />
          </View>
        )}

        {activityScheduleType === 'recurrent' && (
          <>
            <Text style={styles.label}>Day of Week *</Text>
            <View style={styles.chipContainer}>
              {[
                { day: 1, label: 'Mon' },
                { day: 2, label: 'Tue' },
                { day: 3, label: 'Wed' },
                { day: 4, label: 'Thu' },
                { day: 5, label: 'Fri' },
                { day: 6, label: 'Sat' },
                { day: 0, label: 'Sun' },
              ].map((item) => (
                <TouchableOpacity
                  key={item.day}
                  style={[styles.chip, recurrenceDayOfWeek === item.day && styles.chipActive]}
                  onPress={() => setRecurrenceDayOfWeek(item.day)}
                >
                  <Text style={[styles.chipText, recurrenceDayOfWeek === item.day && styles.chipTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.input}
              placeholder="Time (HH:MM) *"
              placeholderTextColor="#999"
              value={time}
              onChangeText={setTime}
            />
          </>
        )}

        {activityScheduleType === 'multi_day' && (
          <>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Start Date *"
                placeholderTextColor="#999"
                value={date}
                onChangeText={setDate}
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Start Time *"
                placeholderTextColor="#999"
                value={time}
                onChangeText={setTime}
              />
            </View>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="End Date *"
                placeholderTextColor="#999"
                value={endDate}
                onChangeText={setEndDate}
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="End Time *"
                placeholderTextColor="#999"
                value={endTime}
                onChangeText={setEndTime}
              />
            </View>
          </>
        )}

        <TextInput
          style={styles.input}
          placeholder="Location *"
          placeholderTextColor="#999"
          value={location}
          onChangeText={setLocation}
        />

        <TextInput
          style={styles.input}
          placeholder="Meetup location (optional)"
          placeholderTextColor="#999"
          value={meetupLocation}
          onChangeText={setMeetupLocation}
        />

        <TextInput
          style={styles.input}
          placeholder="Max participants *"
          placeholderTextColor="#999"
          value={maxParticipants}
          onChangeText={setMaxParticipants}
          keyboardType="number-pad"
        />

        {selectedType === 'cycling' && (
          <>
            <Text style={styles.sectionTitle}>Cycling Details</Text>
            
            {/* Road Surface Type */}
            <Text style={styles.label}>Road Surface *</Text>
            <View style={styles.chipContainer}>
              {(['road', 'gravel', 'mtb', 'track', 'social'] as RoadSurface[]).map((surface) => (
                <TouchableOpacity
                  key={surface}
                  style={[styles.chip, roadSurface === surface && styles.chipActive]}
                  onPress={() => setRoadSurface(surface)}
                >
                  <Text style={[styles.chipText, roadSurface === surface && styles.chipTextActive]}>
                    {surface.charAt(0).toUpperCase() + surface.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Distance (km)"
                placeholderTextColor="#999"
                value={distance}
                onChangeText={setDistance}
                keyboardType="decimal-pad"
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Elevation (m)"
                placeholderTextColor="#999"
                value={elevation}
                onChangeText={setElevation}
                keyboardType="decimal-pad"
              />
            </View>
            
            <TextInput
              style={styles.input}
              placeholder="Pace (kph)"
              placeholderTextColor="#999"
              value={pace}
              onChangeText={setPace}
              keyboardType="decimal-pad"
            />

            <TextInput
              style={styles.input}
              placeholder="Route link (e.g., Strava, Komoot)"
              placeholderTextColor="#999"
              value={routeLink}
              onChangeText={setRouteLink}
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Cafe stop (optional)"
              placeholderTextColor="#999"
              value={cafeStop}
              onChangeText={setCafeStop}
            />
          </>
        )}

        {selectedType === 'climbing' && (
          <>
            <Text style={styles.sectionTitle}>Climbing Details</Text>
            
            {/* Climbing Type */}
            <Text style={styles.label}>Climbing Type *</Text>
            <View style={styles.chipContainer}>
              {(['indoor_bouldering', 'indoor_top_rope', 'indoor_lead_climbing', 'outdoor_climbing'] as ClimbingType[]).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.chip, climbingType === type && styles.chipActive]}
                  onPress={() => setClimbingType(type)}
                >
                  <Text style={[styles.chipText, climbingType === type && styles.chipTextActive]}>
                    {type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.input}
              placeholder="Climbing level (e.g., 5.8-5.10)"
              placeholderTextColor="#999"
              value={climbingLevel}
              onChangeText={setClimbingLevel}
            />

            <TextInput
              style={styles.input}
              placeholder="Gear required (optional)"
              placeholderTextColor="#999"
              value={gearRequired}
              onChangeText={setGearRequired}
            />
          </>
        )}

        {selectedType === 'running' && (
          <>
            <Text style={styles.sectionTitle}>Running Details</Text>
            
            {/* Running Terrain */}
            <Text style={styles.label}>Terrain *</Text>
            <View style={styles.chipContainer}>
              {(['road', 'trail', 'track', 'mixed'] as RunningTerrain[]).map((terrain) => (
                <TouchableOpacity
                  key={terrain}
                  style={[styles.chip, runningTerrain === terrain && styles.chipActive]}
                  onPress={() => setRunningTerrain(terrain)}
                >
                  <Text style={[styles.chipText, runningTerrain === terrain && styles.chipTextActive]}>
                    {terrain.charAt(0).toUpperCase() + terrain.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Distance (km)"
                placeholderTextColor="#999"
                value={runningDistance}
                onChangeText={setRunningDistance}
                keyboardType="decimal-pad"
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Elevation (m)"
                placeholderTextColor="#999"
                value={runningElevation}
                onChangeText={setRunningElevation}
                keyboardType="decimal-pad"
              />
            </View>
            
            <TextInput
              style={styles.input}
              placeholder="Pace (min/km, e.g., 5:30)"
              placeholderTextColor="#999"
              value={runningPace}
              onChangeText={setRunningPace}
            />

            <TextInput
              style={styles.input}
              placeholder="Route link (e.g., Strava, Komoot)"
              placeholderTextColor="#999"
              value={routeLink}
              onChangeText={setRouteLink}
              autoCapitalize="none"
            />
          </>
        )}

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Special comments or requirements"
          placeholderTextColor="#999"
          value={specialComments}
          onChangeText={setSpecialComments}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        {/* Club Members Only Toggle */}
        <TouchableOpacity
          style={styles.toggleContainer}
          onPress={() => {
            setClubMembersOnly(!clubMembersOnly);
            if (clubMembersOnly) {
              setSelectedClubs([]);
            }
          }}
        >
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleLabel}>🔒 Visible to club members only</Text>
            <Text style={styles.toggleDescription}>
              Only members of selected clubs can see and join this activity
            </Text>
          </View>
          <View style={[styles.toggle, clubMembersOnly && styles.toggleActive]}>
            <View style={[styles.toggleThumb, clubMembersOnly && styles.toggleThumbActive]} />
          </View>
        </TouchableOpacity>

        {/* Club Selection */}
        {clubMembersOnly && (
          <View style={styles.clubSelectionContainer}>
            <Text style={styles.clubSelectionTitle}>Select Clubs</Text>
            {userClubs.length === 0 ? (
              <Text style={styles.noClubsText}>
                You're not a member of any clubs yet. Join a club to create club-only activities.
              </Text>
            ) : (
              <View style={styles.clubList}>
                {userClubs.map((club) => (
                  <TouchableOpacity
                    key={club.id}
                    style={[
                      styles.clubItem,
                      selectedClubs.includes(club.id) && styles.clubItemSelected
                    ]}
                    onPress={() => toggleClubSelection(club.id)}
                  >
                    <Text style={[
                      styles.clubItemText,
                      selectedClubs.includes(club.id) && styles.clubItemTextSelected
                    ]}>
                      {selectedClubs.includes(club.id) ? '✓ ' : ''}{club.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        <TouchableOpacity
          style={[styles.createButton, creating && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={creating}
        >
          <Text style={styles.createButtonText}>
            {creating ? 'Creating...' : 'Create Activity'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: 'white',
  },
  backButton: {
    fontSize: 32,
    color: '#4A7C59',
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4A7C59',
  },
  typeSelection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  typeTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    marginBottom: 24,
  },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginBottom: 16,
  },
  typeIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  typeName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  typeArrow: {
    fontSize: 24,
    color: '#4A7C59',
  },
  form: {
    flex: 1,
  },
  formContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  input: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#000',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  textArea: {
    minHeight: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A7C59',
    marginTop: 8,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: 'white',
  },
  chipActive: {
    backgroundColor: '#4A7C59',
    borderColor: '#4A7C59',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  chipTextActive: {
    color: 'white',
  },
  createButton: {
    backgroundColor: '#4A7C59',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  createButtonDisabled: {
    backgroundColor: '#CCC',
  },
  createButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginBottom: 24,
  },
  toggleInfo: {
    flex: 1,
    marginRight: 12,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  toggleDescription: {
    fontSize: 13,
    color: '#666',
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E0E0E0',
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#4A7C59',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  clubSelectionContainer: {
    marginBottom: 24,
  },
  clubSelectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  noClubsText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
  },
  clubList: {
    gap: 8,
  },
  clubItem: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  clubItemSelected: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4A7C59',
  },
  clubItemText: {
    fontSize: 16,
    color: '#000',
  },
  clubItemTextSelected: {
    fontWeight: '600',
    color: '#4A7C59',
  },
});
