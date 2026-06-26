"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  MonitorOff,
  PhoneOff,
  Camera,
  MessageSquare,
  Maximize,
  Minimize,
} from "lucide-react";

interface VideoControlsProps {
  audioEnabled: boolean;
  videoEnabled: boolean;
  screenSharing: boolean;
  isFullscreen: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onToggleFullscreen: () => void;
  onEndConsultation: () => void;
}

export const VideoControls = memo(function VideoControls({
  audioEnabled,
  videoEnabled,
  screenSharing,
  isFullscreen,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onToggleFullscreen,
  onEndConsultation,
}: VideoControlsProps) {
  return (
    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-b-lg">
      <div className="flex items-center justify-center gap-2">
        <Button
          size="sm"
          variant={audioEnabled ? "default" : "destructive"}
          className="size-10 rounded-full"
          onClick={onToggleAudio}
        >
          {audioEnabled ? <Mic className="size-4" /> : <MicOff className="size-4" />}
        </Button>

        <Button
          size="sm"
          variant={videoEnabled ? "default" : "destructive"}
          className="size-10 rounded-full"
          onClick={onToggleVideo}
        >
          {videoEnabled ? <Video className="size-4" /> : <VideoOff className="size-4" />}
        </Button>

        <Button
          size="sm"
          variant={screenSharing ? "secondary" : "outline"}
          className="size-10 rounded-full"
          onClick={onToggleScreenShare}
        >
          {screenSharing ? <MonitorOff className="size-4" /> : <Monitor className="size-4" />}
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="size-10 rounded-full"
          onClick={onToggleFullscreen}
          title={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
        >
          {isFullscreen ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="size-10 rounded-full"
        >
          <Camera className="size-4" />
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="size-10 rounded-full"
        >
          <MessageSquare className="size-4" />
        </Button>

        <Button
          size="sm"
          variant="destructive"
          className="size-10 rounded-full ml-2"
          onClick={onEndConsultation}
          title="Terminer la consultation"
        >
          <PhoneOff className="size-4" />
        </Button>
      </div>
    </div>
  );
});

