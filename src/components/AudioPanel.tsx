
import { useState, useRef, useEffect } from "react";
import AudioControls from "./AudioControls";
import { PlayerState, AudioData, ProcessingStatus } from "@/lib/types";

interface AudioPanelProps {
  fullArticleAudio: AudioData | null;
  cruxAudio: AudioData | null;
  status: ProcessingStatus;
  fullArticleTitle?: string;
  cruxTitle?: string;
}

const AudioPanel = ({
  fullArticleAudio,
  cruxAudio,
  status,
  fullArticleTitle = "Full Article",
  cruxTitle = "The Crux"
}: AudioPanelProps) => {
  const [playerState, setPlayerState] = useState<PlayerState>(PlayerState.IDLE);
  const [isFullArticle, setIsFullArticle] = useState(true);
  const [volume, setVolume] = useState(0.8);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const currentAudio = isFullArticle ? fullArticleAudio : cruxAudio;
  const isLoading = status === ProcessingStatus.LOADING || 
                    status === ProcessingStatus.EXTRACTING ||
                    status === ProcessingStatus.SUMMARIZING ||
                    status === ProcessingStatus.CONVERTING;
  
  useEffect(() => {
    // Create audio element for playback
    const audio = new Audio();
    audioRef.current = audio;
    
    // Set up event listeners
    audio.addEventListener("timeupdate", () => {
      setCurrentTime(audio.currentTime);
    });
    
    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration);
    });
    
    audio.addEventListener("ended", () => {
      setPlayerState(PlayerState.IDLE);
    });
    
    audio.addEventListener("error", () => {
      setPlayerState(PlayerState.ERROR);
    });
    
    // Clean up
    return () => {
      audio.pause();
      audio.src = "";
      audio.removeEventListener("timeupdate", () => {});
      audio.removeEventListener("loadedmetadata", () => {});
      audio.removeEventListener("ended", () => {});
      audio.removeEventListener("error", () => {});
    };
  }, []);
  
  // Update audio source when it changes
  useEffect(() => {
    if (!audioRef.current || !currentAudio?.url) return;
    
    const wasPlaying = playerState === PlayerState.PLAYING;
    
    // Set new source
    audioRef.current.src = currentAudio.url;
    audioRef.current.load();
    
    // Restart playback if it was playing
    if (wasPlaying) {
      audioRef.current.play().catch(error => {
        console.error("Error playing audio:", error);
        setPlayerState(PlayerState.ERROR);
      });
    }
    
    // Set duration if available
    if (currentAudio.duration) {
      setDuration(currentAudio.duration);
    }
  }, [currentAudio?.url, playerState]);
  
  // Handle play/pause
  const togglePlayPause = () => {
    if (!audioRef.current || !currentAudio?.url) return;
    
    if (playerState === PlayerState.PLAYING) {
      audioRef.current.pause();
      setPlayerState(PlayerState.PAUSED);
    } else {
      audioRef.current.play().catch(error => {
        console.error("Error playing audio:", error);
        setPlayerState(PlayerState.ERROR);
      });
      setPlayerState(PlayerState.PLAYING);
    }
  };
  
  // Handle volume change
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };
  
  // Handle seeking
  const handleSeek = (position: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = position;
      setCurrentTime(position);
    }
  };
  
  // Toggle between full article and crux
  const toggleVersion = () => {
    setIsFullArticle(!isFullArticle);
    setPlayerState(PlayerState.IDLE);
    setCurrentTime(0);
  };
  
  return (
    <div className="h-full flex flex-col items-center justify-between">
      <div className="flex-1 flex flex-col items-center justify-center">
        <img 
          src="/lovable-uploads/record-player.png" 
          alt="Record Player" 
          className="w-48 h-48 object-contain mb-8"
        />
      </div>
      
      <div className="w-full mt-auto">
        <AudioControls
          audioUrl={currentAudio?.url}
          isPlaying={playerState === PlayerState.PLAYING}
          onPlayPause={togglePlayPause}
          onVolumeChange={handleVolumeChange}
          isFullArticle={isFullArticle}
          onToggleVersion={toggleVersion}
          currentProgress={currentTime}
          duration={duration}
          onSeek={handleSeek}
          loading={isLoading}
        />
      </div>
    </div>
  );
};

export default AudioPanel;
