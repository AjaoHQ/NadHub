import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type LogoSize = "small" | "medium" | "large";

type Props = {
    size?: LogoSize;
};

const sizeMap: Record<LogoSize, { height: number; paddingVertical: number }> = {
    small: { height: 40, paddingVertical: 8 },
    medium: { height: 56, paddingVertical: 12 },
    large: { height: 72, paddingVertical: 16 },
};

export default function NadHubLogoHeader({ size = "medium" }: Props) {
    const config = sizeMap[size];

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <View style={[styles.wrapper, { paddingVertical: config.paddingVertical }]}>
                <Image
                    source={require("../../assets/logo-nadhub-horizontal.png")}
                    style={[styles.logo, { height: config.height }]}
                    resizeMode="contain"
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        backgroundColor: "#000608",
        width: "100%",
    },
    wrapper: {
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
    },
    logo: {
        width: "40%", // Adjust width as needed, or let resizeMode handle it with fixed height
    },
});
