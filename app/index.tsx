import { Activity } from "@/domain/Activity";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Stack, useRouter } from "expo-router";
import React, { useContext, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Button,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { getCurrentWeekDays, getWeekNumber } from "../utils/dateUtils";
import { ActivityContext } from "./context/ActivityContext";
import { tags } from "./CreateActivityScreen";

const ActivityItem = ({ activity }: { activity: Activity }) => (
    <View style={styles.activityContainer}>
        <View style={styles.activityContent}>
            <View style={styles.activityHeader}>
                <Text style={styles.subheaderText}>{activity.getTitle()}</Text>
            </View>
            <Text style={styles.aircraftText}>{activity.getAircraft()}</Text>
            <Text style={styles.hangarText}>
                Van: {activity.getHangars().from} Naar:{" "}
                {activity.getHangars().to}
            </Text>
        </View>
        <View style={styles.dateContainer}>
            <Text style={styles.dateContainerText}>
                {activity.getDate().toLocaleDateString("nl-NL", {
                    day: "2-digit",
                    month: "short",
                })}
            </Text>
            <Text style={styles.dateContainerText}>{activity.getTime()}</Text>
        </View>
    </View>
);

const ActivityTag = ({ color }: { color: string }) => {
    return <View style={[styles.activityTag, { backgroundColor: color }]} />;
};

const WeekDayActivityItem = ({ activity }: { activity: Activity }) => {
    const activityTag = activity.getTags?.()
        ? tags.find((t) => activity.getTags().includes(t.value))
        : tags[0];

    return (
        <View style={styles.weekActivityContainer}>
            <View style={styles.weekActivityItem}>
                <Text style={styles.subheaderText}>{activity.getTime()}</Text>
                <ActivityTag color={activityTag?.color || tags[0].color} />
                <View style={{ flex: 1 }}>
                    <View style={styles.activityTitleRow}>
                        <Text style={styles.subheaderText}>
                            {activity.getTitle()}
                        </Text>
                    </View>
                    <Text style={styles.hangarText}>
                        {activity.getHangars().from}
                        <AntDesign name="arrow-right" size={12} color="black" />
                        {activity.getHangars().to}
                    </Text>
                </View>
                <AntDesign name="arrow-right" size={24} color="black" />
            </View>
        </View>
    );
};

const WeekDayItem = ({
    day,
    hasActivity,
    isSelected,
    onPress,
}: {
    day: any;
    hasActivity: boolean;
    isSelected?: boolean;
    onPress?: () => void;
}) => (
    <TouchableOpacity onPress={onPress} style={styles.weekDayButton}>
        <View
            style={[
                styles.weekContainer,
                isSelected && styles.weekContainerSelected,
            ]}
        >
            <Text
                style={[styles.weekText, isSelected && styles.weekTextSelected]}
            >
                {day.date}
            </Text>
            <View
                style={[
                    styles.circle,
                    hasActivity && styles.circleFilled,
                    isSelected && styles.circleSelected,
                ]}
            />
        </View>
    </TouchableOpacity>
);

const LoadingView = () => (
    <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#ED7914" />
        <Text style={styles.loadingText}>Activiteiten laden...</Text>
    </View>
);

const ErrorView = ({
    error,
    onRetry,
}: {
    error: Error;
    onRetry: () => void;
}) => (
    <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Fout bij laden van activiteiten</Text>
        <Text style={styles.errorDetailText}>{error.message}</Text>
        <Button title="Opnieuw proberen" onPress={onRetry} color="#ED7914" />
    </View>
);

const EmptyView = ({ onCreatePress }: { onCreatePress: () => void }) => (
    <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>Geen activiteiten gepland</Text>
        <Text style={styles.emptySubText}>
            Maak je eerste activiteit aan om te beginnen
        </Text>
        <Button
            title="Activiteit toevoegen"
            onPress={onCreatePress}
            color="#ED7914"
        />
    </View>
);

export default function HomeScreen() {
    const router = useRouter();
    const { activities, isLoading, error, refreshActivities } =
        useContext(ActivityContext);

    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const today = useMemo(() => new Date(), []);
    const currentWeek = useMemo(() => getWeekNumber(today), [today]);
    const weekDays = useMemo(() => getCurrentWeekDays(), []);

    const importantActivities = useMemo(() => {
        return activities.filter((activities) => activities.getIsImportant());
    }, [activities]);

    const selectedDayActivities = useMemo(() => {
        return activities.filter((activity) => activity.occursOn(selectedDate));
    }, [activities, selectedDate]);

    const hasActivity = (date: Date) => {
        return activities.some((activity) => activity.occursOn(date));
    };

    const handleDayClick = (date: Date) => {
        setSelectedDate(date);
    };

    const handleRetry = async () => {
        await refreshActivities();
    };

    const isSameDay = (date1: Date, date2: Date) => {
        return (
            date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
        );
    };

    if (isLoading && activities.length === 0) {
        return (
            <>
                <Stack.Screen options={{ title: "Home" }} />
                <View style={styles.screen}>
                    <LoadingView />
                </View>
            </>
        );
    }

    if (error && activities.length === 0) {
        // Error on first load - show error
        return (
            <>
                <Stack.Screen options={{ title: "Home" }} />
                <View style={styles.screen}>
                    <ErrorView error={error} onRetry={handleRetry} />
                </View>
            </>
        );
    }

    if (activities.length === 0) {
        // No activities - show empty state
        return (
            <>
                <Stack.Screen options={{ title: "Home" }} />
                <View style={styles.screen}>
                    <EmptyView
                        onCreatePress={() =>
                            router.push("/CreateActivityScreen")
                        }
                    />
                </View>
            </>
        );
    }
    return (
        <>
            <Stack.Screen options={{ title: "Home" }} />
            <ScrollView style={styles.screen}>
                {/* Background refresh indicator */}
                {isLoading && activities.length > 0 && (
                    <View style={styles.refreshingIndicator}>
                        <ActivityIndicator size="small" color="#ED7914" />
                        <Text style={styles.refreshingText}>Vernieuwen...</Text>
                    </View>
                )}

                {/**
                 * IMPORTANT ACTIVITIES SECTION
                 *
                 * NEW: Only shows activities marked as important
                 * Empty section if no important activities
                 */}
                {importantActivities.length > 0 && (
                    <View style={styles.container}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.titleText}>
                                Belangrijke activiteiten deze week
                            </Text>
                        </View>
                        {importantActivities.map((activity) => (
                            <ActivityItem
                                key={activity.getId()}
                                activity={activity}
                            />
                        ))}
                    </View>
                )}

                {/* Week Title */}
                <View style={styles.weekTitleContainer}>
                    <Text style={styles.weekTitleText}>Week {currentWeek}</Text>
                </View>

                {/**
                 * WEEK DAYS - Clickable!
                 *
                 * Changes:
                 * - Each day is now clickable
                 * - Visual feedback for selected day
                 * - onPress updates selectedDate
                 */}
                <View style={styles.container}>
                    <View style={styles.weekDaysContainer}>
                        {weekDays.map((day, index) => {
                            const dayActivities = activities.filter(
                                (activity) => activity.occursOn(day.fullDate)
                            );
                            const isSelected = isSameDay(
                                day.fullDate,
                                selectedDate
                            );

                            return (
                                <WeekDayItem
                                    key={index}
                                    day={day}
                                    hasActivity={dayActivities.length > 0}
                                    isSelected={isSelected}
                                    onPress={() => handleDayClick(day.fullDate)}
                                />
                            );
                        })}
                    </View>
                </View>

                {/**
                 * ACTIVITIES FOR SELECTED DAY
                 *
                 * NEW: Shows activities only for selected day
                 * Updates when user clicks different day
                 */}
                <View style={styles.container}>
                    <View style={styles.selectedDayHeader}>
                        <Text style={styles.selectedDayText}>
                            {selectedDate.toLocaleDateString("nl-NL", {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                            })}
                        </Text>
                        <Text style={styles.activityCount}>
                            {selectedDayActivities.length} activiteit(en)
                        </Text>
                    </View>

                    {selectedDayActivities.length === 0 ? (
                        <View style={styles.noActivitiesContainer}>
                            <Text style={styles.noActivitiesText}>
                                Geen activiteiten op deze dag
                            </Text>
                        </View>
                    ) : (
                        selectedDayActivities.map((activity) => (
                            <WeekDayActivityItem
                                key={activity.getId()}
                                activity={activity}
                            />
                        ))
                    )}

                    <View style={{ marginBottom: 10, marginTop: 20 }}>
                        <Button
                            color="#ED7914"
                            title="+ Nieuwe activiteit aanmaken"
                            onPress={() => router.push("/CreateActivityScreen")}
                        />
                    </View>
                </View>
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#00002D",
    },
    container: {
        marginBottom: 20,
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 10,
        width: "100%",
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    activityContainer: {
        justifyContent: "space-between",
        flexDirection: "row",
        marginTop: 10,
        padding: 10,
        backgroundColor: "#679436",
        borderRadius: 8,
    },
    activityContent: {
        flex: 1,
    },
    activityHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    activityTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    weekActivityContainer: {
        marginTop: 10,
        padding: 10,
        backgroundColor: "#fff",
        boxShadow: "0px 0px 6px #00000075",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    weekActivityItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    dateContainer: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
        opacity: 0.7,
        padding: 10,
        borderRadius: 5,
    },
    dateContainerText: { fontSize: 16, fontWeight: "bold" },
    weekDayButton: {
        flex: 1,
    },
    weekContainer: {
        alignItems: "center",
        padding: 8,
        borderRadius: 8,
    },
    weekContainerSelected: {
        backgroundColor: "#ED7914",
    },
    titleText: { fontSize: 28, fontWeight: "bold", flex: 1 },
    subheaderText: { fontSize: 18, fontWeight: "bold", color: "#000000ff" },
    hangarText: { fontSize: 16, color: "#000000ff" },
    aircraftText: {
        fontSize: 16,
        fontStyle: "italic",
        color: "rgba(255, 255, 255, 0.8)",
    },
    weekTitleContainer: { padding: 10, width: "100%", marginTop: 6 },
    weekTitleText: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#fff",
        textAlign: "left",
    },
    weekText: { fontSize: 16, color: "#000000ff", fontWeight: "500" },
    weekTextSelected: { color: "#fff" },
    weekDaysContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        padding: 2,
        backgroundColor: "#fff",
        alignItems: "center",
    },
    circle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#000",
        marginVertical: 4,
    },
    circleFilled: { backgroundColor: "#000" },
    circleSelected: {
        backgroundColor: "#fff",
        borderColor: "#fff",
    },
    activityTag: {
        margin: 10,
        width: 4,
        height: 50,
    },
    /**
     * SELECTED DAY HEADER
     */
    selectedDayHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
        paddingBottom: 10,
        borderBottomWidth: 2,
        borderBottomColor: "#ED7914",
    },
    selectedDayText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#000",
        textTransform: "capitalize",
    },
    activityCount: {
        fontSize: 14,
        color: "#666",
        fontStyle: "italic",
    },
    noActivitiesContainer: {
        padding: 20,
        alignItems: "center",
    },
    noActivitiesText: {
        fontSize: 16,
        color: "#666",
        fontStyle: "italic",
    },
    /**
     * LOADING/ERROR/EMPTY STATES
     */
    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: "#fff",
    },
    errorText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#ff6b6b",
        marginBottom: 10,
        textAlign: "center",
    },
    errorDetailText: {
        fontSize: 14,
        color: "#fff",
        marginBottom: 20,
        textAlign: "center",
    },
    emptyText: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 10,
        textAlign: "center",
    },
    emptySubText: {
        fontSize: 16,
        color: "rgba(255, 255, 255, 0.7)",
        marginBottom: 20,
        textAlign: "center",
    },
    refreshingIndicator: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        backgroundColor: "rgba(237, 121, 20, 0.1)",
        borderRadius: 8,
        marginBottom: 10,
        marginHorizontal: 20,
        marginTop: 10,
    },
    refreshingText: {
        marginLeft: 10,
        color: "#ED7914",
        fontSize: 14,
    },
});
