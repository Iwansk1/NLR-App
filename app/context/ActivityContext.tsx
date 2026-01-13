import React, { createContext, ReactNode, useEffect, useState } from "react";
import { Activity } from "../../domain/Activity";
import { ActivityService } from "../../domain/ActivityService";

type ActivityContextType = {
    activities: Activity[];
    isLoading: boolean;
    error: Error | null;
    addActivity: (activityData: {
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
    }) => Promise<Activity>;
    deleteActivity: (id: string) => Promise<boolean>;
    updateActivity: (
        id: string,
        updates: Partial<any>
    ) => Promise<Activity | null>;
    getActivitiesForDay: (day: Date) => Activity[];
    refreshActivities: () => Promise<void>;
    clearError: () => void;
};

export const ActivityContext = createContext<ActivityContextType>({
    activities: [],
    isLoading: false,
    error: null,
    addActivity: async () => {
        throw new Error("ActivityContext not initialized");
    },
    deleteActivity: async () => false,
    updateActivity: async () => null,
    getActivitiesForDay: () => [],
    refreshActivities: async () => {},
    clearError: () => {},
});

export const ActivityProvider = ({ children }: { children: ReactNode }) => {
    const [service] = useState(() => new ActivityService());
    const [activities, setActivities] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const loadActivitiesFromApi = async () => {
        try {
            console.log("[ActivityContext] Loading activities...");
            setIsLoading(true);
            setError(null);

            const fetchedActivities = await service.loadActivities();
            setActivities(fetchedActivities);
            console.log(
                `[ActivityContext] Loaded ${fetchedActivities.length} activities`
            );
        } catch (err) {
            console.error("[ActivityContext] Error loading activities:", err);
            setError(err as Error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadActivitiesFromApi();
    }, []);

    const addActivity = async (activityData: {
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
        try {
            setIsLoading(true);
            setError(null);

            // Create via service/API
            const newActivity = await service.addActivity(activityData);

            // Update state - service already updated its cache
            setActivities(service.getActivities());

            return newActivity;
        } catch (err) {
            console.error("[ActivityContext] Error adding activity:", err);
            setError(err as Error);
            throw err; // Re-throw so CreateScreen can handle
        } finally {
            setIsLoading(false);
        }
    };

    const deleteActivity = async (id: string): Promise<boolean> => {
        try {
            setIsLoading(true);
            setError(null);

            const success = await service.deleteActivity(id);

            if (success) {
                setActivities(service.getActivities());
            }

            return success;
        } catch (err) {
            console.error("[ActivityContext] Error deleting activity:", err);
            setError(err as Error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Update Activity
     *
     * Updates an existing activity with partial data.
     * Returns updated Activity or null if not found.
     */
    const updateActivity = async (
        id: string,
        updates: Partial<any>
    ): Promise<Activity | null> => {
        try {
            setIsLoading(true);
            setError(null);

            const updated = await service.updateActivity(id, updates);

            if (updated) {
                setActivities(service.getActivities());
            }

            return updated;
        } catch (err) {
            console.error("[ActivityContext] Error updating activity:", err);
            setError(err as Error);
            return null;
        } finally {
            setIsLoading(false);
        }
    };
    const getActivitiesForDay = (day: Date): Activity[] => {
        return service.getActivitiesForDay(day);
    };

    const refreshActivities = async (): Promise<void> => {
        await loadActivitiesFromApi();
    };

    const clearError = (): void => {
        setError(null);
    };

    const contextValue: ActivityContextType = {
        activities,
        isLoading,
        error,
        addActivity,
        deleteActivity,
        updateActivity,
        getActivitiesForDay,
        refreshActivities,
        clearError,
    };

    return (
        <ActivityContext.Provider value={contextValue}>
            {children}
        </ActivityContext.Provider>
    );
};
