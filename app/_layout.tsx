import { Stack } from "expo-router";
import React from "react";
import { ActivityProvider } from "./context/ActivityContext";

export default function Layout() {
    return (
        <ActivityProvider>
            <Stack
                screenOptions={{
                    headerStyle: { backgroundColor: "#00002D" },
                    headerTintColor: "#fff",
                    headerTitleStyle: { fontWeight: "bold" },
                }}
            />
        </ActivityProvider>
    );
}
