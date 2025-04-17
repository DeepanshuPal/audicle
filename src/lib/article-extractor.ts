
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
      console.log(`Microlink API failed with status: ${response.status}`);
      throw new Error(`Failed to fetch article: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success || !data.data.content) {
      console.log("Microlink extraction failed, trying alternative method");
      throw new Error("Failed to extract article content with Microlink");
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
  } catch (microlinkError) {
    console.error("Error with Microlink extraction:", microlinkError);
    
    // Try with AllOrigins as first backup
    try {
      console.log("Trying AllOrigins extraction...");
      const allOriginsUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      const response = await fetch(allOriginsUrl);
      
      if (!response.ok) {
        console.log(`AllOrigins failed with status: ${response.status}`);
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
      const author = doc.querySelector('meta[name="author"]')?.getAttribute('content') || 
                    doc.querySelector('meta[property="article:author"]')?.getAttribute('content') || '';
      const publishDate = doc.querySelector('meta[property="article:published_time"]')?.getAttribute('content') || '';
      const siteName = doc.querySelector('meta[property="og:site_name"]')?.getAttribute('content') || '';
      
      // Try to find the main content
      const mainSelectors = [
        'article', 
        '[role="main"]', 
        '.post-content', 
        '.article-content', 
        '.article-body',
        '.post-body',
        '.entry-content',
        'main',
        '.content',
        '#content'
      ];
      
      let content = '';
      let mainElement = null;
      
      for (const selector of mainSelectors) {
        mainElement = doc.querySelector(selector);
        if (mainElement) {
          console.log(`Found content using selector: ${selector}`);
          break;
        }
      }
      
      if (mainElement) {
        // Try to clean up the content by removing scripts, styles, and comments
        const elementsToRemove = mainElement.querySelectorAll('script, style, iframe, .advertisement, .ad, .ads, .social-share, nav, footer, header, aside');
        elementsToRemove.forEach(el => el.remove());
        
        content = mainElement.innerHTML;
      } else {
        console.log("No main content element found, trying to extract paragraphs");
        // Fallback to the body content, but clean it up
        const body = doc.body;
        const elementsToRemove = body.querySelectorAll('script, style, iframe, header, footer, nav, .advertisement, .ad, .ads, aside');
        elementsToRemove.forEach(el => el.remove());
        
        // Get paragraphs
        const paragraphs = body.querySelectorAll('p');
        if (paragraphs.length > 3) {
          content = Array.from(paragraphs)
            .map(p => p.outerHTML)
            .join('');
          console.log(`Extracted ${paragraphs.length} paragraphs from body`);
        } else {
          // Last resort: get all text content from body
          content = '<p>' + body.textContent?.trim().replace(/\s+/g, ' ') + '</p>';
          console.log("Extracted text content from body");
        }
      }
      
      // Clean up content - remove unnecessary HTML
      content = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      content = content.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
      content = content.replace(/<!--[\s\S]*?-->/g, '');
      
      // If content is too short, add the meta description
      if (content.length < 100 && metaDescription) {
        content = `<p>${metaDescription}</p>` + content;
      }
      
      // If we still don't have enough content, try a different approach
      if (content.length < 100) {
        console.log("Content is too short, trying to extract more text");
        // Try to get all divs with substantial text
        const textDivs = Array.from(doc.querySelectorAll('div, section, p'))
          .filter(el => {
            const text = el.textContent || '';
            return text.length > 100;
          });
        
        if (textDivs.length > 0) {
          content = textDivs.map(div => `<p>${div.textContent}</p>`).join('');
          console.log(`Extracted content from ${textDivs.length} divs with substantial text`);
        }
      }
      
      // If content is still empty, use a more aggressive approach
      if (content.trim() === '' || content.length < 100) {
        throw new Error("Failed to extract enough content from the article");
      }
      
      return {
        title,
        content,
        url,
        siteName,
        publishDate,
        author
      };
    } catch (allOriginsError) {
      console.error("AllOrigins extraction failed:", allOriginsError);
      
      // Try with CORS Anywhere as a final backup
      try {
        console.log("Trying CORS Anywhere extraction as final attempt...");
        const corsAnywhereUrl = `https://cors-anywhere.herokuapp.com/${url}`;
        
        const response = await fetch(corsAnywhereUrl, {
          headers: {
            'Origin': window.location.origin
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch article with CORS Anywhere: ${response.statusText}`);
        }
        
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Basic extraction logic
        const title = doc.querySelector('title')?.textContent || 'Untitled Article';
        const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
        
        // Get all paragraphs from the document
        const paragraphs = Array.from(doc.querySelectorAll('p'))
          .filter(p => (p.textContent || '').trim().length > 20) // Filter out empty paragraphs
          .map(p => p.outerHTML);
        
        if (paragraphs.length > 0) {
          return {
            title,
            content: paragraphs.join(''),
            url,
            siteName: '',
            publishDate: '',
            author: ''
          };
        }
        
        // Last resort, just grab the body text
        return {
          title,
          content: `<p>${metaDescription || ''}</p><p>${doc.body.textContent || 'No content could be extracted'}</p>`,
          url,
          siteName: '',
          publishDate: '',
          author: ''
        };
      } catch (corsAnywhereError) {
        console.error("All extraction methods failed:", corsAnywhereError);
        throw new Error("Failed to extract article content. Please try a different URL.");
      }
    }
  }
}
