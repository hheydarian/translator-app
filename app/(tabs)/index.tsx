import { useMemo, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    I18nManager,
    ScrollView,
    Platform,
    StatusBar,
} from "react-native";
import { useFonts } from "expo-font";
import * as Clipboard from "expo-clipboard";
import { SafeAreaView } from "react-native-safe-area-context";

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

type Lang = "en" | "ar" | "tr" | "fr" | "de" | "es" | "ru";

const LANGS: { code: Lang; label: string; hint: string }[] = [
    { code: "en", label: "English", hint: "Hello world" },
    { code: "ar", label: "العربية", hint: "مرحبا" },
    { code: "tr", label: "Türkçe", hint: "Merhaba" },
    { code: "fr", label: "Français", hint: "Bonjour" },
    { code: "de", label: "Deutsch", hint: "Hallo" },
    { code: "es", label: "Español", hint: "Hola" },
    { code: "ru", label: "Русский", hint: "Привет" },
];

export default function HomeScreen() {
    const [fromLang, setFromLang] = useState<Lang>("en");
    const [inputText, setInputText] = useState("");
    const [translatedText, setTranslatedText] = useState("");
    const [loading, setLoading] = useState(false);
    const [dark, setDark] = useState(false);

    const [fontsLoaded] = useFonts({
        Vazirmatn: require("../../assets/fonts/Vazirmatn-Regular.ttf"),
        Lalezar: require("../../assets/fonts/Lalezar-Regular.ttf"),
    });

    const t = dark ? darkTheme : lightTheme;

    const selectedLang = useMemo(
        () => LANGS.find((x) => x.code === fromLang) ?? LANGS[0],
        [fromLang]
    );

    const handleTranslate = async () => {
        const text = inputText.trim();
        if (!text) {
            setTranslatedText("لطفاً متنی وارد کنید");
            return;
        }

        setLoading(true);
        setTranslatedText("");

        try {
            const encoded = encodeURIComponent(text);
            const url = `https://api.mymemory.translated.net/get?q=${encoded}&langpair=${fromLang}|fa`;

            const res = await fetch(url);
            const data = await res.json();

            const result =
                data?.responseData?.translatedText ||
                data?.matches?.[0]?.translation ||
                "";

            setTranslatedText(result ? result : "ترجمه‌ای یافت نشد");
        } catch {
            setTranslatedText("خطا در اتصال به سرویس ترجمه");
        } finally {
            setLoading(false);
        }
    };

    const copy = async () => {
        if (translatedText?.trim()) {
            await Clipboard.setStringAsync(translatedText);
        }
    };

    const clearAll = () => {
        setInputText("");
        setTranslatedText("");
    };

    if (!fontsLoaded) return null;

    return (
        <SafeAreaView style={[styles.safe, t.bg]}>
            <StatusBar
                barStyle={dark ? "light-content" : "dark-content"}
                backgroundColor="transparent"
                translucent={false}
            />

            <View style={[styles.root, t.bg]}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerTitles}>
                        <Text style={[styles.brand, t.text]}>
                            مترجم چندزبانه
                        </Text>
                        <Text style={[styles.subtitle, t.subText]}>
                            خروجی همیشه فارسی • سریع و ساده
                        </Text>
                    </View>

                    <TouchableOpacity
                        onPress={() => setDark((v) => !v)}
                        style={[styles.iconBtn, t.cardBorder]}
                        activeOpacity={0.85}>
                        <Text style={[styles.iconBtnText, t.text]}>
                            {dark ? "☀️" : "🌙"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Language chips */}
                <View style={[styles.panel, t.card, t.cardBorder]}>
                    <Text style={[styles.panelTitle, t.text]}>زبان ورودی</Text>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.chipsRow}
                        style={{ transform: [{ scaleX: -1 }] }} // RTL horizontal scroll
                    >
                        <View
                            style={{
                                transform: [{ scaleX: -1 }],
                                flexDirection: "row",
                            }}>
                            {LANGS.map((lang) => {
                                const active = lang.code === fromLang;
                                return (
                                    <TouchableOpacity
                                        key={lang.code}
                                        onPress={() => setFromLang(lang.code)}
                                        style={[
                                            styles.chip,
                                            active ? styles.chipActive : null,
                                            active ? t.chipActiveBg : t.chipBg,
                                            t.cardBorder,
                                        ]}
                                        activeOpacity={0.85}>
                                        <Text
                                            style={[
                                                styles.chipText,
                                                active
                                                    ? styles.chipTextActive
                                                    : null,
                                                active
                                                    ? t.chipActiveText
                                                    : t.subText,
                                            ]}>
                                            {lang.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </ScrollView>

                    <View style={styles.langHintRow}>
                        <Text style={[styles.hintLabel, t.subText]}>مثال:</Text>
                        <Text style={[styles.hint, t.text]}>
                            {selectedLang.hint}
                        </Text>
                    </View>
                </View>

                {/* Input */}
                <View style={[styles.panel, t.card, t.cardBorder]}>
                    <View style={styles.panelHeaderRow}>
                        <Text style={[styles.panelTitleNoMb, t.text]}>
                            متن ورودی
                        </Text>

                        <TouchableOpacity
                            onPress={clearAll}
                            activeOpacity={0.8}>
                            <Text style={[styles.link, t.accent]}>
                                پاک کردن
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <TextInput
                        value={inputText}
                        onChangeText={setInputText}
                        placeholder="متن را وارد کنید…"
                        placeholderTextColor={t.placeholder}
                        multiline
                        style={[styles.input, t.text]}
                        textAlign="left" // ورودی ممکنه انگلیسی/غیرفارسی باشه
                    />
                </View>

                {/* CTA */}
                <TouchableOpacity
                    style={[styles.primaryBtn, t.primaryBtn]}
                    onPress={handleTranslate}
                    activeOpacity={0.9}
                    disabled={loading}>
                    {loading ? (
                        <View style={styles.loadingRow}>
                            <ActivityIndicator color="#fff" />
                            <Text style={styles.primaryBtnText}>
                                در حال ترجمه…
                            </Text>
                        </View>
                    ) : (
                        <Text style={styles.primaryBtnText}>
                            ترجمه به فارسی
                        </Text>
                    )}
                </TouchableOpacity>

                {/* Output */}
                <View style={[styles.panel, t.card, t.cardBorder]}>
                    <View style={styles.panelHeaderRow}>
                        <Text style={[styles.panelTitleNoMb, t.text]}>
                            خروجی فارسی
                        </Text>

                        <TouchableOpacity
                            onPress={copy}
                            disabled={!translatedText.trim()}
                            activeOpacity={0.8}>
                            <Text
                                style={[
                                    styles.link,
                                    translatedText.trim()
                                        ? t.accent
                                        : t.disabledText,
                                ]}>
                                کپی
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={[styles.output, t.text]}>
                        {translatedText ? translatedText : "—"}
                    </Text>
                </View>

                {/* Footer note */}
                <Text style={[styles.footer, t.subText]}>
                    نکته: کیفیت ترجمه به سرویس آنلاین بستگی دارد.
                </Text>
            </View>
        </SafeAreaView>
    );
}

/* ================= UI ================= */

const styles = StyleSheet.create({
    safe: {
        flex: 1,
    },
    root: {
        flex: 1,
        paddingHorizontal: 18,
        paddingTop: Platform.select({ ios: 12, android: 10, default: 10 }),
    },

    /* Header */
    header: {
        marginTop: 6,
        marginBottom: 16,
        flexDirection: "row-reverse",
        justifyContent: "space-between",
        alignItems: "center",
    },
    headerTitles: {
        flex: 1,
        paddingRight: 6,
        alignItems: "flex-end", // تضمین راست‌چین
    },
    brand: {
        fontFamily: "Lalezar", // فقط عنوان با لاله‌زار
        fontSize: 30,
        textAlign: "right",
        letterSpacing: 0.2,
    },
    subtitle: {
        fontFamily: "Vazirmatn",
        fontSize: 13,
        marginTop: 4,
        textAlign: "right",
        opacity: 0.75,
    },
    iconBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
    },
    iconBtnText: {
        fontSize: 18,
    },

    /* Panels */
    panel: {
        borderRadius: 22,
        padding: 16,
        marginBottom: 14,
    },
    panelTitle: {
        fontFamily: "Vazirmatn",
        fontSize: 14,
        fontWeight: "800",
        textAlign: "right",
        alignSelf: "flex-end",
        marginBottom: 10,
    },
    panelTitleNoMb: {
        fontFamily: "Vazirmatn",
        fontSize: 14,
        fontWeight: "800",
        textAlign: "right",
        alignSelf: "flex-end",
    },
    panelHeaderRow: {
        flexDirection: "row-reverse",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },

    /* Chips */
    chipsRow: {
        paddingVertical: 6,
    },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 9,
        borderRadius: 999,
        marginLeft: 8,
    },
    chipActive: {
        transform: [{ scale: 1.05 }],
    },
    chipText: {
        fontFamily: "Vazirmatn",
        fontSize: 13,
    },
    chipTextActive: {
        fontWeight: "900",
    },

    langHintRow: {
        marginTop: 12,
        flexDirection: "row-reverse",
        alignItems: "center",
        alignSelf: "flex-end", // راست‌چین کامل
        gap: 6,
    },
    hintLabel: {
        fontFamily: "Vazirmatn",
        fontSize: 12,
        opacity: 0.7,
        textAlign: "right",
    },
    hint: {
        fontFamily: "Vazirmatn",
        fontSize: 12,
        opacity: 0.9,
        textAlign: "right",
    },

    /* Input */
    input: {
        fontFamily: "Vazirmatn",
        fontSize: 16,
        minHeight: 110,
        textAlignVertical: "top",
        lineHeight: 26,
    },

    /* CTA */
    primaryBtn: {
        borderRadius: 22,
        paddingVertical: 18,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 14,
    },
    primaryBtnText: {
        fontFamily: "Vazirmatn",
        color: "#fff",
        fontSize: 16,
        fontWeight: "900",
        letterSpacing: 0.3,
    },
    loadingRow: {
        flexDirection: "row-reverse",
        alignItems: "center",
        gap: 10,
    },

    /* Output */
    output: {
        fontFamily: "Vazirmatn",
        fontSize: 17,
        lineHeight: 30,
        textAlign: "right",
        minHeight: 56,
    },

    /* Links */
    link: {
        fontFamily: "Vazirmatn",
        fontSize: 13,
        fontWeight: "800",
        textAlign: "right",
    },

    footer: {
        fontFamily: "Vazirmatn",
        fontSize: 12,
        textAlign: "center",
        marginTop: 6,
        marginBottom: 12,
        opacity: 0.6,
    },
});

/* ================= THEMES ================= */

const lightTheme = {
    bg: { backgroundColor: "#f6f7fb" },
    card: { backgroundColor: "#ffffff" },
    cardBorder: { borderWidth: 1, borderColor: "rgba(15,23,42,0.06)" },
    text: { color: "#0f172a" },
    subText: { color: "#475569" },
    placeholder: "rgba(71,85,105,0.55)",
    accent: { color: "#4f46e5" },
    disabledText: { color: "rgba(71,85,105,0.4)" },
    primaryBtn: {
        backgroundColor: "#4f46e5",
        shadowColor: "#4f46e5",
        shadowOpacity: 0.35,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
        elevation: 8,
    },
    chipBg: { backgroundColor: "rgba(79,70,229,0.08)" },
    chipActiveBg: { backgroundColor: "rgba(79,70,229,0.18)" },
    chipActiveText: { color: "#4f46e5" },
};

const darkTheme = {
    bg: { backgroundColor: "#070A12" },
    card: { backgroundColor: "rgba(255,255,255,0.035)" },
    cardBorder: { borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
    text: { color: "#e5e7eb" },
    subText: { color: "rgba(229,231,235,0.65)" },
    placeholder: "rgba(229,231,235,0.35)",
    accent: { color: "#8b85ff" },
    disabledText: { color: "rgba(229,231,235,0.35)" },
    primaryBtn: {
        backgroundColor: "#6d67ff",
        shadowColor: "#6d67ff",
        shadowOpacity: 0.4,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
        elevation: 8,
    },
    chipBg: { backgroundColor: "rgba(109,103,255,0.12)" },
    chipActiveBg: { backgroundColor: "rgba(109,103,255,0.22)" },
    chipActiveText: { color: "#c7c4ff" },
};
