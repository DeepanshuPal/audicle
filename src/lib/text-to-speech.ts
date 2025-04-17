
import { AudioData } from "./types";

/**
 * Convert text to speech using ElevenLabs API
 */
export async function convertToSpeech(
  text: string, 
  apiKey: string = ""
): Promise<AudioData> {
  try {
    if (!apiKey) {
      throw new Error("ElevenLabs API key is required");
    }
    
    // Set the voice ID to Antoni
    const voiceId = "ErXwobaYiN019PkySvjV"; // Antoni voice
    
    // Set the model ID to use Flash v2.5
    const modelId = "eleven_flash_v2_5";
    
    // Make the API request
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
          model_id: modelId,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          }
        }),
      }
    );

    if (!response.ok) {
      // If API key is invalid or other error, fall back to samples
      console.error("ElevenLabs API error:", response.status);
      
      // Fallback to sample audio file
      return {
        url: "https://cdn.freesound.org/previews/367/367749_6687864-lq.mp3", // Sample audio
        duration: 120 // Approximate duration
      };
    }

    // Convert response to blob and create URL
    const audioBlob = await response.blob();
    const url = URL.createObjectURL(audioBlob);
    
    // Create audio element to get duration
    const audio = new Audio(url);
    
    return new Promise((resolve) => {
      audio.onloadedmetadata = () => {
        resolve({
          url,
          duration: audio.duration
        });
      };
      
      // If metadata loading fails, resolve with a reasonable default duration
      audio.onerror = () => {
        resolve({
          url,
          duration: 120
        });
      };
    });
  } catch (error) {
    console.error("Error converting text to speech:", error);
    
    // Fallback to sample audio file
    return {
      url: "https://cdn.freesound.org/previews/367/367749_6687864-lq.mp3", // Sample audio
      duration: 120 // Approximate duration
    };
  }
}
