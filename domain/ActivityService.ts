import * as ActivityApi from "@/services/api/mockActivityApi";
import { Activity } from "./Activity";

export class ActivityService {
    /**
     * Local cache of activities.
     *
     * Why cache?
     * - Performance: Don't fetch from API every time
     * - Reduces API calls (important when you have rate limits)
     * - Enables offline functionality (future enhancement)
     *
     * Note: This is a simple cache. In production, you might use:
     * - React Query (automatic caching, refetching)
     * - Redux (global state management)
     * - Local database (SQLite for offline support)
     */
    private activities: Activity[] = [];

    private isLoading: boolean = false;

    private lastError: Error | null = null;

    constructor(initialActivities: Activity[] = []) {
        this.activities = initialActivities;
    }
    /**
     * Loads all activities from the API.
     *
     * When to call this?
     * - When app starts (in Context or useEffect)
     * - After major changes (optional - we auto-update cache)
     * - When user pulls to refresh
     *
     * Why async?
     * - API calls take time (network latency)
     * - Must wait for response before updating cache
     *
     * Error Handling:
     * - Catches errors and stores them
     * - Doesn't throw - lets UI decide how to handle
     * - Returns empty array on failure (safe default)
     *
     * @returns Promise<Activity[]> - Array of all activities
     */
    async loadActivities(): Promise<Activity[]> {
        try {
            console.log("[ActivityService] Loading activities from API...");
            this.isLoading = true;
            this.lastError = null;

            const activities = await ActivityApi.fetchActivities();

            this.activities = activities;

            console.log(
                `[ActivityService] Loaded ${activities.length} activities.`
            );
            return activities;
        } catch (error) {
            console.error("[ActivityService] Error loading activities:", error);
            this.lastError = error as Error;
            return [];
        } finally {
            this.isLoading = false;
        }
    }

    async addActivity(activityData: {
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
    }): Promise<Activity> {
        try {
            console.log(
                "[ActivityService] Creating activity:",
                activityData.title
            );
            this.isLoading = true;
            this.lastError = null;

            // BUSINESS RULE EXAMPLE: Validate maintenance activities
            // Uncomment to enforce that maintenance stays in same hangar
            /*
      if (activityData.tags === "onderhoud" && activityData.hangarA !== activityData.hangarB) {
        throw new Error("Maintenance activities must stay in the same hangar");
      }
      */

            // Send to API
            const newActivity = await ActivityApi.createActivity(activityData);

            // BUSINESS RULE: Prevent duplicates (check by ID)
            if (
                !this.activities.some((a) => a.getId() === newActivity.getId())
            ) {
                this.activities.push(newActivity);
            }

            console.log("[ActivityService] Activity created successfully");
            return newActivity;
        } catch (error) {
            console.error("[ActivityService] Error creating activity:", error);
            this.lastError = error as Error;
            throw error; // Re-throw so UI can handle it
        } finally {
            this.isLoading = false;
        }
    }

    async deleteActivity(id: string): Promise<boolean> {
        try {
            console.log("[ActivityService] Deleting activity:", id);
            this.isLoading = true;
            this.lastError = null;

            const succes = await ActivityApi.deleteActivity(id);

            if (succes) {
                this.activities = this.activities.filter(
                    (a) => a.getId() !== id
                );
                console.log("[ActivityService] Activity deleted successfully");
            }
            return succes;
        } catch (error) {
            console.error("[ActivityService] Error deleting activity:", error);
            this.lastError = error as Error;
            return false;
        } finally {
            this.isLoading = false;
        }
    }

    async updateActivity(
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
    ): Promise<Activity | null> {
        try {
            console.log("[ActivityService] Updating activity:", id);
            this.isLoading = true;
            this.lastError = null;

            // Update via API
            const updated = await ActivityApi.updateActivity(id, updates);

            if (updated) {
                // Update local cache
                const index = this.activities.findIndex(
                    (a) => a.getId() === id
                );
                if (index !== -1) {
                    this.activities[index] = updated;
                }
                console.log("[ActivityService] Activity updated successfully");
            }

            return updated;
        } catch (error) {
            console.error("[ActivityService] Error updating activity:", error);
            this.lastError = error as Error;
            return null;
        } finally {
            this.isLoading = false;
        }
    }

    getActivities(): Activity[] {
        return [...this.activities];
    }

    getActivitiesForDay(day: Date): Activity[] {
        return this.activities.filter((a) => a.occursOn(day));
    }

    getActivityById(id: string): Activity | undefined {
        return this.activities.find((a) => a.getId() === id);
    }

    getIsLoading(): boolean {
        return this.isLoading;
    }

    getLastError(): Error | null {
        return this.lastError;
    }

    clearError(): void {
        this.lastError = null;
    }
}
