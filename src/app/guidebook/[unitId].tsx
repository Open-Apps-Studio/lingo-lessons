import { useLocalSearchParams } from "expo-router";

import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CloseButton } from "@/components/close-button";
import { SpeakerButton } from "@/components/speaker-button";
import { useCourseContent } from "@/lib/content";
import { useProgress } from "@/lib/store";
import { radius, useThemeColors } from "@/lib/theme";

function GuidebookText({
  markdown,
  styles,
}: {
  markdown: string;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={{ gap: 10 }}>
      {markdown.split("\n").map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return null;
        const isHeading = trimmed.startsWith("#");
        const clean = trimmed
          .replace(/^#+\s*/, "")
          .replace(/^[*-]\s+/, "•  ")
          .replace(/\*+/g, "");
        return (
          <Text key={i} style={isHeading ? styles.heading : styles.paragraph}>
            {clean}
          </Text>
        );
      })}
    </View>
  );
}

export default function GuidebookScreen() {
  const { unitId } = useLocalSearchParams<{ unitId: string }>();
  const activeCourseId = useProgress((s) => s.activeCourseId);
  const { getUnit } = useCourseContent(activeCourseId);
  const unit = getUnit(unitId ?? "");
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (!unit) return null;

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <View style={styles.topBar}>
        <CloseButton />
        <Text style={styles.title} numberOfLines={1}>
          {unit.title} Guidebook
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.description}>{unit.description}</Text>
        <GuidebookText markdown={unit.guidebook} styles={styles} />

        <Text style={styles.heading}>Key words</Text>
        <View style={{ gap: 8 }}>
          {unit.words.map((word) => (
            <View key={word.target} style={styles.wordRow}>
              <SpeakerButton text={word.target} size={36} />
              <Text style={styles.wordText}>
                {word.emoji} {word.target} — {word.native}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ReturnType<typeof useThemeColors>) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderBottomWidth: 2,
      borderBottomColor: colors.neutral200,
    },
    title: { fontSize: 17, fontWeight: "800", color: colors.neutral700 },
    body: { padding: 20, gap: 14, paddingBottom: 60 },
    description: {
      fontSize: 15,
      color: colors.textMuted,
      backgroundColor: colors.neutral100,
      borderRadius: radius.md,
      padding: 12,
    },
    heading: { fontSize: 19, fontWeight: "800", color: colors.neutral700, marginTop: 8 },
    paragraph: { fontSize: 15, color: colors.text, lineHeight: 22 },
    wordRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    wordText: { fontSize: 16, color: colors.text, fontWeight: "600", flexShrink: 1 },
  });
