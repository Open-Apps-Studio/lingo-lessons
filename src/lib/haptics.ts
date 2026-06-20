import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

/** Haptics no-op on web; guard so calls are safe everywhere. */
const enabled = Platform.OS !== "web";

export const haptics = {
  /** Light tick for taps on options, chips, and match pairs. */
  tap() {
    if (enabled) Haptics.selectionAsync().catch(() => {});
  },
  /** Correct answer. */
  success() {
    if (enabled)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {}
      );
  },
  /** Wrong answer. */
  error() {
    if (enabled)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
  },
  /** Lesson finished. */
  celebrate() {
    if (enabled)
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
  },
};
