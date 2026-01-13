import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { MultiSelect } from "react-native-element-dropdown";

type Option = {
    label: string;
    value: string;
    color?: string;
};

type selectMode = "single" | "multiple";
type Theme = "light" | "dark";

type Props = {
    label: string;
    placeholder: string;
    data: Option[];
    value: string[];
    onChange: (value: string[]) => void;

    mode?: selectMode;
    theme?: Theme;
    showChips?: boolean;
    maxSelections?: number;
    disabled?: boolean;
    error?: boolean;
    helperText?: string;
    required?: boolean;
};

export function MultiSelectComponent({
    label,
    placeholder,
    data,
    value,
    onChange,
    mode = "multiple",
    theme = "light",
    showChips = true,
    maxSelections,
    disabled = false,
    error,
    helperText,
    required = false,
}: Props) {
    const selectedItems = value
        .map((v) => data.find((d) => d.value === v))
        .filter(Boolean) as Option[];

    const isSingleMode = mode === "single";
    const hasReachedLimit = maxSelections
        ? value.length >= maxSelections
        : false;

    const handleChange = (newValue: string[]) => {
        if (isSingleMode) {
            onChange(newValue.slice(-1));
        } else if (maxSelections && newValue.length > maxSelections) {
            return;
        } else {
            onChange(newValue);
        }
    };

    const getThemeStyles = () => {
        if (theme === "dark") {
            return {
                labelColor: "#fff",
                borderColor: "#ccc",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                textColor: "#004D7D",
                placeholderColor: "rgba(255, 255, 255, 0.6)",
                chipBgColor: "rgba(255, 255, 255, 1)",
                chipTextColor: "#fff",
            };
        }

        return {
            labelColor: "#004D7D",
            borderColor: "#004D7D",
            backgroundColor: "rgba(0, 77, 125, 0.2)",
            textColor: "#004D7D",
            placeholderColor: "rgba(0, 77, 125, 0.5)",
            chipBgColor: "rgba(0, 77, 125, 0.8)",
            chipTextColor: "#fff",
        };
    };

    const themeStyles = getThemeStyles();

    const renderSelectedChips = () => {
        if (!showChips || selectedItems.length === 0) return null;
        return (
            <View style={styles.selectedOverlay} pointerEvents="none">
                {selectedItems.map((item) => (
                    <View
                        key={item.value}
                        style={[
                            styles.chip,
                            {
                                backgroundColor: item.color
                                    ? `${item.color}CC` // Add opacity to custom color
                                    : themeStyles.chipBgColor,
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.chipText,
                                { color: themeStyles.chipTextColor },
                            ]}
                        >
                            {item.label}
                        </Text>
                    </View>
                ))}
            </View>
        );
    };

    const renderHelperText = () => {
        if (error) {
            return <Text style={styles.errorText}>{error}</Text>;
        }
        if (helperText) {
            return (
                <Text
                    style={[
                        styles.helperText,
                        { color: themeStyles.labelColor },
                    ]}
                >
                    {helperText}
                </Text>
            );
        }
        return null;
    };

    const inputStyles: ViewStyle[] = [
        styles.input,
        {
            borderColor: error ? "#ff6b6b" : themeStyles.borderColor,
            backgroundColor: themeStyles.backgroundColor,
            opacity: disabled ? 0.5 : 1,
        },
    ];
    return (
        <View style={styles.wrapper}>
            {/* Label with optional required indicator */}
            <View style={styles.labelRow}>
                <Text style={[styles.label, { color: themeStyles.labelColor }]}>
                    {label}
                    {required && <Text style={styles.requiredStar}> *</Text>}
                </Text>

                {/* Show selection count and limit for multiple mode */}
                {!isSingleMode && maxSelections && (
                    <Text
                        style={[
                            styles.countText,
                            { color: themeStyles.labelColor },
                        ]}
                    >
                        {value.length}/{maxSelections}
                    </Text>
                )}
            </View>

            {/* Selected items overlay (chips) */}
            {renderSelectedChips()}

            {/* The actual MultiSelect component */}
            <MultiSelect
                style={inputStyles}
                containerStyle={styles.dropdownContainer}
                itemTextStyle={[
                    styles.itemText,
                    { color: themeStyles.textColor },
                ]}
                placeholderStyle={[
                    styles.placeholder,
                    { color: themeStyles.placeholderColor },
                ]}
                inputSearchStyle={[
                    styles.searchInput,
                    {
                        borderColor: themeStyles.borderColor,
                        color: themeStyles.textColor,
                    },
                ]}
                iconStyle={styles.icon}
                activeColor={`${themeStyles.borderColor}25`} // 25 = 15% opacity
                data={data}
                labelField="label"
                valueField="value"
                placeholder={value.length ? "" : placeholder}
                search
                searchPlaceholder="Zoeken..."
                value={value}
                onChange={handleChange}
                maxHeight={250}
                disable={disabled || hasReachedLimit}
                selectedTextStyle={{ display: "none" }} // Hide default selected text
                renderSelectedItem={() => <View />} // Custom rendering via chips
            />

            {/* Helper text or error message */}
            {renderHelperText()}

            {/* Max selections warning */}
            {hasReachedLimit && !error && (
                <Text style={styles.warningText}>
                    Maximum {maxSelections} selecties bereikt
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        width: "100%",
        marginBottom: 4,
    },

    labelRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },

    label: {
        fontSize: 14,
        fontWeight: "500",
    },

    requiredStar: {
        color: "#ff6b6b",
        fontSize: 14,
    },

    countText: {
        fontSize: 12,
        fontStyle: "italic",
    },

    input: {
        minHeight: 44,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderTopLeftRadius: 0,
        borderBottomRightRadius: 0,
        borderLeftWidth: 1,
        borderBottomWidth: 1,
        justifyContent: "center",
    },

    placeholder: {
        fontSize: 14,
    },

    dropdownContainer: {
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },

    itemText: {
        fontSize: 14,
        paddingVertical: 8,
    },

    searchInput: {
        height: 40,
        borderRadius: 8,
        paddingHorizontal: 8,
        fontSize: 14,
    },

    icon: {
        width: 20,
        height: 20,
    },

    /**
     * CHIPS (Selected Items Display)
     */
    selectedOverlay: {
        position: "absolute",
        top: 32,
        left: 12,
        right: 40, // Leave space for dropdown icon
        zIndex: 2,
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 4,
    },

    chip: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 2,
    },

    chipText: {
        fontSize: 12,
        fontWeight: "500",
    },

    /**
     * HELPER TEXT & ERRORS
     */
    helperText: {
        fontSize: 12,
        marginTop: 4,
        fontStyle: "italic",
    },

    errorText: {
        fontSize: 12,
        color: "#ff6b6b",
        marginTop: 4,
    },

    warningText: {
        fontSize: 12,
        color: "#f59e0b",
        marginTop: 4,
        fontStyle: "italic",
    },
});
