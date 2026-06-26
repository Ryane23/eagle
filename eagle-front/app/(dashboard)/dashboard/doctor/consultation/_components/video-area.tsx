"use client";

import { forwardRef, RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Video,
  VideoOff,
  User,
  AlertTriangle,
  Play,
} from "lucide-react";
import { getUrgencyColor } from "@/types/consultation";

interface VideoAreaProps {
  patientName: string;
  urgencyLevel: number;
  consultationStarted: boolean;
  videoEnabled: boolean;
  isLoadingCamera: boolean;
  cameraError: string | null;
  isFullscreen: boolean;
  doctorVideoRef: RefObject<HTMLVideoElement | null>;
  patientVideoRef: RefObject<HTMLVideoElement | null>;
  hasStream: boolean;
  onStartConsultation: () => void;
  onClearError: () => void;
  onRetryCamera: () => void;
}

export const VideoArea = forwardRef<HTMLDivElement, VideoAreaProps>(
  function VideoArea(
    {
      patientName,
      urgencyLevel,
      consultationStarted,
      videoEnabled,
      isLoadingCamera,
      cameraError,
      isFullscreen,
      doctorVideoRef,
      patientVideoRef,
      hasStream,
      onStartConsultation,
      onClearError,
      onRetryCamera,
    },
    containerRef
  ) {
    const urgencyColor = getUrgencyColor(urgencyLevel);

    return (
      <div
        ref={containerRef}
        className={`relative ${isFullscreen ? 'fixed inset-0 z-50' : 'aspect-video'} bg-gray-900 ${isFullscreen ? '' : 'rounded-t-lg'} flex items-center justify-center overflow-hidden`}
      >
        {!consultationStarted ? (
          <div className="text-center text-gray-400 p-8">
            <Video className="size-20 mx-auto mb-4 text-blue-500" />
            <p className="text-lg font-semibold mb-2">Consultation non démarrée</p>
            <p className="text-sm mb-4">Cliquez sur le bouton pour commencer la consultation</p>
            <Button
              onClick={onStartConsultation}
              className="gap-2"
              size="lg"
            >
              <Play className="size-5" />
              Démarrer la consultation
            </Button>
          </div>
        ) : (
          <>
            {/* Camera Error Display */}
            {cameraError && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg max-w-md">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="size-4" />
                  <p className="text-sm font-medium">{cameraError}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-white hover:bg-red-600"
                    onClick={() => {
                      onClearError();
                      if (videoEnabled) {
                        onRetryCamera();
                      }
                    }}
                  >
                    ×
                  </Button>
                </div>
              </div>
            )}

            {/* Loading Indicator */}
            {isLoadingCamera && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm font-medium">Accès à la caméra en cours...</p>
                </div>
              </div>
            )}

            {/* Patient Video - Large (Placeholder for now) */}
            <div className="relative w-full h-full flex items-center justify-center bg-gray-800">
              {/* Video element is hidden until stream is available */}
              <video
                ref={patientVideoRef}
                className="w-full h-full object-cover hidden"
                autoPlay
                playsInline
                muted
              />
              {/* Placeholder shown while waiting for patient */}
              <div className="text-center text-gray-400">
                <User className="size-32 text-gray-500 mx-auto mb-4" />
                <p className="text-lg">En attente du patient...</p>
              </div>

              {/* Patient Info Overlay */}
              <div className="absolute top-4 left-4 bg-black/70 px-3 py-1.5 rounded z-10">
                <p className="text-white font-semibold text-sm">{patientName}</p>
              </div>

              <div className="absolute top-4 right-4 z-10">
                <Badge className={urgencyColor}>
                  Urgence {urgencyLevel}
                </Badge>
              </div>
            </div>

            {/* Doctor Video - Small (Picture in Picture) */}
            <DoctorVideoPreview
              doctorVideoRef={doctorVideoRef}
              videoEnabled={videoEnabled}
              isLoadingCamera={isLoadingCamera}
              hasStream={hasStream}
            />
          </>
        )}
      </div>
    );
  }
);

interface DoctorVideoPreviewProps {
  doctorVideoRef: RefObject<HTMLVideoElement | null>;
  videoEnabled: boolean;
  isLoadingCamera: boolean;
  hasStream: boolean;
}

function DoctorVideoPreview({
  doctorVideoRef,
  videoEnabled,
  isLoadingCamera,
  hasStream,
}: DoctorVideoPreviewProps) {
  return (
    <div className="absolute bottom-4 right-4 w-48 h-[135px] bg-gray-800 rounded-lg border-2 border-blue-500 overflow-hidden z-20 shadow-lg">
      {isLoadingCamera ? (
        <div className="relative w-full h-full flex items-center justify-center bg-gray-900">
          <div className="size-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <div className="absolute bottom-1 left-1 text-white text-[10px] px-2 py-0.5 bg-black/70 rounded">
            Dr. Nana Pierre
          </div>
        </div>
      ) : videoEnabled ? (
        <div className="relative w-full h-full bg-gray-900">
          <video
            ref={doctorVideoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted
            style={{ transform: 'scaleX(-1)' }}
            onCanPlay={(e) => {
              const video = e.currentTarget;
              video.play().catch((err: { name?: string }) => {
                if (err?.name !== "AbortError") console.error("Error playing video:", err);
              });
            }}
          />
          <div className="absolute bottom-1 left-1 text-white text-[10px] px-2 py-0.5 bg-black/70 rounded z-10">
            Dr. Nana Pierre
          </div>
          {!hasStream && !isLoadingCamera && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90 z-0">
              <div className="text-center">
                <VideoOff className="size-6 text-gray-400 mx-auto mb-1" />
                <p className="text-[9px] text-gray-400">Cliquez sur la caméra</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="relative w-full h-full flex flex-col items-center justify-center bg-gray-900">
          <VideoOff className="size-8 text-gray-500 mb-2" />
          <p className="text-[10px] text-gray-400 text-center px-2">Caméra désactivée</p>
          <div className="absolute bottom-1 left-1 text-white text-[10px] px-2 py-0.5 bg-black/70 rounded">
            Dr. Nana Pierre
          </div>
        </div>
      )}
    </div>
  );
}

