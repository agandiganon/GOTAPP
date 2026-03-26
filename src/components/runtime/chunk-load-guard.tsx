"use client";

import { useEffect } from "react";

const RECOVERY_KEY = "gotspoil.chunk-recovery-attempted";
const RECOVERY_PARAM = "__gotspoil_recover";
const RECOVERY_RESET_MS = 8000;

function getAssetUrlFromTarget(target: EventTarget | null) {
  if (target instanceof HTMLScriptElement) {
    return target.src;
  }

  if (target instanceof HTMLLinkElement) {
    return target.href;
  }

  return "";
}

function isRecoverableChunkAsset(url: string) {
  return url.includes("/_next/static/");
}

function isRecoverableChunkError(reason: unknown) {
  const message =
    typeof reason === "string"
      ? reason
      : reason instanceof Error
        ? `${reason.name} ${reason.message}`
        : typeof reason === "object" && reason && "message" in reason
          ? String((reason as { message?: unknown }).message ?? "")
          : "";

  return (
    message.includes("ChunkLoadError") ||
    message.includes("Loading chunk") ||
    message.includes("Failed to fetch dynamically imported module") ||
    message.includes("/_next/static/")
  );
}

function attemptRecovery() {
  if (typeof window === "undefined") {
    return;
  }

  if (window.sessionStorage.getItem(RECOVERY_KEY)) {
    return;
  }

  window.sessionStorage.setItem(RECOVERY_KEY, String(Date.now()));
  const url = new URL(window.location.href);
  url.searchParams.set(RECOVERY_PARAM, String(Date.now()));
  window.location.replace(url.toString());
}

export function ChunkLoadGuard() {
  useEffect(() => {
    const url = new URL(window.location.href);

    if (url.searchParams.has(RECOVERY_PARAM)) {
      url.searchParams.delete(RECOVERY_PARAM);
      window.history.replaceState({}, "", url.toString());
    }

    const resetTimer = window.setTimeout(() => {
      window.sessionStorage.removeItem(RECOVERY_KEY);
    }, RECOVERY_RESET_MS);

    const onAssetError = (event: Event) => {
      const assetUrl = getAssetUrlFromTarget(event.target);

      if (assetUrl && isRecoverableChunkAsset(assetUrl)) {
        attemptRecovery();
      }
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (isRecoverableChunkError(event.reason)) {
        attemptRecovery();
      }
    };

    window.addEventListener("error", onAssetError, true);
    window.addEventListener("unhandledrejection", onUnhandledRejection);

    return () => {
      window.clearTimeout(resetTimer);
      window.removeEventListener("error", onAssetError, true);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  return null;
}
