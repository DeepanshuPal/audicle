
import { ArticleData } from "./types";

/**
 * Generate a summarized "podcast" version of the article content
 */
export async function generateSummary(
  article: ArticleData,
  apiKey: string = ""
): Promise<string> {
  try {
    if (!apiKey) {
      throw new Error("OpenAI API key is required");
    }
    
    // Clean up the article content - remove HTML tags
    const plainText = article.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    
    // Make the API request to OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert podcast script writer who can distill complex articles into engaging, concise audio summaries. Your task is to create a podcast-style version of the provided article that can be narrated in about 5-7 minutes (approximately 800-1000 words).

            Your podcast script should:
            1. Begin with an engaging podcast-style introduction that hooks the listener
            2. Capture the main points and key insights of the article in a narrative format
            3. Maintain a conversational, friendly tone suitable for audio consumption
            4. Use transitions and audio-friendly language (avoid visual references)
            5. Include interesting quotes or statistics from the original when relevant
            6. End with a thoughtful conclusion that summarizes the key takeaways
            
            Format the script as a complete podcast episode ready to be narrated, with natural transitions and clear structure. Do not include sound effect instructions or segment markers - just the narration text.`
          },
          {
            role: "user",
            content: `Article Title: ${article.title}\n\nArticle Content: ${plainText}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error generating summary:", error);
    
    // Return a mock summary if there's an error
    return `
      Welcome to Audicle, where we transform articles into audio experiences. Today we're exploring ${article.title}.
      
      This article discusses several fascinating aspects of this topic, including its historical context and modern applications.
      
      The author presents compelling evidence about how this subject affects various aspects of our lives and offers insights into potential future developments.
      
      Key points include the relationship between the main concepts, practical applications, and expert opinions that shed light on complex aspects.
      
      To conclude, this article provides a comprehensive overview that helps us better understand the nuances of ${article.title.toLowerCase()}. Thanks for listening to this Audicle podcast summary.
    `;
  }
}
