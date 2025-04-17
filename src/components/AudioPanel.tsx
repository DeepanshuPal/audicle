
import { useState, useRef, useEffect } from "react";
import AudioControls from "./AudioControls";
import { PlayerState, AudioData, ProcessingStatus } from "@/lib/types";

interface AudioPanelProps {
  audioData: AudioData | null;
  status: ProcessingStatus;
  articleTitle?: string;
}

const AudioPanel = ({
  audioData,
  status,
  articleTitle = "Article Audio"
}: AudioPanelProps) => {
  const [playerState, setPlayerState] = useState<PlayerState>(PlayerState.IDLE);
  const [volume, setVolume] = useState(0.8);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
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
    if (!audioRef.current || !audioData?.url) return;
    
    const wasPlaying = playerState === PlayerState.PLAYING;
    
    // Set new source
    audioRef.current.src = audioData.url;
    audioRef.current.load();
    
    // Restart playback if it was playing
    if (wasPlaying) {
      audioRef.current.play().catch(error => {
        console.error("Error playing audio:", error);
        setPlayerState(PlayerState.ERROR);
      });
    }
    
    // Set duration if available
    if (audioData.duration) {
      setDuration(audioData.duration);
    }
  }, [audioData?.url, playerState]);
  
  // Handle play/pause
  const togglePlayPause = () => {
    if (!audioRef.current || !audioData?.url) return;
    
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
  
  return (
    <div className="h-full flex flex-col items-center justify-between p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-instrument font-bold text-audio-dark">
          {articleTitle || "Article Audio"}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Podcast-style audio summary
        </p>
      </div>
      
      <div className="flex-1 w-full flex items-center justify-center">
        <div className="relative w-full flex flex-col items-center justify-center">
          <img 
            src="/lovable-uploads/56a4c540-4515-438e-b425-23bbbd13444f.png" 
            alt="Record Player" 
            className="w-64 h-64 object-contain mx-auto"
          />
          
          {/* Record spinning effect only shows up when playing */}
          {playerState === PlayerState.PLAYING && (
            <div className="absolute top-[42%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-transparent animate-spin"
                 style={{ animationDuration: '2s' }}
            />
          )}
        </div>
      </div>
      
      <div className="w-full mt-8">
        <AudioControls
          audioUrl={audioData?.url}
          isPlaying={playerState === PlayerState.PLAYING}
          onPlayPause={togglePlayPause}
          onVolumeChange={handleVolumeChange}
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
