
import { AudioData } from "./types";

/**
 * Convert text to speech using ElevenLabs API
 * In a real implementation, this would call the ElevenLabs API
 */
export async function convertToSpeech(
  text: string, 
  isFullArticle = true,
  apiKey: string = ""
): Promise<AudioData> {
  try {
    // In a production app, this would call the ElevenLabs API via a secure backend
    // For this demo, we'll simulate a successful conversion with a delay
    
    // Simulate different processing times for full article vs. summary
    const delay = isFullArticle ? 3000 : 1500;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // In a real implementation, we would make a call like:
    /*
    const voiceId = "21m00Tcm4TlvDq8ikWAM";
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text: text,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const audioBlob = await response.blob();
    return {
      url: URL.createObjectURL(audioBlob),
      duration: 120 // This would be calculated from the actual audio
    };
    */
    
    // For the demo, return a sample audio file
    return {
      url: isFullArticle 
        ? "https://cdn.freesound.org/previews/367/367749_6687864-lq.mp3" // Sample audio for full article
        : "https://cdn.freesound.org/previews/376/376656_6687864-lq.mp3", // Sample audio for summary
      duration: isFullArticle ? 120 : 30 // Approximate durations
    };
  } catch (error) {
    console.error("Error converting text to speech:", error);
    throw new Error(error instanceof Error 
      ? error.message 
      : "Failed to convert text to speech"
    );
  }
}
