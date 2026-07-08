import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";

import { exitScreen } from "@/lib/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { CloseButton } from "@/components/close-button";
import { DuoButton } from "@/components/duo-button";
import { FillBlank } from "@/components/exercises/fill-blank";
import { Match } from "@/components/exercises/match";
import { Select } from "@/components/exercises/select";
import { TypeAnswer } from "@/components/exercises/type-answer";
import { WordBank } from "@/components/exercises/word-bank";
import { speakTarget, useSfx } from "@/lib/audio";
import { useCourseContent } from "@/lib/content";
import { haptics } from "@/lib/haptics";
import {
  currentStreak,
  dueSrsWords,
  useProgress,
  XP_PER_LESSON,
  XP_PERFECT_BONUS,
} from "@/lib/store";
import { radius, useThemeColors } from "@/lib/theme";
import type { Exercise } from "@/lib/types";

type Status = "none" | "correct" | "wrong";
type Answer = number | number[] | string | null;

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,!?¿¡;:"'、。！？]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function checkAnswer(exercise: Exercise, answer: Answer): boolean {
  switch (exercise.type) {
    case "select":
    case "fillBlank":
      return answer === exercise.correct;
    case "wordBank": {
      if (!Array.isArray(answer)) return false;
      const attempt = answer.map((i) => exercise.tokens[i]).join(" ");
      return normalize(attempt) === normalize(exercise.answer.join(" "));
    }
    case "typeAnswer": {
      if (typeof answer !== "string") return false;
      const attempt = normalize(answer);
      return [exercise.answer, ...exercise.alternatives].some(
        (a) => normalize(a) === attempt
      );
    }
    case "match":
      return answer === "done";
  }
}

function correctAnswerText(exercise: Exercise): string {
  switch (exercise.type) {
    case "select":
      return exercise.options[exercise.correct].text;
    case "fillBlank":
      return exercise.sentence.replace("___", exercise.options[exercise.correct]);
    case "wordBank":
      return exercise.answer.join(" ");
    case "typeAnswer":
      return exercise.answer;
    case "match":
      return "";
  }
}

