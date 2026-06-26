"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

const getSocketUrl = () => {
  if (typeof window === "undefined") return "";
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3030";
  return base.replace(/\/$/, "");
};

const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
};

export interface UseWebRTCSocketOptions {
  consultationId: string | null;
  enabled?: boolean;
}

export interface UseWebRTCSocketReturn {
  isConnected: boolean;
  isJoined: boolean;
  error: string | null;
  joinRoom: () => Promise<{ success: boolean; error?: string }>;
  leaveRoom: () => Promise<void>;
  sendOffer: (offer: RTCSessionDescriptionInit) => Promise<void>;
  sendAnswer: (answer: RTCSessionDescriptionInit) => Promise<void>;
  sendIceCandidate: (candidate: RTCIceCandidateInit) => Promise<void>;
  onUserJoined: (cb: (userId: string) => void) => () => void;
  onUserLeft: (cb: (userId: string) => void) => () => void;
  onOffer: (cb: (offer: RTCSessionDescriptionInit, from: string) => void) => () => void;
  onAnswer: (cb: (answer: RTCSessionDescriptionInit, from: string) => void) => () => void;
  onIceCandidate: (cb: (candidate: RTCIceCandidateInit, from: string) => void) => () => void;
}

export function useWebRTCSocket({
  consultationId,
  enabled = true,
}: UseWebRTCSocketOptions): UseWebRTCSocketReturn {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const url = getSocketUrl();
  const token = getToken();

  // Connect socket when enabled and we have url + token
  useEffect(() => {
    if (!enabled || !consultationId || !url || !token) return;

    const socket = io(`${url}/webrtc`, {
      auth: { token },
      path: "/socket.io",
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      setError(null);
    });

    socket.on("disconnect", (reason) => {
      setIsConnected(false);
      setIsJoined(false);
      if (reason === "io server disconnect") {
        setError("Connexion fermée par le serveur");
      }
    });

    socket.on("connect_error", (err) => {
      setIsConnected(false);
      setError(err.message || "Erreur de connexion WebSocket");
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setIsJoined(false);
    };
  }, [enabled, consultationId, url, token]);

  const joinRoom = useCallback(async () => {
    const socket = socketRef.current;
    if (!socket || !consultationId || !isConnected) {
      return { success: false, error: "Non connecté" };
    }

    return new Promise<{ success: boolean; error?: string }>((resolve) => {
      socket.emit("join-room", { consultationId }, (response: { success?: boolean; error?: string }) => {
        if (response?.error) {
          setError(response.error);
          resolve({ success: false, error: response.error });
        } else {
          setIsJoined(true);
          setError(null);
          resolve({ success: true });
        }
      });
    });
  }, [consultationId, isConnected]);

  const leaveRoom = useCallback(async () => {
    const socket = socketRef.current;
    if (!socket || !consultationId) return;

    socket.emit("leave-room", { consultationId });
    setIsJoined(false);
  }, [consultationId]);

  const sendOffer = useCallback(
    async (offer: RTCSessionDescriptionInit) => {
      const socket = socketRef.current;
      if (!socket || !consultationId) return;
      socket.emit("offer", { consultationId, offer });
    },
    [consultationId]
  );

  const sendAnswer = useCallback(
    async (answer: RTCSessionDescriptionInit) => {
      const socket = socketRef.current;
      if (!socket || !consultationId) return;
      socket.emit("answer", { consultationId, answer });
    },
    [consultationId]
  );

  const sendIceCandidate = useCallback(
    async (candidate: RTCIceCandidateInit) => {
      const socket = socketRef.current;
      if (!socket || !consultationId) return;
      socket.emit("ice-candidate", { consultationId, candidate });
    },
    [consultationId]
  );

  const onUserJoined = useCallback((cb: (userId: string) => void) => {
    const socket = socketRef.current;
    if (!socket) return () => {};
    const handler = (data: { userId: string }) => cb(data.userId);
    socket.on("user-joined", handler);
    return () => socket.off("user-joined", handler);
  }, []);

  const onUserLeft = useCallback((cb: (userId: string) => void) => {
    const socket = socketRef.current;
    if (!socket) return () => {};
    const handler = (data: { userId: string }) => cb(data.userId);
    socket.on("user-left", handler);
    return () => socket.off("user-left", handler);
  }, []);

  const onOffer = useCallback((cb: (offer: RTCSessionDescriptionInit, from: string) => void) => {
    const socket = socketRef.current;
    if (!socket) return () => {};
    const handler = (data: { offer: RTCSessionDescriptionInit; from: string }) => cb(data.offer, data.from);
    socket.on("offer", handler);
    return () => socket.off("offer", handler);
  }, []);

  const onAnswer = useCallback((cb: (answer: RTCSessionDescriptionInit, from: string) => void) => {
    const socket = socketRef.current;
    if (!socket) return () => {};
    const handler = (data: { answer: RTCSessionDescriptionInit; from: string }) => cb(data.answer, data.from);
    socket.on("answer", handler);
    return () => socket.off("answer", handler);
  }, []);

  const onIceCandidate = useCallback((cb: (candidate: RTCIceCandidateInit, from: string) => void) => {
    const socket = socketRef.current;
    if (!socket) return () => {};
    const handler = (data: { candidate: RTCIceCandidateInit; from: string }) => cb(data.candidate, data.from);
    socket.on("ice-candidate", handler);
    return () => socket.off("ice-candidate", handler);
  }, []);

  return {
    isConnected,
    isJoined,
    error,
    joinRoom,
    leaveRoom,
    sendOffer,
    sendAnswer,
    sendIceCandidate,
    onUserJoined,
    onUserLeft,
    onOffer,
    onAnswer,
    onIceCandidate,
  };
}
