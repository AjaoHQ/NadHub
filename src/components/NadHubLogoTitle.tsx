import React from "react";
import { Image, StyleSheet, View } from "react-native";

export function NadHubLogoTitle() {
    return (
        <View style={styles.container}>
            <Image
                source={require("../../assets/logo-nadhub-horizontal.png")}
                style={styles.logo}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
    },
    logo: {
        width: 140,
        height: 32,
        resizeMode: "contain",
    },
});
