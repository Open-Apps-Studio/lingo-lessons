import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CloseButton } from "@/components/close-button";
import { Flag } from "@/components/flag";
import { exitScreen } from "@/lib/navigation";
import { orderedCourses } from "@/lib/content";
import { useProgress } from "@/lib/store";
import { colors, radius } from "@/lib/theme";

export default function CoursesScreen() {
  const { activeCourseId, setActiveCourse, courses } = useProgress();

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <View style={styles.topBar}>
        <CloseButton />
        <Text style={styles.title}>Courses</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.subtitle}>Switch language anytime. Progress is saved per course.</Text>
        {orderedCourses.map((course) => {
          const prog = courses[course.id];
          const lessonsDone = prog
            ? Object.keys(prog.completedLessons).length
            : 0;
          const active = course.id === activeCourseId;
          return (
            <Pressable
              key={course.id}
              onPress={() => {
                setActiveCourse(course.id);
                exitScreen();
              }}
              style={[styles.card, active && styles.cardActive]}
            >
              <Flag courseId={course.id} size={44} />
              <View style={{ flex: 1 }}>
                <Text style={styles.langName}>{course.targetLanguage}</Text>
                <Text style={styles.meta}>
                  {lessonsDone}/{course.lessonCount} lessons · {course.unitCount} units
                </Text>
              </View>
              {active ? <Text style={styles.activeBadge}>Active</Text> : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  body: { padding: 20, gap: 12, paddingBottom: 60 },
  subtitle: { fontSize: 14, color: colors.textMuted, marginBottom: 4 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 2,
    borderColor: colors.neutral200,
    borderRadius: radius.xl,
    padding: 16,
  },
  cardActive: { borderColor: colors.green, backgroundColor: colors.greenLight + "18" },
  langName: { fontSize: 18, fontWeight: "800", color: colors.neutral700 },
  meta: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  activeBadge: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.green,
    textTransform: "uppercase",
  },
});
