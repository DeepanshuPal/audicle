
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Pause, 
  Volume2, 
  Volume1, 
  VolumeX,
  Download,
  RefreshCw
} from "lucide-react";

interface AudioControlsProps {
  audioUrl?: string;
  isPlaying: boolean;
  onPlayPause: () => void;
  onVolumeChange: (volume: number) => void;
  currentProgress: number;
  duration: number;
  onSeek: (position: number) => void;
  loading?: boolean;
}

const AudioControls = ({
  audioUrl,
  isPlaying,
  onPlayPause,
  onVolumeChange,
  currentProgress,
  duration,
  onSeek,
  loading = false
}: AudioControlsProps) => {
  const [volume, setVolume] = useState(0.8);
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    onVolumeChange(newVolume);
  };
  
  const handleSliderChange = (value: number[]) => {
    onSeek(value[0]);
  };
  
  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeX size={18} />;
    if (volume < 0.5) return <Volume1 size={18} />;
    return <Volume2 size={18} />;
  };
  
  return (
    <div className="w-full space-y-4">
      {/* Progress slider */}
      <div className="space-y-2">
        <Slider
          value={[currentProgress]}
          max={duration || 100}
          step={1}
          onValueChange={handleSliderChange}
          disabled={loading || !audioUrl}
          className="cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>{formatTime(currentProgress)}</span>
          <span>{formatTime(duration || 0)}</span>
        </div>
      </div>
      
      {/* Main controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 w-24">
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8 text-audio-dark"
            onClick={() => {
              setVolume(volume === 0 ? 0.5 : 0);
              onVolumeChange(volume === 0 ? 0.5 : 0);
            }}
          >
            {getVolumeIcon()}
          </Button>
          <Slider
            value={[volume]}
            min={0}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="w-16"
          />
        </div>
        
        <Button 
          variant="outline"
          size="icon"
          className={`h-14 w-14 rounded-full ${isPlaying ? 'bg-audio text-white' : 'bg-white text-audio-control border-audio/30'} shadow-md hover:scale-105 transition-transform`}
          onClick={onPlayPause}
          disabled={loading || !audioUrl}
        >
          {loading ? (
            <RefreshCw size={24} className="animate-spin" />
          ) : isPlaying ? (
            <Pause size={24} />
          ) : (
            <Play size={24} className="ml-1" />
          )}
        </Button>
        
        <div className="flex items-center space-x-2 w-24 justify-end">
          {audioUrl && (
            <Button
              variant="outline"
              className="h-9 border-audio/30 bg-audio text-white hover:bg-audio-dark hover:text-white flex items-center gap-2"
              asChild
              disabled={loading || !audioUrl}
            >
              <a href={audioUrl} download="audio.mp3" target="_blank" rel="noreferrer">
                <Download size={16} />
                <span>Download</span>
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AudioControls;
