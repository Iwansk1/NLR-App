import { Activity } from "@/domain/Activity";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

/**
 * MOCK API SERVICE
 *
 * Purpose: Simulates a real backend API without needing an actual server.
 * This allows us to:
 * 1. Develop and test the app without backend dependencies
 * 2. Practice async/await patterns that real APIs require
 * 3. Structure code in a way that makes swapping to a real API easy
 *
 * Architecture Decision: We store data in memory (mockDatabase) to simulate
 * a database. In a real app, this would be replaced with actual HTTP requests
 * to a server (fetch/axios) or direct database queries (Firebase, Supabase, etc.)
 */

// ============================================================================
// MOCK DATABASE (In-Memory Storage)
// ============================================================================

/**
 * This array acts as our "database table" for activities.
 *
 * Why an array?
 * - Easy to work with (filter, map, find)
 * - Mirrors how you'd store data in a real database
 * - Simple to add/remove items
 *
 * In production, this would be replaced by actual database queries.
 */

let mockDatabase: Activity[] = [
    new Activity(
        uuidv4(),
        "Apache Maintenance Check",
        "Apache AH-64",
        "Hangar A",
        "Hangar A", // Same hangar for maintenance
        new Date(2026, 0, 12), // January 12, 2026
        "09:00",
        201,
        "Hydraulic tools, Diagnostic computer",
        "jan",
        "onderhoud", // Maintenance tag
        true
    ),
    new Activity(
        uuidv4(),
        "Chinook Relocation",
        "Chinook CH-47",
        "Hangar B",
        "Hangar C", // Moving between hangars
        new Date(2026, 0, 12), // January 12, 2026
        "14:00",
        305,
        "Tow vehicle, Ground crew",
        "piet",
        "verplaatsen", // Relocation tag
        false
    ),
    new Activity(
        uuidv4(),
        "F-16 Engine Inspection",
        "F-16 Fighting Falcon",
        "Hangar D",
        "Hangar D",
        new Date(2026, 0, 15), // January 15, 2026 (today)
        "08:30",
        102,
        "Engine diagnostic tools, Safety equipment",
        "sara",
        "onderhoud",
        false
    ),
    new Activity(
        uuidv4(),
        "Black Hawk Transfer",
        "Black Hawk UH-60",
        "Hangar A",
        "Hangar E",
        new Date(2026, 0, 14), // January 16, 2026
        "11:00",
        450,
        "Tow bar, Fuel truck",
        "alex",
        "verplaatsen",
        true
    ),
];

/**
 * Simulates network latency (delay) that real APIs have.
 *
 * Why add artificial delay?
 * - Real APIs take 100-500ms (or more) to respond
 * - Testing with delays helps us:
 *   * Implement proper loading states
 *   * Handle race conditions
 *   * Create a more realistic user experience
 * - When you connect a real API, your code already handles delays
 *
 * @param ms - Milliseconds to delay (default: 300ms)
 */
const simulateNetworkDelay = (ms: number = 300): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

// API FUNCTIONS

/**
 * Fetches all activities from the mock database.
 *
 * Architecture Decision: This is a GET request in REST API terms.
 * - Real implementation: fetch('https://api.example.com/activities')
 * - Mock implementation: Return data from memory
 *
 * Why async/await?
 * - Real APIs are asynchronous (network requests take time)
 * - Using async here means our UI code works the same way with real APIs
 *
 * @returns Promise<Activity[]> - Array of all activities
 */

export const fetchActivities = async (): Promise<Activity[]> => {
    console.log("Fetching activities from mock API...");

    await simulateNetworkDelay();
    console.log(`[Mock API] returning ${mockDatabase.length} activities.`);
    return mockDatabase;
};

/**
 * Creates a new activity and adds it to the mock database.
 *
 * Architecture Decision: This is a POST request in REST API terms.
 * - Real implementation: fetch('https://api.example.com/activities', { method: 'POST', body: ... })
 * - Mock implementation: Add to our in-memory array
 *
 * Why return the created activity?
 * - Confirms the operation succeeded
 * - Real APIs often return the created object with server-generated fields (like ID, timestamps)
 * - Allows the UI to update immediately with the confirmed data
 *
 * @param activityData - Object containing all fields needed for an Activity
 * @returns Promise<Activity> - The newly created activity
 */

