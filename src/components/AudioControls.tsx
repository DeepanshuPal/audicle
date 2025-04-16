
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Pause, 
  Volume2, 
  Volume1, 
  VolumeX,
  DownloadIcon,
  RefreshCw,
  Sparkles
} from "lucide-react";

interface AudioControlsProps {
  audioUrl?: string;
  isPlaying: boolean;
  onPlayPause: () => void;
  onVolumeChange: (volume: number) => void;
  isFullArticle: boolean;
  onToggleVersion: () => void;
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
  isFullArticle,
  onToggleVersion,
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
        <div className="flex justify-between text-sm text-gray-500">
          <span>{formatTime(currentProgress)}</span>
          <span>{formatTime(duration || 0)}</span>
        </div>
        
        <div className="w-full bg-gray-200 h-1 rounded-full overflow-hidden">
          <div 
            className="bg-blue-500 h-full rounded-full transition-all duration-300" 
            style={{ width: `${(currentProgress / (duration || 1)) * 100}%` }}
          ></div>
        </div>
      </div>
      
      {/* Play button */}
      <div className="flex items-center justify-center">
        <Button 
          variant="outline"
          size="icon"
          className="w-12 h-12 rounded-full bg-white shadow-md hover:scale-105 transition-transform"
          onClick={onPlayPause}
          disabled={loading || !audioUrl}
        >
          {loading ? (
            <RefreshCw size={18} className="animate-spin" />
          ) : isPlaying ? (
            <Pause size={18} />
          ) : (
            <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-blue-500 border-b-[8px] border-b-transparent ml-0.5"></div>
          )}
        </Button>
      </div>
      
      {/* Volume control */}
      <div className="flex items-center space-x-2">
        <Button 
          variant="ghost" 
          size="icon"
          className="h-8 w-8 text-gray-500"
          onClick={() => {
            setVolume(volume === 0 ? 0.5 : 0);
            onVolumeChange(volume === 0 ? 0.5 : 0);
          }}
        >
          {getVolumeIcon()}
        </Button>
        <div className="flex-1">
          <Slider
            value={[volume]}
            min={0}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="w-full"
          />
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-between gap-4 mt-4">
        <Button 
          className={`w-full ${isFullArticle ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
          onClick={() => {
            if (!isFullArticle) onToggleVersion();
          }}
          disabled={loading}
        >
          Full Article
        </Button>
        
        <Button 
          className={`w-full ${!isFullArticle ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
          onClick={() => {
            if (isFullArticle) onToggleVersion();
          }}
          disabled={loading}
        >
          <Sparkles size={16} className="mr-2" />
          Play the Crux
        </Button>
        
        {audioUrl && (
          <Button
            variant="outline"
            size="icon"
            asChild
          >
            <a href={audioUrl} download="audio.mp3" target="_blank" rel="noreferrer">
              <DownloadIcon size={16} />
            </a>
          </Button>
        )}
      </div>
    </div>
  );
};

export default AudioControls;
