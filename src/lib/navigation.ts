import { router } from "expo-router";

/** Back if there's history, otherwise home — deep links have no stack to pop. */
export function exitScreen() {
  if (router.canGoBack()) router.back();
  else router.replace("/");
}
