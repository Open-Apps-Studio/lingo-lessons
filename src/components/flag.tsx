import { Image } from "expo-image";
import React from "react";
import { StyleSheet, View } from "react-native";

import { colors } from "@/lib/theme";

/**
 * Round country flags (HatScripts/circle-flags, MIT). Keyed by course id so
 * screens never deal with country codes (pt-en intentionally maps to Brazil,
 * matching the course content's Brazilian Portuguese).
 */
const FLAGS: Record<string, number> = {
  "de-en": require("@/assets/images/flags/de.svg"),
  "es-en": require("@/assets/images/flags/es.svg"),
  "fr-en": require("@/assets/images/flags/fr.svg"),
  "it-en": require("@/assets/images/flags/it.svg"),
  "ja-en": require("@/assets/images/flags/jp.svg"),
  "ko-en": require("@/assets/images/flags/kr.svg"),
  "pt-en": require("@/assets/images/flags/br.svg"),
  "zh-en": require("@/assets/images/flags/cn.svg"),
};

export function Flag({ courseId, size = 28 }: { courseId: string; size?: number }) {
  const source = FLAGS[courseId];
  if (!source) return null;
  return (
    <View
      style={[
        styles.ring,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Image
        source={source}
        style={{ width: size, height: size }}
        contentFit="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.neutral200,
  },
});
