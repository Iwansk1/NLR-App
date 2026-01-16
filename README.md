# NLR Activity Planner

NLR App is a mobile application built with React Native and Expo for managing and scheduling aircraft activities within hangars. It provides a clear overview of weekly and daily tasks, including maintenance and relocations, with a focus on resource and personnel allocation.

## Key Features

-   **Activity Dashboard**: View a summary of important activities for the current week and a detailed breakdown of tasks for any selected day.
-   **Dynamic Activity Creation**: Add new activities through an intelligent form that adapts its fields based on the activity type (e.g., "Maintenance" vs. "Relocation").
-   **Resource Management**: Assign employees, aircraft, tail numbers, and other resources to each activity.
-   **State Management**: Centralized state management for activities, loading states, and errors is handled using React's Context API.
-   **Mock Backend**: The app uses a mock API to simulate network requests and data persistence, allowing for full functionality without a live backend.
-   **Component-Based UI**: Built with reusable components, including a custom Multi-Select dropdown for tags and employees.

## Tech Stack

-   **Framework**: React Native with Expo
-   **Language**: TypeScript
-   **Navigation**: Expo Router (File-based routing)
-   **State Management**: React Context API
-   **UI Components**:
    -   `react-native-calendars` for the date selection modal.
    -   `react-native-element-dropdown` for selection inputs.
-   **Styling**: StyleSheet API

## Project Structure

The project follows a clean architecture pattern, separating concerns into distinct layers.

```
.
├── app/                  # Screens, navigation, and context
│   ├── context/          # Global state management (ActivityContext)
│   ├── _layout.tsx       # Root layout and context provider
│   ├── index.tsx         # Home screen / Activity Dashboard
│   └── CreateActivityScreen.tsx # Screen for adding new activities
├── components/           # Reusable UI components (e.g., MultiSelect)
├── domain/               # Core business logic and data models
│   ├── Activity.ts       # The Activity data model
│   └── ActivityService.ts  # Service layer for activity operations
├── services/             # API layer for data fetching
│   └── api/
│       └── mockActivityApi.ts # Mock API for simulating a backend
└── utils/                # Utility functions (e.g., date formatting)
```

## Getting Started

### Prerequisites

-   Node.js and npm
-   Expo Go app on your mobile device or an Android/iOS emulator set up, recommend android studio with Pixel 9.

### Installation & Running the App

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/iwansk1/nlr-app.git
    cd nlr-app
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Start the development server:**

    ```bash
    npx expo start
    ```

4.  **Run the app:**
    -   Scan the QR code with the Expo Go app on your iOS or Android phone.
    -   Press `a` to open in an Android emulator.
    -   Press `i` to open in an iOS simulator.
    -   Press `w` to open in a web browser.
