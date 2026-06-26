"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export interface UseWebcamOptions {
  autoStart?: boolean;
  audioEnabled?: boolean;
  videoConstraints?: MediaTrackConstraints;
}

export interface UseWebcamReturn {
  // Refs
  videoRef: React.RefObject<HTMLVideoElement | null>;
  streamRef: React.RefObject<MediaStream | null>;

  // State
  isEnabled: boolean;
  isLoading: boolean;
  isReady: boolean;
  error: string | null;

  // Actions
  start: () => Promise<void>;
  stop: () => void;
  toggle: () => Promise<void>;
  clearError: () => void;

  // Audio control
  toggleAudio: (enabled: boolean) => void;
}

export function useWebcam(options: UseWebcamOptions = {}): UseWebcamReturn {
  const { autoStart = false, audioEnabled = false, videoConstraints } = options;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsReady(false);
    setIsEnabled(false);
  }, []);

  const start = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // Check if mediaDevices is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Votre navigateur ne supporte pas l'accès à la caméra.");
      setIsLoading(false);
      setIsEnabled(false);
      return;
    }

    // Check for video devices
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      if (videoDevices.length === 0) {
        setError("Aucune caméra détectée. Veuillez connecter une caméra et réessayer.");
        setIsLoading(false);
        setIsEnabled(false);
        return;
      }
    } catch (enumError) {
      console.warn("Could not enumerate devices:", enumError);
    }

    try {
      let stream: MediaStream;

      // Try with ideal constraints first
      const defaultConstraints: MediaTrackConstraints = {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: "user",
        ...videoConstraints,
      };

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: defaultConstraints,
          audio: audioEnabled,
        });
      } catch {
        // Fallback to basic constraints
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: audioEnabled,
          });
        } catch {
          // Try video only
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
        }
      }

      streamRef.current = stream;
      setIsEnabled(true);
      setIsReady(true);

      // Assign stream to video element
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play()
            .then(() => {
              setIsLoading(false);
              setError(null);
            })
            .catch((playError: { name?: string }) => {
              if (playError?.name !== "AbortError") {
                console.error("Error playing video:", playError);
              }
              setIsLoading(false);
            });
        } else {
          setIsLoading(false);
        }
      }, 50);
    } catch (err) {
      console.error("Error accessing webcam:", err);
      setIsLoading(false);
      setIsEnabled(false);

      const error = err as { name?: string };
      let errorMessage = "Impossible d'accéder à la webcam.";

      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        errorMessage = "Permission refusée. Veuillez autoriser l'accès à la caméra dans les paramètres de votre navigateur.";
      } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
        errorMessage = "Aucune caméra trouvée. Veuillez connecter une caméra et réessayer.";
      } else if (error.name === "NotReadableError" || error.name === "TrackStartError") {
        errorMessage = "La caméra est déjà utilisée par une autre application. Veuillez la fermer et réessayer.";
      } else if (error.name === "OverconstrainedError" || error.name === "ConstraintNotSatisfiedError") {
        errorMessage = "Impossible d'accéder à la caméra avec les paramètres disponibles.";
      }

      setError(errorMessage);
    }
  }, [audioEnabled, videoConstraints]);

  const toggle = useCallback(async () => {
    if (isEnabled) {
      stop();
    } else {
      setIsEnabled(true);
      await start();
    }
  }, [isEnabled, start, stop]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const toggleAudio = useCallback((enabled: boolean) => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  // Auto-start if enabled - use a ref to track if we've already attempted
  const hasAutoStarted = useRef(false);
  useEffect(() => {
    if (autoStart && !hasAutoStarted.current && !isEnabled && !isLoading) {
      hasAutoStarted.current = true;
      // Defer to next tick to avoid synchronous setState warning
      queueMicrotask(() => {
        start();
      });
    }
  }, [autoStart, isEnabled, isLoading, start]);

  // Update video element when stream is ready
  useEffect(() => {
    if (videoRef.current && streamRef.current && isEnabled && isReady) {
      const video = videoRef.current;
      const stream = streamRef.current;

      if (video.srcObject !== stream) {
        video.srcObject = stream;
      }

      video.play().catch((error: { name?: string }) => {
        if (error?.name !== "AbortError") console.error("Error playing video:", error);
      });
    }
  }, [isEnabled, isReady]);

  return {
    videoRef,
    streamRef,
    isEnabled,
    isLoading,
    isReady,
    error,
    start,
    stop,
    toggle,
    clearError,
    toggleAudio,
  };
}

