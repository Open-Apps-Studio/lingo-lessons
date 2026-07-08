import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DuoButton } from "@/components/duo-button";
import { Flag } from "@/components/flag";
import { SpeakerButton } from "@/components/speaker-button";
import { useCourseContent } from "@/lib/content";
import { dueInDays } from "@/lib/srs";
import { dailyQuests, dueSrsWords, useProgress, type Quest } from "@/lib/store";
import { radius, useThemeColors } from "@/lib/theme";

export default function PracticeScreen() {
  const progress = useProgress();
  const { activeCourseId } = progress;
  const courseProgress = progress.course();
  const { pack, allWords } = useCourseContent(activeCourseId);
  const dueWords = dueSrsWords(courseProgress.srs);
  const quests = dailyQuests(progress);
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const uniqueWords = [...new Map(allWords().map((w) => [w.target, w] as const)).values()];
  const words = uniqueWords
    .map((w) => ({
      ...w,
      stat: courseProgress.wordStats[w.target],
      srs: courseProgress.srs[w.target],
    }))
    .filter((w) => w.stat);

  const QuestRow = ({ quest }: { quest: Quest }) => {
    const pct = (quest.value / quest.target) * 100;
    return (
      <View style={styles.questRow}>
        <View style={{ flex: 1, gap: 6 }}>
          <Text
            style={[styles.questLabel, quest.done && { color: colors.textMuted }]}
            maxFontSizeMultiplier={1.3}
          >
            {quest.label}
          </Text>
          <View style={styles.questTrack}>
            <View
              style={[
                styles.questFill,
                { width: `${pct}%` },
                quest.done && { backgroundColor: colors.green },
              ]}
            />
            <Text style={styles.questCount} maxFontSizeMultiplier={1.1}>
              {quest.value}/{quest.target}
            </Text>
          </View>
        </View>
        <Ionicons
          name={quest.done ? "checkmark-circle" : "ellipse-outline"}
          size={28}
          color={quest.done ? colors.green : colors.neutral300}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.heading}>Practice</Text>
        <View style={styles.courseRow}>
          <Flag courseId={activeCourseId} size={20} />
          <Text style={styles.courseLabel}>{pack.targetLanguage}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="treasure-chest" size={24} color={colors.amber} />
            <Text style={styles.cardTitle}>Daily quests</Text>
          </View>
          {quests.map((quest) => (
            <QuestRow key={quest.id} quest={quest} />
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="brain" size={24} color={colors.indigo} />
            <Text style={styles.cardTitle}>Spaced review</Text>
          </View>
          <Text style={styles.cardSubtitle}>
            {dueWords.length === 0
              ? "No words due right now. Keep learning!"
              : `${dueWords.length} word${dueWords.length === 1 ? "" : "s"} ready to review.`}
          </Text>
          <DuoButton
            label="Review words"
            variant="primary"
            disabled={dueWords.length === 0}
            onPress={() => router.push("/lesson/srs")}
          />
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="bandage" size={24} color={colors.rose} />
            <Text style={styles.cardTitle}>Mistakes</Text>
          </View>
          <Text style={styles.cardSubtitle}>
            {courseProgress.mistakes.length === 0
              ? "No mistakes to review. Nice!"
              : `${courseProgress.mistakes.length} exercise${courseProgress.mistakes.length === 1 ? "" : "s"} to fix.`}
          </Text>
          <DuoButton
            label="Practice mistakes"
            variant="primary"
            disabled={courseProgress.mistakes.length === 0}
            onPress={() => router.push("/lesson/mistakes")}
          />
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="book" size={24} color={colors.greenDark} />
            <Text style={styles.cardTitle}>Words ({words.length})</Text>
          </View>
          {words.length === 0 ? (
            <Text style={styles.cardSubtitle}>
              Words you learn will show up here with their strength.
            </Text>
          ) : (
            words
              .sort((a, b) => (b.stat?.lastSeen ?? 0) - (a.stat?.lastSeen ?? 0))
              .map((word) => {
                const total = (word.stat?.correct ?? 0) + (word.stat?.wrong ?? 0);
                const strength = total === 0 ? 0 : (word.stat!.correct / total) * 100;
                const due = word.srs ? dueInDays(word.srs) : null;
                return (
                  <View key={word.target} style={styles.wordRow}>
                    <SpeakerButton text={word.target} size={36} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.wordTarget}>
                        {word.emoji} {word.target}
                      </Text>
                      <Text style={styles.wordNative}>{word.native}</Text>
                      {due !== null && due === 0 ? (
                        <Text style={styles.dueBadge}>Due now</Text>
                      ) : due !== null && due <= 3 ? (
                        <Text style={styles.dueSoon}>Review in {due}d</Text>
                      ) : null}
                    </View>
                    <View style={styles.strengthTrack}>
                      <View
                        style={[
                          styles.strengthFill,
                          {
                            width: `${strength}%`,
                            backgroundColor:
                              strength >= 70
                                ? colors.green
                                : strength >= 40
                                  ? colors.amber
                                  : colors.rose,
                          },
                        ]}
                      />
                    </View>
                  </View>
                );
              })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ReturnType<typeof useThemeColors>) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    body: { padding: 20, gap: 16, paddingBottom: 60 },
    heading: { fontSize: 26, fontWeight: "800", color: colors.neutral700 },
    courseRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: -8 },
    courseLabel: { fontSize: 14, fontWeight: "700", color: colors.textMuted },
    cardHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
    card: {
      borderWidth: 2,
      borderColor: colors.neutral200,
      borderRadius: radius.xl,
      padding: 18,
      gap: 12,
      backgroundColor: colors.neutral100,
    },
    cardTitle: { fontSize: 19, fontWeight: "800", color: colors.neutral700 },
    cardSubtitle: { fontSize: 14, color: colors.textMuted },
    wordRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 6,
    },
    wordTarget: { fontSize: 16, fontWeight: "700", color: colors.text },
    wordNative: { fontSize: 13, color: colors.textMuted },
    dueBadge: { fontSize: 11, fontWeight: "700", color: colors.rose, marginTop: 2 },
    dueSoon: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
    strengthTrack: {
      width: 64,
      height: 10,
      borderRadius: radius.full,
      backgroundColor: colors.neutral200,
      overflow: "hidden",
    },
    strengthFill: { height: "100%", borderRadius: radius.full },
    questRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    questLabel: { fontSize: 15, fontWeight: "700", color: colors.text },
    questTrack: {
      height: 16,
      borderRadius: radius.full,
      backgroundColor: colors.neutral200,
      overflow: "hidden",
      justifyContent: "center",
    },
    questFill: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      borderRadius: radius.full,
      backgroundColor: colors.amber,
    },
    questCount: {
      fontSize: 10,
      fontWeight: "800",
      color: colors.neutral700,
      textAlign: "center",
    },
  });
