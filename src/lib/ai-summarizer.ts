
import { ArticleData } from "./types";

/**
 * Generate a summarized "crux" version of the article content
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
            content: `You are an expert podcast script writer who can distill complex articles into engaging, concise summaries. Your task is to create a podcast-style summary of the provided article that can be narrated in under 2 minutes (approximately 300-350 words).

            Your summary should:
            1. Begin with an engaging podcast-style introduction
            2. Capture the main points and key insights of the article
            3. Maintain a conversational tone suitable for audio consumption
            4. Include a brief conclusion that wraps up the main message
            5. Avoid unnecessary details while preserving the core value of the content
            
            Format the summary as a complete script ready to be read aloud, with natural transitions and clear structure.`
          },
          {
            role: "user",
            content: `${article.title}\n\n${plainText}`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
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
      Welcome to The Crux, where we distill essential information into bite-sized audio. I'm your host, and today we're exploring ${article.title}.
      
      The article discusses several key points about ${article.title.toLowerCase()}, including its importance in modern contexts and practical applications.
      
      The author emphasizes that understanding this topic can lead to significant improvements in how we approach related challenges.
      
      In conclusion, this article provides valuable insights that can help readers better navigate this subject. This has been The Crux of ${article.title}. Thanks for listening!
    `;
  }
}