function answerIsReady(exercise: Exercise, answer: Answer): boolean {
  switch (exercise.type) {
    case "select":
    case "fillBlank":
      return typeof answer === "number";
    case "wordBank":
      return Array.isArray(answer) && answer.length > 0;
    case "typeAnswer":
      return typeof answer === "string" && answer.trim().length > 0;
    case "match":
      return answer === "done";
  }
}

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const progress = useProgress();
  const { activeCourseId } = progress;
  const courseProgress = progress.course();
  const { pack, getLesson, allWords, getWord } = useCourseContent(activeCourseId);
  const sfx = useSfx();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const isMistakes = id === "mistakes";
  const isSrs = id === "srs";

  const buildSrsExercises = (dueWords: string[]): Exercise[] => {
    const pool = allWords();
    return dueWords.slice(0, 10).flatMap((target) => {
      const word = getWord(target);
      if (!word) return [];
      const distractors = pool
        .filter((w) => w.target !== target)
        .slice(0, 3)
        .map((w) => ({ text: w.native }));
      const options = [{ text: word.native, emoji: word.emoji }, ...distractors].slice(
        0,
        4
      );
      const correctIndex = options.findIndex((o) => o.text === word.native);
      return [
        {
          type: "select" as const,
          id: `srs-${target}`,
          mode: "targetToNative" as const,
          prompt: "What does this mean?",
          audioTarget: word.target,
          options,
          correct: correctIndex >= 0 ? correctIndex : 0,
        },
      ];
    });
  };

  const { exercises, lessonId, alreadyCompleted } = useMemo(() => {
    if (isMistakes) {
      const list = courseProgress.mistakes
        .map((m) => {
          const ref = getLesson(m.lessonId);
          return ref?.lesson.exercises.find((e) => e.id === m.exerciseId);
        })
        .filter((e): e is Exercise => !!e)
        .slice(0, 10);
      return { exercises: list, lessonId: "mistakes", alreadyCompleted: true };
    }
    if (isSrs) {
      const due = dueSrsWords(courseProgress.srs);
      return {
        exercises: buildSrsExercises(due),
        lessonId: "srs",
        alreadyCompleted: true,
      };
    }
    const ref = getLesson(id ?? "");
    return {
      exercises: ref?.lesson.exercises ?? [],
      lessonId: ref?.lesson.id ?? "",
      alreadyCompleted: !!courseProgress.completedLessons[ref?.lesson.id ?? ""],
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, activeCourseId, courseProgress.mistakes, courseProgress.srs]);

  const isPractice = isMistakes || isSrs || alreadyCompleted;

  const [queue, setQueue] = useState<Exercise[]>(exercises);
  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState<Status>("none");
  const [answer, setAnswer] = useState<Answer>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const wrongIds = useRef(new Set<string>());
  const [finished, setFinished] = useState(false);
  const finishedRef = useRef(false);

  useEffect(() => {
    setQueue(exercises);
    setIndex(0);
    setStatus("none");
    setAnswer(null);
    setCorrectCount(0);
    wrongIds.current = new Set();
    setFinished(false);
    finishedRef.current = false;
  }, [exercises]);

  const exercise = queue[index];
  const total = exercises.length;
  const percentage = total === 0 ? 0 : Math.min(100, (correctCount / total) * 100);

  const progressBar = useSharedValue(0);
  useEffect(() => {
    progressBar.set(withSpring(percentage, { damping: 20, stiffness: 160 }));
  }, [percentage, progressBar]);
  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progressBar.get()}%`,
  }));

  useEffect(() => {
    if (!exercise && total > 0 && !finishedRef.current) {
      finishedRef.current = true;
      const perfect = wrongIds.current.size === 0;
      progress.completeLesson(lessonId, perfect);
      sfx.playFinish();
      haptics.celebrate();
      setFinished(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercise, total, lessonId, isPractice]);

  if (total === 0) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          <Text style={styles.finishTitle}>Nothing to practice yet!</Text>
          <DuoButton label="Back" onPress={() => exitScreen()} />
        </View>
      </SafeAreaView>
    );
  }

  if (finished) {
    const perfect = wrongIds.current.size === 0;
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          <Animated.View entering={ZoomIn.springify().damping(12)}>
            <Image
              source={require("@/assets/images/mascot.svg")}
              style={styles.finishMascot}
              contentFit="contain"
            />
          </Animated.View>
          <Animated.Text entering={FadeInUp.delay(150)} style={styles.finishTitle}>
            {isMistakes
              ? "Mistakes conquered!"
              : isSrs
                ? "Review complete!"
                : "Lesson complete!"}
          </Animated.Text>
          <Animated.View entering={FadeInUp.delay(300)} style={styles.resultRow}>
            <ResultCard
              label="Total XP"
              value={`${XP_PER_LESSON + (perfect ? XP_PERFECT_BONUS : 0)}`}
              icon={<Ionicons name="flash" size={20} color={colors.amber} />}
              color={colors.amber}
            />
            <ResultCard
              label="Streak"
              value={`${currentStreak(progress)}`}
              icon={
                <MaterialCommunityIcons name="fire" size={22} color={colors.orange} />
              }
              color={colors.orange}
            />
          </Animated.View>
          {perfect ? (
            <Animated.Text entering={FadeInUp.delay(450)} style={styles.perfect}>
              Perfect lesson! +{XP_PERFECT_BONUS} XP
            </Animated.Text>
          ) : null}
          <Animated.View
            entering={FadeInUp.delay(450)}
            style={{ alignSelf: "stretch" }}
          >
            <DuoButton label="Continue" onPress={() => exitScreen()} />
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  if (!exercise) return <SafeAreaView style={styles.screen} />;

  const onCheck = () => {
    const isCorrect = checkAnswer(exercise, answer);
    if (isCorrect) {
      sfx.playCorrect();
      haptics.success();
      setStatus("correct");
      setCorrectCount((c) => c + 1);
      progress.clearMistake(exercise.id);
      if (exercise.type === "select" && exercise.audioTarget) {
        if (isSrs) progress.reviewSrsWord(exercise.audioTarget, true);
        else progress.recordWord(exercise.audioTarget, true);
        if (exercise.mode === "nativeToTarget")
          speakTarget(activeCourseId, exercise.audioTarget);
      }
    } else {
      sfx.playIncorrect();
      haptics.error();
      setStatus("wrong");
      wrongIds.current.add(exercise.id);
      if (!isMistakes && !isSrs) {
        progress.addMistake({ lessonId, exerciseId: exercise.id });
      }
      if (exercise.type === "select" && exercise.audioTarget) {
        if (isSrs) progress.reviewSrsWord(exercise.audioTarget, false);
        else progress.recordWord(exercise.audioTarget, false);
      }
    }
  };

  const onContinue = () => {
    if (status === "wrong") setQueue((q) => [...q, exercise]);
    setStatus("none");
    setAnswer(null);
    setIndex((i) => i + 1);
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <CloseButton />
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, progressBarStyle]}>
              <View style={styles.progressShine} />
            </Animated.View>
          </View>
          {isPractice ? (
            <View style={styles.practicePill}>
              <Ionicons name="infinite" size={24} color={colors.skyDark} />
            </View>
          ) : null}
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
        >
          {exercise.type === "select" && (
            <Select
              exercise={exercise}
              answer={typeof answer === "number" ? answer : null}
              onAnswer={setAnswer}
              status={status}
              targetLanguage={pack.targetLanguage}
            />
          )}
          {exercise.type === "wordBank" && (
            <WordBank
              exercise={exercise}
              answer={Array.isArray(answer) ? answer : []}
              onAnswer={setAnswer}
              status={status}
            />
          )}
          {exercise.type === "match" && (
            <Match
              exercise={exercise}
              onComplete={(wrongAttempts) => {
                if (wrongAttempts > 0) {
                  sfx.playIncorrect();
                  wrongIds.current.add(exercise.id);
                  if (!isMistakes) {
                    progress.addMistake({ lessonId, exerciseId: exercise.id });
                  }
                  setQueue((q) => [...q, exercise]);
                } else {
                  sfx.playCorrect();
                  progress.clearMistake(exercise.id);
                  setCorrectCount((c) => c + 1);
                }
                setStatus("none");
                setAnswer(null);
                setIndex((i) => i + 1);
              }}
              onWordResult={(target, ok) => progress.recordWord(target, ok)}
            />
          )}
          {exercise.type === "typeAnswer" && (
            <TypeAnswer
              exercise={exercise}
              answer={typeof answer === "string" ? answer : ""}
              onAnswer={setAnswer}
              status={status}
              targetLanguage={pack.targetLanguage}
            />
          )}
          {exercise.type === "fillBlank" && (
            <FillBlank
              exercise={exercise}
              answer={typeof answer === "number" ? answer : null}
              onAnswer={setAnswer}
              status={status}
            />
          )}
        </ScrollView>

        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom + 8, 24) },
            status === "correct" && { backgroundColor: colors.correctBg },
            status === "wrong" && { backgroundColor: colors.wrongBg },
          ]}
        >
          {status === "correct" && (
            <Animated.View entering={FadeInDown.duration(200)} style={styles.feedbackRow}>
              <Ionicons name="checkmark-circle" size={26} color={colors.correctText} />
              <Text style={[styles.feedback, { color: colors.correctText }]}>
                Nicely done!
              </Text>
            </Animated.View>
          )}
          {status === "wrong" && (
            <Animated.View entering={FadeInDown.duration(200)}>
              <View style={styles.feedbackRow}>
                <Ionicons name="close-circle" size={26} color={colors.wrongText} />
                <Text style={[styles.feedback, { color: colors.wrongText }]}>
                  Correct answer:
                </Text>
              </View>
              <Text style={[styles.feedbackDetail, { color: colors.wrongText }]}>
                {correctAnswerText(exercise)}
              </Text>
            </Animated.View>
          )}
          {status === "none" ? (
            <DuoButton
              label="Check"
              onPress={onCheck}
              disabled={!answerIsReady(exercise, answer)}
            />
          ) : (
            <DuoButton
              label="Continue"
              variant={status === "wrong" ? "danger" : "secondary"}
              onPress={onContinue}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ResultCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  color: string;
}) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={[styles.resultCard, { borderColor: color }]}>
      <View style={[styles.resultCardHeader, { backgroundColor: color }]}>
        <Text style={styles.resultCardLabel}>{label}</Text>
      </View>
      <View style={styles.resultCardBody}>
        {icon}
        <Text style={[styles.resultCardValue, { color }]}>{value}</Text>
      </View>
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useThemeColors>) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingHorizontal: 10,
      paddingVertical: 8,
    },
    progressTrack: {
      flex: 1,
      height: 14,
      borderRadius: radius.full,
      backgroundColor: colors.neutral200,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      borderRadius: radius.full,
      backgroundColor: colors.greenLight,
      justifyContent: "center",
    },
    progressShine: {
      height: 4,
      marginHorizontal: 8,
      borderRadius: radius.full,
      backgroundColor: "rgba(255,255,255,0.35)",
    },
    practicePill: {
      flexDirection: "row",
      alignItems: "center",
      minWidth: 44,
      height: 44,
      justifyContent: "center",
    },
    body: { padding: 20, paddingBottom: 40 },
    footer: {
      padding: 16,
      gap: 12,
      borderTopWidth: 2,
      borderTopColor: colors.neutral200,
    },
    feedbackRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    feedback: { fontSize: 20, fontWeight: "800" },
    feedbackDetail: { fontSize: 16, fontWeight: "600", marginTop: 2, marginLeft: 34 },
    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      gap: 18,
    },
    finishMascot: { width: 130, height: 130 },
    finishTitle: {
      fontSize: 26,
      fontWeight: "800",
      color: colors.neutral700,
      textAlign: "center",
    },
    mutedCenter: { fontSize: 15, color: colors.textMuted, textAlign: "center" },
    perfect: { fontSize: 15, fontWeight: "700", color: colors.amber },
    resultRow: { flexDirection: "row", gap: 14 },
    resultCard: {
      borderWidth: 2,
      borderRadius: radius.lg,
      overflow: "hidden",
      minWidth: 130,
    },
    resultCardHeader: { paddingVertical: 6, alignItems: "center" },
    resultCardLabel: {
      color: colors.white,
      fontWeight: "800",
      fontSize: 12,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    resultCardBody: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingVertical: 12,
      backgroundColor: colors.neutral100,
    },
    resultCardValue: {
      textAlign: "center",
      fontSize: 22,
      fontWeight: "800",
    },
  });
