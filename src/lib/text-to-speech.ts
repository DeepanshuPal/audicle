
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
      console.error("ElevenLabs API key is required");
      throw new Error("ElevenLabs API key is required");
    }
    
    console.log(`Converting text to speech (length: ${text.length} characters)`);
    
    // Check if text is too long for the API (>5000 chars)
    const maxChars = 5000;
    let processedText = text;
    
    if (text.length > maxChars) {
      console.log(`Text too long (${text.length} chars), truncating to ${maxChars} chars`);
      // Find the last period before the max character limit
      const lastPeriod = text.lastIndexOf('.', maxChars);
      if (lastPeriod !== -1) {
        processedText = text.substring(0, lastPeriod + 1);
      } else {
        processedText = text.substring(0, maxChars);
      }
      console.log(`Truncated text length: ${processedText.length} chars`);
    }
    
    // Set the voice ID to Antoni
    const voiceId = "ErXwobaYiN019PkySvjV"; // Antoni voice
    
    // Set the model ID to use Flash v2.5
    const modelId = "eleven_flash_v2_5";
    
    // Make the API request
    console.log("Sending request to ElevenLabs API");
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text: processedText,
          model_id: modelId,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          }
        }),
      }
    );

    console.log("ElevenLabs API status:", response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error("ElevenLabs API error:", response.status, errorData);
      
      throw new Error(
        errorData?.detail?.message || 
        `ElevenLabs API error: ${response.status} ${response.statusText}`
      );
    }

    // Convert response to blob and create URL
    const audioBlob = await response.blob();
    const url = URL.createObjectURL(audioBlob);
    
    console.log("Audio blob created, size:", audioBlob.size);
    
    // Create audio element to get duration
    const audio = new Audio(url);
    
    return new Promise((resolve) => {
      audio.onloadedmetadata = () => {
        console.log("Audio metadata loaded, duration:", audio.duration);
        resolve({
          url,
          duration: audio.duration
        });
      };
      
      // If metadata loading fails, resolve with a reasonable default duration
      audio.onerror = (e) => {
        console.error("Error loading audio metadata:", e);
        resolve({
          url,
          duration: Math.max(60, Math.round(processedText.length / 20)) // Estimate duration based on text length
        });
      };
      
      // Set a timeout in case the metadata never loads
      setTimeout(() => {
        if (!audio.duration) {
          console.warn("Audio metadata loading timed out, using estimated duration");
          resolve({
            url,
            duration: Math.max(60, Math.round(processedText.length / 20)) // Estimate duration based on text length
          });
        }
      }, 3000);
    });
  } catch (error) {
    console.error("Error converting text to speech:", error);
    throw error;
  }
}
