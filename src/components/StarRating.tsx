import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type Props = {
    value: number;
    onChange?: (value: number) => void;
    max?: number;
    size?: number;
};

export default function StarRating({ value, onChange, max = 5, size = 24 }: Props) {
    const stars = [];

    for (let i = 1; i <= max; i++) {
        const isFilled = i <= value;
        stars.push(
            <TouchableOpacity
                key={i}
                onPress={() => onChange && onChange(i)}
                disabled={!onChange}
                style={styles.starContainer}
            >
                <Text style={[styles.star, { fontSize: size, color: isFilled ? '#FFD700' : '#E0E0E0' }]}>
                    {isFilled ? '★' : '☆'}
                </Text>
            </TouchableOpacity>
        );
    }

    return (
        <View style={styles.container}>
            {stars}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    starContainer: {
        marginHorizontal: 2,
    },
    star: {
        fontWeight: 'bold',
    },
});
