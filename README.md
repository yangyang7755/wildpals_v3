# Wildpals - Outdoor Activity Social App

A React Native mobile app connecting outdoor enthusiasts for cycling, climbing, and running activities.

## Features

- 🚴 Create and join outdoor activities (cycling, climbing, running)
- 👥 Form and manage clubs
- 💬 Real-time group chat for activities and clubs
- 🔔 Notifications for join requests and activity updates
- 👤 User profiles with sports preferences
- 🔒 Privacy controls and account management

## Tech Stack

- **Frontend**: React Native + Expo
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Navigation**: React Navigation
- **State**: React Context API
- **Styling**: React Native StyleSheet

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI
- Supabase account

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd wildpals
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Add your Supabase credentials to .env
```

4. Run the app
```bash
npm run dev
```

## Environment Variables

Create a `.env` file with:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Setup

Run the SQL migrations in this order:
1. `DATABASE-SETUP-GUIDE.md` - Initial schema
2. `CREATE-NOTIFICATIONS-SYSTEM.sql` - Notifications
3. `FIX-NOTIFICATIONS-MIGRATION.sql` - Notifications fix

## Project Structure

```
native/
├── screens/          # App screens
├── navigation/       # Navigation setup
├── contexts/         # React contexts (Auth, etc.)
└── lib/             # Utilities (Supabase client)

assets/              # Images, icons, fonts
```

## Documentation

- `APP-STORE-LAUNCH-CHECKLIST.md` - Launch preparation guide
- `MVP-LAUNCH-READINESS.md` - Current status and next steps
- `SUPABASE-SETUP.md` - Backend configuration
- `BETA-TESTING-GUIDE.md` - Testing instructions

## Contributing

This is a private project. Contact the owner for contribution guidelines.

## License

Private - All rights reserved
