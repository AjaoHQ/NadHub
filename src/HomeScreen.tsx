// src/HomeScreen.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";

const HomeScreen: React.FC = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>NadHub – Home</Text>
            <Text>Welcome to NadHub Home Screen</Text>
        </View>
    );
};

export default HomeScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
        backgroundColor: "#f5f5f5",
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 8,
    },
});
