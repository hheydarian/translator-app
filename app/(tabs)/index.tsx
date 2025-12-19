import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

export default function HomeScreen() {
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");

const handleTranslate = async () => {
  if (!inputText.trim()) {
    setTranslatedText("لطفاً متنی وارد کنید");
    return;
  }

  setTranslatedText("در حال ترجمه...");

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      inputText
    )}&langpair=en|fa`;

    const response = await fetch(url);
    const data = await response.json();

    setTranslatedText(data.responseData.translatedText);
  } catch (error) {
    setTranslatedText("خطا در اتصال به سرویس ترجمه");
  }
};


  return (
    <View style={styles.container}>
      <Text style={styles.title}>اپلیکیشن ترجمه متن</Text>

      <TextInput
        style={styles.input}
        placeholder="متن خود را وارد کنید"
        value={inputText}
        onChangeText={setInputText}
        multiline
      />

      <TouchableOpacity style={styles.button} onPress={handleTranslate}>
        <Text style={styles.buttonText}>ترجمه</Text>
      </TouchableOpacity>

      <View style={styles.resultBox}>
        <Text style={styles.resultText}>{translatedText}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#f9f9f9",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: "top",
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#1976d2",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  resultBox: {
    backgroundColor: "#e3f2fd",
    padding: 12,
    borderRadius: 8,
    minHeight: 60,
  },
  resultText: {
    fontSize: 16,
  },
});
