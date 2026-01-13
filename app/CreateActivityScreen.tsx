import { MultiSelectComponent } from "@/components/MultiSelect";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Button,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { ActivityContext } from "./context/ActivityContext";

export const options = {
    title: "Nieuwe activiteit",
};

export const tags = [
    { label: "Verplaatsen", value: "verplaatsen", color: "#FF69B4" },
    { label: "Onderhoud", value: "onderhoud", color: "#83cf32ff" },
];

const medewerkers = [
    { label: "Jan Jansen", value: "jan" },
    { label: "Piet Pieters", value: "piet" },
    { label: "Sara de Vries", value: "sara" },
    { label: "Alex Mulder", value: "alex" },
];

export default function CreateActivityScreen() {
    const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const router = useRouter();
    const { addActivity } = useContext(ActivityContext);

    const [title, setTitle] = useState("");
    const [aircraft, setAircraft] = useState("");
    const [tailnumber, setTailnumber] = useState("");
    const [resources, setResources] = useState("");
    const [employee, setEmployee] = useState("");
    // const [tags, setTag] = useState("");
    const [hangarA, setHangarA] = useState("");
    const [hangarB, setHangarB] = useState("");
    const [date, setDate] = useState("");
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [time, setTime] = useState("");
    const [isCalendarVisible, setIsCalendarVisible] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isImportant, setIsImportant] = useState(false);

    const selectedTag = selectedTags[0];
    const isMaintenance = selectedTag === "onderhoud";
    const isRelocation = selectedTag === "verplaatsen";

    useEffect(() => {
        if (isMaintenance && hangarA) {
            setHangarB(hangarA);
            console.log(
                "[Dynamic Form] Auto-synced Hangar B to Hangar A for maintenance"
            );
        }
    }, [hangarA, isMaintenance]);

    const validateForm = (): { isValid: boolean; errorMessage: string } => {
        if (!selectedDate) {
            return { isValid: false, errorMessage: "Selecteer een datum" };
        }
        if (!title.trim()) {
            return { isValid: false, errorMessage: "Vul een titel in" };
        }
        if (!selectedTag) {
            return { isValid: false, errorMessage: "Selecteer een tag" };
        }

        if (isMaintenance) {
            if (!hangarA.trim()) {
                return {
                    isValid: false,
                    errorMessage: "Vul een startlocatie in voor onderhoud",
                };
            }
        }

        if (isRelocation) {
            if (!hangarA.trim() || !hangarB.trim()) {
                return {
                    isValid: false,
                    errorMessage:
                        "Vul zowel start- als eindlocatie in voor verplaatsing",
                };
            }
            if (hangarA === hangarB) {
                return {
                    isValid: false,
                    errorMessage:
                        "Start- en eindlocatie moeten verschillen voor verplaatsing",
                };
            }
        }
        return { isValid: true, errorMessage: "" };
    };

    const handleAdd = async () => {
        const validation = validateForm();
        if (!validation.isValid) {
            Alert.alert("Fout", validation.errorMessage);
            return;
        }
        try {
            console.log("[CreateActivityScreen] Saving activity...");
            setIsSaving(true);

            await addActivity({
                title,
                aircraft,
                hangarA,
                hangarB,
                date: selectedDate!,
                time,
                tailnumber: Number(tailnumber) || 0,
                resources,
                employee: selectedEmployees.join(","),
                tags: selectedTag || "", // Use first selected tag
                isImportant,
            });

            console.log("[CreateActivityScreen] Activity saved Successfully");
            router.back();
        } catch (error) {
            console.error("[CreateActivityScreen] Error saving:", error);

            Alert.alert(
                "Fout",
                "Kon activiteit niet opslaan. Probeer opnieuw.",
                [{ text: "OK" }]
            );
        } finally {
            setIsSaving(false);
        }
    };

    const getDynamicStyles = () => {
        const tagInfo = tags.find((t) => t.value === selectedTag);
        return {
            accentColor: tagInfo ? tagInfo.color : "#ED7914",
        };
    };
    const dynamicStyles = getDynamicStyles();
    return (
        <View style={styles.screen}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={{ paddingBottom: 120 }}
            >
                {/* Title */}
                <View style={styles.fullWidthInputContainer}>
                    <Text style={styles.inputTitle}>Title</Text>
                    <TextInput
                        placeholder="Title"
                        value={title}
                        onChangeText={setTitle}
                        style={styles.input}
                        placeholderTextColor="rgba(255, 255, 255, 0.6)"
                    />
                </View>

                {/* Date & Time Row */}
                <View style={styles.rowWrapper}>
                    <View style={styles.halfWidthInputWrapper}>
                        <Text style={styles.inputTitle}>Datum</Text>
                        <TouchableOpacity
                            onPress={() => setIsCalendarVisible(true)}
                            style={styles.input}
                        >
                            <Text
                                style={{
                                    color: "rgba(255, 255, 255, 0.6)",
                                }}
                            >
                                {date || "00/00/2025"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.halfWidthInputWrapper}>
                        <Text style={styles.inputTitle}>Starttijd</Text>
                        <TextInput
                            placeholder="09:00"
                            value={time}
                            onChangeText={setTime}
                            style={styles.input}
                            placeholderTextColor="rgba(255, 255, 255, 0.6)"
                        />
                    </View>
                </View>

                <View style={styles.fullWidthInputContainer}>
                    <MultiSelectComponent
                        label="Activiteit"
                        placeholder="Selecteer een activiteit"
                        data={tags}
                        value={selectedTags}
                        onChange={setSelectedTags}
                        mode="single"
                        theme="dark"
                        required={true}
                    />
                </View>

                {isMaintenance && (
                    <View style={styles.helpBox}>
                        <Text style={styles.helpText}>
                            Onderhoud: De kist blijft op dezelfde locatie.
                        </Text>
                    </View>
                )}

                {isRelocation && (
                    <View style={styles.helpBox}>
                        <Text style={styles.helpText}>
                            Transport: Het vliegtuig wordt verplaatst tussen
                            hangars
                        </Text>
                    </View>
                )}

                {/* Resources Section */}
                <Text style={styles.resourceTitle}>
                    Koppel mensen & middelen
                </Text>
                <View style={[styles.resourceSection]}>
                    {/* Medewerkers */}
                    <View style={styles.resourceInputWrapper}>
                        <MultiSelectComponent
                            label="Medewerkers"
                            placeholder="Selecteer medewerkers"
                            data={medewerkers}
                            value={selectedEmployees}
                            onChange={setSelectedEmployees}
                            mode="multiple"
                            theme="light"
                            maxSelections={5}
                        />
                    </View>
                    {/**
                     * CONDITIONAL HELP TEXT
                     *
                     * Teaching Point: Conditional Rendering with &&
                     *
                     * Pattern: {condition && <Component />}
                     * - If condition is true, render Component
                     * - If condition is false, render nothing
                     *
                     * This is shorthand for:
                     * {condition ? <Component /> : null}
                     */}
                    {isMaintenance ? (
                        <View style={styles.resourceInputWrapper}>
                            <Text style={styles.resourceInputLabel}>
                                Locatie (Onderhoud)
                            </Text>
                            <TextInput
                                placeholder="Hangar A"
                                value={hangarA}
                                onChangeText={setHangarA}
                                style={[
                                    styles.resourceTextInput,
                                    { borderColor: dynamicStyles.accentColor },
                                ]}
                                placeholderTextColor="rgba(0, 77, 125, 0.4)"
                                editable={!isSaving}
                            />
                            <Text style={styles.infoText}>
                                ℹ️ Het vliegtuig blijft op deze locatie
                            </Text>
                        </View>
                    ) : (
                        // RELOCATION or NO SELECTION: Two location fields
                        <View style={styles.rowWrapper}>
                            <View style={styles.halfWidthInputWrapper}>
                                <View style={styles.resourceInputWrapper}>
                                    <Text style={styles.resourceInputLabel}>
                                        {isRelocation ? "Startlocatie" : "Van"}
                                    </Text>
                                    <TextInput
                                        placeholder="Hangar A"
                                        value={hangarA}
                                        onChangeText={setHangarA}
                                        style={[styles.resourceTextInput]}
                                        placeholderTextColor="rgba(0, 77, 125, 0.4)"
                                        editable={!isSaving}
                                    />
                                </View>
                            </View>

                            <View style={styles.halfWidthInputWrapper}>
                                <View style={styles.resourceInputWrapper}>
                                    <Text style={styles.resourceInputLabel}>
                                        {isRelocation ? "Eindlocatie" : "Naar"}
                                    </Text>
                                    <TextInput
                                        placeholder="Hangar B"
                                        value={hangarB}
                                        onChangeText={setHangarB}
                                        style={[styles.resourceTextInput]}
                                        placeholderTextColor="rgba(0, 77, 125, 0.4)"
                                        editable={!isSaving}
                                    />
                                </View>
                            </View>
                        </View>
                    )}

                    {/* kisten & tailnummers */}
                    <View style={styles.rowWrapper}>
                        <View style={styles.halfWidthInputWrapper}>
                            <View style={styles.resourceInputWrapper}>
                                <Text style={styles.resourceInputLabel}>
                                    Kisten
                                </Text>
                                <TextInput
                                    placeholder="Apache"
                                    value={aircraft}
                                    onChangeText={setAircraft}
                                    style={styles.resourceTextInput}
                                    placeholderTextColor="rgba(0, 77, 125, 0.4)"
                                />
                            </View>
                        </View>

                        <View style={styles.halfWidthInputWrapper}>
                            <View style={styles.resourceInputWrapper}>
                                <Text style={styles.resourceInputLabel}>
                                    Tailnummer
                                </Text>
                                <TextInput
                                    placeholder="102"
                                    value={tailnumber}
                                    onChangeText={setTailnumber}
                                    style={styles.resourceTextInput}
                                    placeholderTextColor="rgba(0, 77, 125, 0.4)"
                                />
                            </View>
                        </View>
                    </View>

                    {/* Middelen */}
                    <View style={styles.resourceInputWrapper}>
                        <Text style={styles.resourceInputLabel}>Middelen</Text>
                        <TextInput
                            placeholder="Middel 1"
                            value={resources}
                            onChangeText={setResources}
                            style={styles.resourceTextInput}
                            placeholderTextColor="rgba(0, 77, 125, 0.4)"
                        />
                    </View>

                    {/* Buttons */}
                </View>
                <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => setIsImportant(!isImportant)}
                    disabled={isSaving}
                >
                    <View
                        style={[
                            styles.checkbox,
                            isImportant && styles.checkboxChecked,
                        ]}
                    >
                        {isImportant && (
                            <Ionicons name="checkmark" size={18} color="#fff" />
                        )}
                    </View>
                    <Text style={styles.checkboxLabel}>
                        Markeer als belangrijk
                    </Text>
                </TouchableOpacity>
                {isSaving ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#ED7914" />
                        <Text style={styles.loadingText}>Opslaan...</Text>
                    </View>
                ) : (
                    <View style={styles.saveButtonContainer}>
                        <View style={styles.saveButton}>
                            <Button
                                color={"#ED7914"}
                                title="Opslaan"
                                onPress={handleAdd}
                            />
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Calendar Modal */}
            <Modal
                visible={isCalendarVisible}
                transparent
                animationType="slide"
                statusBarTranslucent
                presentationStyle="overFullScreen"
                onRequestClose={() => setIsCalendarVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Calendar
                            onDayPress={(day) => {
                                const dateObj = new Date(day.dateString);
                                setSelectedDate(dateObj);
                                setDate(
                                    dateObj.toLocaleDateString("nl-NL", {
                                        month: "short",
                                        day: "2-digit",
                                    })
                                );
                                setIsCalendarVisible(false);
                            }}
                        />
                        <Button
                            title="Close"
                            onPress={() => setIsCalendarVisible(false)}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#00002D",
    },

    container: {
        flex: 1,
        width: "100%",
        paddingHorizontal: 20,
    },

    /* ---------- ROWS ---------- */
    rowWrapper: {
        flexDirection: "row",
        gap: 12,
        width: "100%",
    },

    halfWidthInputWrapper: {
        flex: 1,
        marginBottom: 16,
    },

    /* ---------- INDIVIDUAL INPUTS ---------- */
    fullWidthInputContainer: {
        width: "100%",
        marginBottom: 16,
    },

    inputTitle: {
        fontSize: 14,
        color: "#fff",
    },

    input: {
        width: "100%",
        height: 44,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderTopLeftRadius: 0,
        borderBottomRightRadius: 0,
        borderLeftWidth: 1,
        borderTopWidth: 0,
        borderRightWidth: 0,
        borderBottomWidth: 1,
        borderColor: "#ccc",
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        color: "rgba(255, 255, 255, 0.9)",
        justifyContent: "center",
    },

    /* ---------- RESOURCE SECTIONS ---------- */
    resourceTitle: {
        fontSize: 24,
        color: "#fff",
        marginTop: 10,
    },
    resourceSection: {
        width: "100%",
        marginTop: 10,
        marginVertical: 20,
        backgroundColor: "#fff",
        borderRadius: 24,
        paddingVertical: 12,
        paddingHorizontal: 8,
    },

    resourceInputWrapper: {
        width: "100%",
        flexDirection: "column",
        justifyContent: "center",
        padding: 6,
        borderRadius: 8,
    },

    resourceInputLabel: {
        fontSize: 14,
        color: "#004D7D",
    },

    resourceTextInput: {
        width: "100%",
        height: 44,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderTopLeftRadius: 0,
        borderBottomRightRadius: 0,
        borderLeftWidth: 1,
        borderTopWidth: 0,
        borderRightWidth: 0,
        borderBottomWidth: 1,
        borderColor: "#004D7D",
        backgroundColor: "rgba(0, 77, 125, 0.2)",
        color: "#004D7D",
        alignSelf: "center",
    },

    /* ---------- MODAL ---------- */
    modalContainer: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },

    modalContent: {
        backgroundColor: "white",
        borderRadius: 20,
        padding: 20,
        width: "80%",
        height: "60%",
    },
    loadingContainer: {
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: "#fff",
    },
    saveButtonContainer: {
        paddingHorizontal: 20,
        width: "100%",
        alignItems: "flex-end",
        marginTop: 10,
    },
    saveButton: {
        width: "50%",
    },
    helpBox: {
        backgroundColor: "rgba(237, 121, 20, 0.15)",
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        borderLeftWidth: 3,
        borderLeftColor: "#ED7914",
    },
    helpText: {
        color: "#fff",
        fontSize: 14,
    },
    infoText: {
        marginTop: 4,
        fontSize: 12,
        color: "#004D7D",
        fontStyle: "italic",
    },
    checkboxContainer: {
        flexDirection: "row-reverse",
        alignItems: "flex-end",
        backgroundColor: "rgba(237, 121, 20, 0.1)",
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        borderRightWidth: 3,
        borderRightColor: "#ED7914",
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: "#ED7914",
        backgroundColor: "transparent",
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 12,
    },
    checkboxChecked: {
        backgroundColor: "#ED7914",
        borderColor: "#ED7914",
    },
    checkboxLabelContainer: {
        flex: 1,
    },
    checkboxLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
        marginBottom: 2,
    },
    checkboxInfoText: {
        fontSize: 12,
        color: "rgba(255, 255, 255, 0.7)",
    },
});
