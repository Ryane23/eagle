"use client";

import { useRef, useCallback, useEffect, useState } from "react";

const ICE_SERVERS: RTCConfiguration["iceServers"] = [
  { urls: "stun:stun.l.google.com:19302" },
];

export interface UseWebRTCPeerOptions {
  getLocalStream: () => MediaStream | null;
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
  sendOffer: (offer: RTCSessionDescriptionInit) => Promise<void>;
  sendAnswer: (answer: RTCSessionDescriptionInit) => Promise<void>;
  sendIceCandidate: (candidate: RTCIceCandidateInit) => Promise<void>;
  onOffer: (cb: (offer: RTCSessionDescriptionInit) => void) => () => void;
  onAnswer: (cb: (answer: RTCSessionDescriptionInit) => void) => () => void;
  onIceCandidate: (cb: (candidate: RTCIceCandidateInit) => void) => () => void;
}

export interface UseWebRTCPeerReturn {
  createOffer: () => Promise<void>;
  close: () => void;
  isReady: boolean;
}

export function useWebRTCPeer({
  getLocalStream,
  remoteVideoRef,
  sendOffer,
  sendAnswer,
  sendIceCandidate,
  onOffer,
  onAnswer,
  onIceCandidate,
}: UseWebRTCPeerOptions): UseWebRTCPeerReturn {
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const [isReady, setIsReady] = useState(false);

  const remoteStreamRef = useRef<MediaStream | null>(null);

  const getOrCreatePeer = useCallback((): RTCPeerConnection => {
    if (peerRef.current) return peerRef.current;
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    peerRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendIceCandidate(event.candidate.toJSON());
      }
    };

    pc.ontrack = (event) => {
      const remoteVideo = remoteVideoRef.current;
      if (!remoteVideo || !event.streams[0]) return;
      // Use a single stream and add tracks to it - avoids replacing srcObject
      // which would abort any pending play()
      if (!remoteStreamRef.current) {
        remoteStreamRef.current = new MediaStream();
        remoteVideo.srcObject = remoteStreamRef.current;
        remoteVideo.classList.remove("hidden");
      }
      event.streams[0].getTracks().forEach((track) => {
        if (!remoteStreamRef.current!.getTracks().some((t) => t.id === track.id)) {
          remoteStreamRef.current!.addTrack(track);
        }
      });
      remoteVideo.play().catch((err) => {
        if (err?.name !== "AbortError") console.warn("Remote video play failed:", err);
      });
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") {
        setIsReady(true);
      } else if (
        pc.connectionState === "failed" ||
        pc.connectionState === "disconnected" ||
        pc.connectionState === "closed"
      ) {
        setIsReady(false);
      }
    };

    return pc;
  }, [sendIceCandidate, remoteVideoRef]);

  const addLocalTracks = useCallback(
    (pc: RTCPeerConnection) => {
      const stream = getLocalStream();
      if (!stream) return;
      const existingTrackIds = new Set(pc.getSenders().map((s) => s.track?.id).filter(Boolean));
      stream.getTracks().forEach((track: MediaStreamTrack) => {
        if (!existingTrackIds.has(track.id)) {
          pc.addTrack(track, stream);
          existingTrackIds.add(track.id);
        }
      });
    },
    [getLocalStream]
  );

  const close = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    remoteStreamRef.current = null;
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
      remoteVideoRef.current.classList.add("hidden");
    }
    setIsReady(false);
  }, [remoteVideoRef]);

  const createOffer = useCallback(async () => {
    const pc = getOrCreatePeer();
    addLocalTracks(pc);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await sendOffer(offer);
  }, [getOrCreatePeer, addLocalTracks, sendOffer]);

  const handleOffer = useCallback(
    async (offer: RTCSessionDescriptionInit) => {
      const pc = getOrCreatePeer();
      addLocalTracks(pc);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      await sendAnswer(answer);
    },
    [getOrCreatePeer, addLocalTracks, sendAnswer]
  );

  const handleAnswer = useCallback(async (answer: RTCSessionDescriptionInit) => {
    const pc = peerRef.current;
    if (!pc) return;
    await pc.setRemoteDescription(new RTCSessionDescription(answer));
  }, []);

  const handleIceCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
    const pc = peerRef.current;
    if (!pc) return;
    try {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (e) {
      console.warn("Failed to add ICE candidate:", e);
    }
  }, []);

  // Subscribe to signaling events (adapter: socket gives (offer, from), we need (offer))
  useEffect(() => {
    const unsubOffer = onOffer((offer) => {
      handleOffer(offer);
    });
    const unsubAnswer = onAnswer((answer) => {
      handleAnswer(answer);
    });
    const unsubIce = onIceCandidate((candidate) => {
      handleIceCandidate(candidate);
    });
    return () => {
      unsubOffer();
      unsubAnswer();
      unsubIce();
    };
  }, [onOffer, onAnswer, onIceCandidate, handleOffer, handleAnswer, handleIceCandidate]);

  return {
    createOffer,
    close,
    isReady,
  };
}
