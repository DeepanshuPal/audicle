
import { ArticleData } from "./types";

/**
 * Generate a summarized "crux" version of the article content
 * In a real implementation, this would call the OpenAI API
 */
export async function generateSummary(
  article: ArticleData,
  apiKey: string = ""
): Promise<string> {
  try {
    // In a production app, this would call the OpenAI API via a secure backend
    // For this demo, we'll simulate a successful summary with a delay
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // In a real implementation, we would make a call like:
    /*
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4",
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
            content: `${article.title}\n\n${article.content}`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });
    
    const data = await response.json();
    return data.choices[0].message.content;
    */
    
    // For the demo, return a mock summary
    return `
      Welcome to The Crux, where we distill essential information into bite-sized audio. I'm your host, and today we're exploring web accessibility.
      
      Web accessibility ensures people with disabilities can use websites effectively. It's not just a moral obligation—it benefits everyone, including older adults, people with temporary disabilities, and those on slow connections.
      
      The Web Content Accessibility Guidelines follow four key principles: making content perceivable, operable, understandable, and robust. This includes providing alt text for images, ensuring keyboard navigation works, using clear heading structures, and maintaining sufficient color contrast.
      
      To improve accessibility on your site, start with an audit using tools like WAVE or Lighthouse, address critical issues first, include people with disabilities in testing, and make accessibility part of your development process from day one.
      
      Remember, an accessible website expands your audience and provides a better experience for everyone. This has been The Crux of web accessibility. Thanks for listening!
    `;
  } catch (error) {
    console.error("Error generating summary:", error);
    throw new Error(error instanceof Error 
      ? error.message 
      : "Failed to generate summary"
    );
  }
}
