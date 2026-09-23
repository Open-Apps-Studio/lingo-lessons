import { useLocalSearchParams } from "expo-router";

import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CloseButton } from "@/components/close-button";
import { SpeakerButton } from "@/components/speaker-button";
import { useCourseContent } from "@/lib/content";
import { useProgress } from "@/lib/store";
import { makeThemedStyles, radius } from "@/lib/theme";

function GuidebookText({ markdown }: { markdown: string }) {
  const styles = useStyles();
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
  const styles = useStyles();
  const { unitId } = useLocalSearchParams<{ unitId: string }>();
  const activeCourseId = useProgress((s) => s.activeCourseId);
  const { getUnit } = useCourseContent(activeCourseId);
  const unit = getUnit(unitId ?? "");

  if (!unit) {
    return (
      <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
        <View style={styles.topBar}>
          <CloseButton />
          <Text style={styles.title} maxFontSizeMultiplier={1.2}>
            Guidebook
          </Text>
          <View style={{ width: 44 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle} maxFontSizeMultiplier={1.3}>
            Guidebook not found
          </Text>
          <Text style={styles.emptySubtitle} maxFontSizeMultiplier={1.3}>
            This unit could not be found for the active course.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <View style={styles.topBar}>
        <CloseButton />
        <Text style={styles.title} numberOfLines={1} maxFontSizeMultiplier={1.2}>
          {unit.title} Guidebook
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.description}>{unit.description}</Text>
        <GuidebookText markdown={unit.guidebook} />

        <Text style={styles.heading}>Key words</Text>
        <View style={{ gap: 8 }}>
          {unit.words.map((word, i) => (
            <View key={`${word.target}-${i}`} style={styles.wordRow}>
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

const useStyles = makeThemedStyles((colors) => StyleSheet.create({
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
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 8,
  },
  emptyTitle: { fontSize: 20, fontWeight: "800", color: colors.neutral700, textAlign: "center" },
  emptySubtitle: { fontSize: 15, color: colors.textMuted, textAlign: "center" },
}));
