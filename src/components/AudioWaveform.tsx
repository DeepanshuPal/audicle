
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface AudioWaveformProps {
  isPlaying: boolean;
  audioElement?: HTMLAudioElement | null;
  className?: string;
}

const AudioWaveform = ({ isPlaying, audioElement, className }: AudioWaveformProps) => {
  const waveformRef = useRef<HTMLDivElement>(null);
  
  // Create the waveform bars
  const bars = Array.from({ length: 60 }, (_, i) => i);
  
  // Calculate random heights for the bars when not connected to actual audio
  const getRandomHeight = () => Math.random() * 0.7 + 0.3; // Between 0.3 and 1.0
  
  return (
    <div 
      ref={waveformRef}
      className={cn(
        "relative w-full h-full flex items-center justify-center gap-1",
        className
      )}
    >
      <div className="absolute inset-0 rounded-full bg-audio/5 animate-pulse-ring"></div>
      <div className="absolute inset-4 rounded-full bg-audio/10"></div>
      
      <div className="relative flex items-center justify-center gap-[2px] h-48 w-48 rounded-full">
        {bars.map((index) => {
          // Calculate position around the circle
          const angle = (index * 6 * Math.PI) / 180;
          const radius = 70; // Radius of the circle
          
          // Calculate x and y coordinates
          const x = radius * Math.cos(angle);
          const y = radius * Math.sin(angle);
          
          // Random animation delay for each bar
          const animationDelay = index % 5 * 0.1;
          
          // Determine animation class based on pattern
          const animationClass = index % 3 === 0 
            ? "animate-wave" 
            : index % 3 === 1 
              ? "animate-wave-slow" 
              : "animate-wave-fast";
          
          return (
            <div
              key={index}
              className={cn(
                "absolute w-1 bg-audio rounded-full transform origin-bottom",
                isPlaying ? animationClass : "h-6 bg-audio/40",
              )}
              style={{
                height: isPlaying ? `${getRandomHeight() * 30}px` : "6px",
                transform: `translate(${x}px, ${y}px) rotate(${angle + Math.PI/2}rad)`,
                animationDelay: `${animationDelay}s`,
                opacity: isPlaying ? 0.8 : 0.4,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default AudioWaveform;