export const createActivity = async (activityData: {
    title: string;
    aircraft: string;
    hangarA: string;
    hangarB: string;
    date: Date;
    time: string;
    tailnumber: number;
    resources: string;
    employee: string;
    tags: string;
    isImportant?: boolean;
}): Promise<Activity> => {
    console.log("[Mock API] Creating new activity:", activityData.title);

    await simulateNetworkDelay();

    const newActivity = new Activity(
        uuidv4(),
        activityData.title,
        activityData.aircraft,
        activityData.hangarA,
        activityData.hangarB,
        activityData.date,
        activityData.time,
        activityData.tailnumber,
        activityData.resources,
        activityData.employee,
        activityData.tags,
        activityData.isImportant ?? false
    );

    mockDatabase.push(newActivity);

    console.log(
        "[Mock API] Activity created succesfully. Total activities:",
        mockDatabase.length
    );
    return newActivity;
};
/**
 * Deletes an activity by ID.
 *
 * Architecture Decision: This is a DELETE request in REST API terms.
 * - Real implementation: fetch('https://api.example.com/activities/123', { method: 'DELETE' })
 * - Mock implementation: Remove from array
 *
 * Why return boolean?
 * - Indicates success/failure
 * - UI can show confirmation or error message
 *
 * @param id - The unique identifier of the activity to delete
 * @returns Promise<boolean> - true if deleted, false if not found
 */

export const deleteActivity = async (id: string): Promise<boolean> => {
    console.log("[Mock API] Deleting activity", id);

    await simulateNetworkDelay();

    const initialLength = mockDatabase.length;
    mockDatabase = mockDatabase.filter((activity) => activity.getId() !== id);

    const wasDeleted = mockDatabase.length < initialLength;
    console.log(`[Mock API] Delete ${wasDeleted ? "succesfull" : "failed"}`);

    return wasDeleted;
};

/**
 * Updates an existing activity.
 *
 * Architecture Decision: This is a PUT/PATCH request in REST API terms.
 * - Real implementation: fetch('https://api.example.com/activities/123', { method: 'PUT', body: ... })
 * - Mock implementation: Find and replace in array
 *
 * @param id - The activity ID to update
 * @param updates - Partial activity data to update
 * @returns Promise<Activity | null> - Updated activity or null if not found
 */

export const updateActivity = async (
    id: string,
    updates: Partial<{
        title: string;
        aircraft: string;
        hangarA: string;
        hangarB: string;
        date: Date;
        time: string;
        tailnumber: number;
        resources: string;
        employee: string;
        tags: string;
    }>
): Promise<Activity | null> => {
    console.log("[Mock API] Updating activity", id);

    await simulateNetworkDelay();

    const index = mockDatabase.findIndex((activity) => activity.getId() === id);

    if (index === -1) {
        console.log("[Mock API] Activity not found");
        return null;
    }

    const existing = mockDatabase[index];

    const updated = new Activity(
        existing.getId(),
        updates.title ?? existing.getTitle(),
        updates.aircraft ?? existing.getAircraft(),
        updates.hangarA ?? existing.getHangars().from,
        updates.hangarB ?? existing.getHangars().to,
        updates.date ?? existing.getDate(),
        updates.time ?? existing.getTime(),
        updates.tailnumber ?? existing.getTailnumber(),
        updates.resources ?? existing.getResources(),
        updates.employee ?? existing.getEmployee(),
        updates.tags ?? existing.getTags()
    );

    mockDatabase[index] = updated;

    console.log("[Mock API] Activity updated succesfully");
    return updated;
};

// UTILITY FUNCTIONS (TESTING PURPOSE)

/**
 * Resets the database to initial state.
 * Useful for testing or demo resets.
 */

export const reseDatabase = (): void => {
    console.log("[Mock API] Resetting database to initial state");
    mockDatabase = [];
};

export const getDatabaseSize = (): number => {
    return mockDatabase.length;
};
