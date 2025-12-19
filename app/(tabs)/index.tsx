import { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    I18nManager,
} from "react-native";
import { useFonts } from "expo-font";
import * as Clipboard from "expo-clipboard";

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

type Lang = "fa" | "en";

export default function HomeScreen() {
    const [inputText, setInputText] = useState("");
    const [translatedText, setTranslatedText] = useState("");
    const [fromLang, setFromLang] = useState<Lang>("en");
    const [toLang, setToLang] = useState<Lang>("fa");
    const [loading, setLoading] = useState(false);
    const [dark, setDark] = useState(false);

    const [fontsLoaded] = useFonts({
        Vazirmatn: require("../../assets/fonts/Vazirmatn-Regular.ttf"),
    });

    const handleTranslate = async () => {
        if (!inputText.trim()) {
            setTranslatedText("لطفاً متنی وارد کنید");
            return;
        }

        setLoading(true);
        setTranslatedText("");

        try {
            const cleanText = encodeURIComponent(inputText.trim());
            const langPair = `${fromLang}|${toLang}`;

            const response = await fetch(
                `https://api.mymemory.translated.net/get?q=${cleanText}&langpair=${langPair}`
            );
            const data = await response.json();

            if (data?.responseData?.translatedText) {
                setTranslatedText(data.responseData.translatedText);
            } else {
                setTranslatedText("ترجمه‌ای یافت نشد");
            }
        } catch {
            setTranslatedText("خطا در اتصال به سرویس ترجمه");
        } finally {
            setLoading(false);
        }
    };

    const swapLanguages = () => {
        setFromLang(toLang);
        setToLang(fromLang);
        setInputText(translatedText);
        setTranslatedText("");
    };

    const copyText = async () => {
        if (translatedText) {
            await Clipboard.setStringAsync(translatedText);
        }
    };

    if (!fontsLoaded) return null;

    const theme = dark ? darkTheme : lightTheme;

    return (
        <View style={[styles.container, theme.bg]}>
            <Text style={[styles.title, theme.text]}>مترجم متن</Text>

            {/* Language Card */}
            <View style={[styles.card, theme.card]}>
                <View style={styles.langRow}>
                    <Text style={[styles.langLabel, theme.subText]}>
                        {fromLang === "fa" ? "فارسی" : "English"}
                    </Text>

                    <TouchableOpacity
                        style={styles.swapBtn}
                        onPress={swapLanguages}>
                        <Text style={styles.swapText}>⇄</Text>
                    </TouchableOpacity>

                    <Text style={[styles.langLabel, theme.subText]}>
                        {toLang === "fa" ? "فارسی" : "English"}
                    </Text>
                </View>
            </View>

            {/* Input Card */}
            <View style={[styles.card, theme.card]}>
                <TextInput
                    style={[styles.input, theme.text]}
                    placeholder="متن را وارد کنید"
                    placeholderTextColor={theme.placeholder}
                    value={inputText}
                    onChangeText={setInputText}
                    multiline
                    textAlign="right"
                />
            </View>

            {/* Button */}
            <TouchableOpacity style={styles.button} onPress={handleTranslate}>
                <Text style={styles.buttonText}>ترجمه</Text>
            </TouchableOpacity>

            {/* Result Card */}
            <View style={[styles.card, theme.card]}>
                {loading ? (
                    <ActivityIndicator />
                ) : (
                    <Text style={[styles.resultText, theme.text]}>
                        {translatedText}
                    </Text>
                )}
            </View>

            {/* Actions */}
            <View style={styles.actions}>
                <TouchableOpacity onPress={copyText}>
                    <Text style={styles.action}>📋 کپی</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setDark(!dark)}>
                    <Text style={styles.action}>
                        {dark ? "☀️ روشن" : "🌙 تاریک"}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

/* ===================== STYLES ===================== */

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: "center",
    },
    title: {
        fontFamily: "Vazirmatn",
        fontSize: 26,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 24,
    },
    card: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 14,
    },
    langRow: {
        flexDirection: "row-reverse",
        justifyContent: "space-between",
        alignItems: "center",
    },
    langLabel: {
        fontFamily: "Vazirmatn",
        fontSize: 14,
    },
    swapBtn: {
        backgroundColor: "#2563eb",
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 999,
    },
    swapText: {
        color: "#fff",
        fontSize: 16,
    },
    input: {
        fontFamily: "Vazirmatn",
        minHeight: 120,
        textAlignVertical: "top",
        fontSize: 16,
    },
    button: {
        backgroundColor: "#2563eb",
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: "center",
        marginVertical: 10,
    },
    buttonText: {
        fontFamily: "Vazirmatn",
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    resultText: {
        fontFamily: "Vazirmatn",
        fontSize: 16,
        lineHeight: 28,
        textAlign: "right",
    },
    actions: {
        marginTop: 10,
        flexDirection: "row-reverse",
        justifyContent: "space-between",
    },
    action: {
        fontFamily: "Vazirmatn",
        fontSize: 14,
        color: "#2563eb",
    },
});

/* ===================== THEMES ===================== */

const lightTheme = {
    bg: { backgroundColor: "#f8fafc" },
    card: { backgroundColor: "#ffffff" },
    text: { color: "#0f172a" },
    subText: { color: "#475569" },
    placeholder: "#94a3b8",
};

const darkTheme = {
    bg: { backgroundColor: "#020617" },
    card: { backgroundColor: "#020617" },
    text: { color: "#e5e7eb" },
    subText: { color: "#9ca3af" },
    placeholder: "#64748b",
};
