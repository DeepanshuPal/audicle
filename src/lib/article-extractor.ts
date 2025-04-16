
import { ArticleData } from "./types";

/**
 * Extract article content from a URL
 */
export async function extractArticle(url: string): Promise<ArticleData> {
  try {
    // First try with Microlink API
    const microlinkApiUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}&meta=false&audio=false`;
    const response = await fetch(microlinkApiUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch article: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success || !data.data.content) {
      throw new Error("Failed to extract article content with Microlink, trying alternative method");
    }
    
    // Extract the article data from the Microlink response
    const { title, description, publisher, author, date, content } = data.data;
    
    return {
      title: title || "Untitled Article",
      content: content || description || "<p>No content available</p>",
      url,
      siteName: publisher || "",
      publishDate: date || "",
      author: author || ""
    };
  } catch (error) {
    console.error("Error with Microlink extraction:", error);
    
    // Try with AllOrigins as a backup
    try {
      const allOriginsUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      const response = await fetch(allOriginsUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch article with AllOrigins: ${response.statusText}`);
      }
      
      const html = await response.text();
      
      // Use DOMParser to extract content
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Get title
      const title = doc.querySelector('title')?.textContent || 'Untitled Article';
      
      // Get metadata
      const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
      const author = doc.querySelector('meta[name="author"]')?.getAttribute('content') || '';
      const publishDate = doc.querySelector('meta[property="article:published_time"]')?.getAttribute('content') || '';
      const siteName = doc.querySelector('meta[property="og:site_name"]')?.getAttribute('content') || '';
      
      // Try to find the main content
      const mainSelectors = [
        'article', 
        '[role="main"]', 
        '.post-content', 
        '.article-content', 
        '.entry-content',
        'main',
        '.content'
      ];
      
      let content = '';
      let mainElement = null;
      
      for (const selector of mainSelectors) {
        mainElement = doc.querySelector(selector);
        if (mainElement) break;
      }
      
      if (mainElement) {
        // Try to clean up the content by removing scripts, styles, and comments
        const scripts = mainElement.querySelectorAll('script, style, iframe, .advertisement, .ad, .ads, .social-share');
        scripts.forEach(el => el.remove());
        
        content = mainElement.innerHTML;
      } else {
        // Fallback to the body content, but clean it up
        const body = doc.body;
        const scripts = body.querySelectorAll('script, style, iframe, header, footer, nav, .advertisement, .ad, .ads');
        scripts.forEach(el => el.remove());
        
        // Get paragraphs
        const paragraphs = body.querySelectorAll('p');
        if (paragraphs.length > 3) {
          content = Array.from(paragraphs)
            .map(p => p.outerHTML)
            .join('');
        } else {
          content = body.innerHTML;
        }
      }
      
      // Clean up content - remove unnecessary HTML
      content = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      content = content.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
      content = content.replace(/<!--[\s\S]*?-->/g, '');
      
      return {
        title,
        content,
        url,
        siteName,
        publishDate,
        author
      };
    } catch (fallbackError) {
      console.error("All extraction methods failed:", fallbackError);
      throw new Error("Failed to extract article content. Please try a different URL.");
    }
  }
}
