# MicroGoal Architecture

This document outlines the architecture of the MicroGoal application, explaining the key design decisions, data flow, and component organization.

## System Overview

MicroGoal is a React Native mobile application built with Expo that helps users track daily habits linked to larger life goals. The application uses Firebase for authentication and data storage, with a focus on offline-first capabilities to ensure users can track their goals regardless of connectivity.

## Architecture Pattern

The application follows a layered architecture pattern:

1. **UI Layer** (`components/`, `screens/`): React Native components that render the user interface
2. **State Management Layer** (`store/`): Context API for global state management
3. **Service Layer** (`services/`): Business logic and data access
4. **Data Layer**: Firebase Firestore (external)

## Key Components

### UI Components

- **Screen Components**: Complete screens in the app (e.g., HomeScreen, GoalDetailScreen)
- **Common Components**: Reusable UI elements (e.g., GoalItem, Button, ProgressBar)
- **Specific Components**: Feature-specific components that aren't as broadly reusable

### Navigation

- Uses React Navigation for screen management
- Stack Navigator for main navigation flow

### State Management

- React Context API for global state
- Reducer pattern for state updates
- Actions for triggering state changes

### Services

- **Firebase Service**: Initializes and provides access to Firebase
- **Auth Service**: Handles user authentication
- **Goal Service**: CRUD operations for goals
- **Offline Service**: Manages offline capabilities and sync

## Data Model

### User
- `id`: String (Firebase Auth UID)
- `email`: String
- `displayName`: String
- `createdAt`: Timestamp
- `settings`: Object (user preferences)

### Macro Goal
- `id`: String
- `userId`: String (reference to User)
- `title`: String
- `description`: String
- `isAntiGoal`: Boolean (true for things to avoid)
- `color`: String (for UI customization)
- `targetXP`: Number (optional)
- `currentXP`: Number
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

### Micro Goal
- `id`: String
- `userId`: String (reference to User)
- `macroGoalId`: String (reference to MacroGoal)
- `title`: String
- `description`: String
- `xpValue`: Number (points earned when completed)
- `frequency`: String ('daily', 'weekdays', 'weekends', 'custom')
- `customDays`: Array of Strings (only for 'custom' frequency)
- `streak`: Number (consecutive completions)
- `completed`: Boolean (today's completion status)
- `lastCompleted`: Timestamp
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

### Daily Progress
- `id`: String
- `userId`: String (reference to User)
- `date`: Timestamp
- `completedGoals`: Array of Strings (Micro Goal IDs)
- `notes`: String (optional reflection)
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

## Data Flow

1. **User Authentication**:
   - User authenticates via Firebase Auth
   - App stores auth state in Context

2. **Goal Management**:
   - Goals stored in Firestore
   - UI triggers actions via Context
   - Actions call service methods
   - Services interact with Firestore
   - Results update Context state
   - UI reacts to state changes

3. **Offline Support**:
   - Firestore configured for offline persistence
   - Changes made offline are synced when connectivity returns
   - Conflict resolution favors server state for simplicity

## Design Decisions

### Why Context API instead of Redux?

- Reduced complexity for a smaller application
- Built-in to React with no additional dependencies
- Sufficient for the app's state management needs

### Why Firebase?

- Integrated authentication and database solution
- Built-in offline support
- Realtime updates
- Scalable for future growth
- Minimal backend configuration needed

### Why Expo?

- Faster development workflow
- Simplified build process
- Over-the-air updates capability
- Cross-platform compatibility
- Easy testing with Expo Go app

## Security Considerations

- Firebase Authentication for user identity management
- Firestore Security Rules restrict access based on user ID
- Data validation on both client and server sides
- No sensitive operations in client-side code

## Future Architectural Considerations

- Migration to TypeScript for improved type safety
- Potential for server-side functions (Firebase Cloud Functions) for more complex operations
- Caching strategy improvements for better offline performance
- Analytics integration for usage tracking 