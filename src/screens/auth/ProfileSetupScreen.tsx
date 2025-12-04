import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../../store/auth';

export default function ProfileSetupScreen() {
    const { user, setDisplayName } = useAuth();
    const [name, setName] = useState(user?.displayName || '');

    const handleSave = () => {
        const trimmed = name.trim();
        if (!trimmed) {
            Alert.alert('กรุณากรอกชื่อเล่น', 'ชื่อเล่นจำเป็นสำหรับโปรไฟล์ของคุณ');
            return;
        }

        setDisplayName(trimmed);
        // RootNavigator will automatically switch to MainFlow when displayName is updated
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>ตั้งชื่อโปรไฟล์</Text>
            <Text style={styles.subtitle}>เบอร์โทร: {user?.phone}</Text>

            <TextInput
                style={styles.input}
                placeholder="ชื่อเล่นของคุณ"
                value={name}
                onChangeText={setName}
            />

            <TouchableOpacity style={styles.button} onPress={handleSave}>
                <Text style={styles.buttonText}>บันทึก</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 32,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 16,
        fontSize: 18,
        marginBottom: 24,
        backgroundColor: '#f9f9f9',
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
