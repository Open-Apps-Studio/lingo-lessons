import { router } from "expo-router";
import { Image } from "expo-image";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DuoButton } from "@/components/duo-button";
import { Flag } from "@/components/flag";
import { catalog, orderedCourses } from "@/lib/content";
import { DAILY_GOAL_OPTIONS, DEFAULT_COURSE, useProgress } from "@/lib/store";
import { colors, radius } from "@/lib/theme";

export default function OnboardingScreen() {
  const finishOnboarding = useProgress((s) => s.finishOnboarding);
  const [courseId, setCourseId] = useState(
    catalog.courses.some((c) => c.id === DEFAULT_COURSE)
      ? DEFAULT_COURSE
      : (orderedCourses[0]?.id ?? "es-en")
  );
  const [goal, setGoal] = useState<number>(20);

  const selected = catalog.courses.find((c) => c.id === courseId);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.body}>
        <Image
          source={require("@/assets/images/mascot.svg")}
          style={styles.mascot}
          contentFit="contain"
        />
        <Text style={styles.title}>Welcome!</Text>
        <Text style={styles.subtitle}>
          Pick a language and start learning with bite-sized lessons, real audio, and
          spaced repetition.
        </Text>

        <Text style={styles.sectionLabel}>I want to learn</Text>
        <View style={styles.langGrid}>
          {orderedCourses.map((course) => (
            <Pressable
              key={course.id}
              onPress={() => setCourseId(course.id)}
              style={[styles.langChip, courseId === course.id && styles.langChipActive]}
            >
              <Flag courseId={course.id} size={32} />
              <Text
                style={[
                  styles.langName,
                  courseId === course.id && styles.langNameActive,
                ]}
              >
                {course.targetLanguage}
              </Text>
              <Text style={styles.langMeta}>
                {course.unitCount} units · {course.lessonCount} lessons
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Daily XP goal</Text>
        <View style={styles.goals}>
          {DAILY_GOAL_OPTIONS.map((g) => (
            <Pressable
              key={g}
              onPress={() => setGoal(g)}
              style={[styles.goalChip, goal === g && styles.goalChipActive]}
            >
              <Text style={[styles.goalText, goal === g && styles.goalTextActive]}>
                {g} XP
              </Text>
              <Text style={[styles.goalHint, goal === g && styles.goalTextActive]}>
                {g <= 10 ? "Casual" : g <= 20 ? "Regular" : g <= 30 ? "Serious" : "Intense"}
              </Text>
            </Pressable>
          ))}
        </View>

        <DuoButton
          label={selected ? `Learn ${selected.targetLanguage}` : "Start learning"}
          onPress={() => {
            finishOnboarding(courseId, goal);
            router.replace("/(tabs)");
          }}
          style={{ alignSelf: "stretch" }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  body: { padding: 24, gap: 16, paddingBottom: 40 },
  mascot: { width: 100, height: 100, alignSelf: "center" },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.neutral700,
    textAlign: "center",
  },
  subtitle: { fontSize: 15, color: colors.textMuted, textAlign: "center", lineHeight: 22 },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.neutral700,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 8,
  },
  langGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  langChip: {
    flexBasis: "47%",
    flexGrow: 1,
    borderWidth: 2,
    borderColor: colors.neutral200,
    borderRadius: radius.lg,
    padding: 14,
    gap: 4,
  },
  langChipActive: {
    borderColor: colors.green,
    backgroundColor: colors.greenLight + "22",
  },
  langName: { fontSize: 17, fontWeight: "800", color: colors.neutral700 },
  langNameActive: { color: colors.greenDark },
  langMeta: { fontSize: 11, color: colors.textMuted },
  goals: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  goalChip: {
    flexBasis: "47%",
    flexGrow: 1,
    borderWidth: 2,
    borderColor: colors.neutral200,
    borderRadius: radius.lg,
    padding: 14,
    alignItems: "center",
    gap: 2,
  },
  goalChipActive: {
    borderColor: colors.green,
    backgroundColor: colors.greenLight + "22",
  },
  goalText: { fontSize: 18, fontWeight: "800", color: colors.neutral700 },
  goalTextActive: { color: colors.greenDark },
  goalHint: { fontSize: 12, color: colors.textMuted },
});
