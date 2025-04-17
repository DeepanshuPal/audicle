
import { ArticleData } from "./types";

/**
 * Extract article content from a URL
 */
export async function extractArticle(url: string): Promise<ArticleData> {
  console.log(`Starting extraction for URL: ${url}`);
  
  // Validate URL format first
  try {
    const validatedUrl = validateAndNormalizeUrl(url);
    console.log(`Validated URL: ${validatedUrl}`);
    return await attemptExtraction(validatedUrl);
  } catch (error) {
    console.error("URL validation or extraction error:", error);
    throw new Error(error instanceof Error ? error.message : "Invalid URL format");
  }
}

// Validate and normalize the URL
function validateAndNormalizeUrl(url: string): string {
  // Check if URL has a protocol
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
    console.log(`Added https:// protocol to URL: ${url}`);
  }
  
  try {
    // Attempt to create a URL object (will throw if invalid)
    const urlObj = new URL(url);
    return urlObj.toString();
  } catch (error) {
    console.error("Invalid URL format:", error);
    throw new Error("Please enter a valid URL");
  }
}

// Attempt to extract article content using multiple methods
async function attemptExtraction(url: string): Promise<ArticleData> {
  // Try each method in sequence and return on first success
  try {
    // First try with Microlink API
    console.log("Attempting extraction with Microlink API...");
    return await extractWithMicrolink(url);
  } catch (microlinkError) {
    console.warn("Microlink extraction failed:", microlinkError);
    
    try {
      // Try with AllOrigins as backup
      console.log("Attempting extraction with AllOrigins...");
      return await extractWithAllOrigins(url);
    } catch (allOriginsError) {
      console.warn("AllOrigins extraction failed:", allOriginsError);
      
      try {
        // Try with CORS Anywhere as final method
        console.log("Attempting extraction with CORS Anywhere...");
        return await extractWithCorsAnywhere(url);
      } catch (corsAnywhereError) {
        console.error("All extraction methods failed");
        
        // Try with Proxy Server as last resort
        try {
          console.log("Attempting extraction with JsonP method...");
          return await extractWithJsonP(url);
        } catch (jsonPError) {
          console.error("All extraction methods failed:", jsonPError);
          throw new Error("Failed to extract article content. Please try a different URL.");
        }
      }
    }
  }
}

// Extract using Microlink API
async function extractWithMicrolink(url: string): Promise<ArticleData> {
  const microlinkApiUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}&meta=false&audio=false`;
  console.log(`Making request to Microlink API: ${microlinkApiUrl}`);
  
  try {
    const response = await fetch(microlinkApiUrl);
    
    if (!response.ok) {
      console.error(`Microlink API failed with status: ${response.status}`);
      throw new Error(`Microlink API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success || !data.data.content) {
      console.error("Microlink extraction failed - no content returned");
      throw new Error("No content found with Microlink");
    }
    
    console.log("Microlink extraction successful");
    
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
    throw error;
  }
}

// Extract using AllOrigins
async function extractWithAllOrigins(url: string): Promise<ArticleData> {
  const allOriginsUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
  console.log(`Making request to AllOrigins: ${allOriginsUrl}`);
  
  try {
    const response = await fetch(allOriginsUrl);
    
    if (!response.ok) {
      console.error(`AllOrigins failed with status: ${response.status}`);
      throw new Error(`AllOrigins error: ${response.statusText}`);
    }
    
    const html = await response.text();
    
    if (!html || html.trim().length < 100) {
      console.error("AllOrigins returned empty or very short content");
      throw new Error("Insufficient content from AllOrigins");
    }
    
    return extractFromHtml(html, url);
  } catch (error) {
    console.error("Error with AllOrigins extraction:", error);
    throw error;
  }
}

// Extract using CORS Anywhere
async function extractWithCorsAnywhere(url: string): Promise<ArticleData> {
  const corsAnywhereUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
  console.log(`Making request to CORS proxy: ${corsAnywhereUrl}`);
  
  try {
    const response = await fetch(corsAnywhereUrl, {
      headers: {
        'Origin': window.location.origin
      }
    });
    
    if (!response.ok) {
      console.error(`CORS proxy failed with status: ${response.status}`);
      throw new Error(`CORS proxy error: ${response.statusText}`);
    }
    
    const html = await response.text();
    
    if (!html || html.trim().length < 100) {
      console.error("CORS proxy returned empty or very short content");
      throw new Error("Insufficient content from CORS proxy");
    }
    
    return extractFromHtml(html, url);
  } catch (error) {
    console.error("Error with CORS proxy extraction:", error);
    throw error;
  }
}

// Extract using JsonP as a last resort
async function extractWithJsonP(url: string): Promise<ArticleData> {
  // Use a free proxy service
  const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`;
  console.log(`Making request to CodeTabs proxy: ${proxyUrl}`);
  
  try {
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      console.error(`CodeTabs proxy failed with status: ${response.status}`);
      throw new Error(`CodeTabs proxy error: ${response.statusText}`);
    }
    
    const html = await response.text();
    
    if (!html || html.trim().length < 100) {
      console.error("CodeTabs proxy returned empty or very short content");
      throw new Error("Insufficient content from CodeTabs proxy");
    }
    
    return extractFromHtml(html, url);
  } catch (error) {
    console.error("Error with CodeTabs proxy extraction:", error);
    throw error;
  }
}

// Extract content from HTML
function extractFromHtml(html: string, url: string): ArticleData {
  console.log(`Extracting content from HTML (length: ${html.length})`);
  
  // Use DOMParser to extract content
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Get title
  const title = doc.querySelector('title')?.textContent || 'Untitled Article';
  console.log(`Extracted title: ${title}`);
  
  // Get metadata
  const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
  const author = doc.querySelector('meta[name="author"]')?.getAttribute('content') || 
                doc.querySelector('meta[property="article:author"]')?.getAttribute('content') || '';
  const publishDate = doc.querySelector('meta[property="article:published_time"]')?.getAttribute('content') || '';
  const siteName = doc.querySelector('meta[property="og:site_name"]')?.getAttribute('content') || '';
  
  // Try to find the main content using various selectors
  const mainSelectors = [
    'article', 
    '[role="main"]', 
    '.post-content', 
    '.article-content', 
    '.article-body',
    '.post-body',
    '.entry-content',
    '.content-body',
    '.story-body',
    '.story-content',
    '.post',
    '.blog-post',
    'main',
    '.main',
    '.content',
    '#content',
    '.container'
  ];
  
  let content = '';
  let mainElement = null;
  
  for (const selector of mainSelectors) {
    const elements = doc.querySelectorAll(selector);
    if (elements.length > 0) {
      // Find the element with the most text content
      let bestElement = elements[0];
      let maxLength = 0;
      
      elements.forEach(el => {
        const length = (el.textContent || '').length;
        if (length > maxLength) {
          maxLength = length;
          bestElement = el;
        }
      });
      
      mainElement = bestElement;
      console.log(`Found content using selector: ${selector} (length: ${maxLength})`);
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
    const elementsToRemove = body.querySelectorAll('script, style, iframe, .advertisement, .ad, .ads');
    elementsToRemove.forEach(el => el.remove());
    
    // Get paragraphs with substantial content
    const paragraphs = Array.from(body.querySelectorAll('p'))
      .filter(p => (p.textContent || '').trim().length > 30);  // Only paragraphs with meaningful content
    
    if (paragraphs.length > 3) {
      content = paragraphs
        .map(p => p.outerHTML)
        .join('');
      console.log(`Extracted ${paragraphs.length} paragraphs from body`);
    } else {
      // Try to find divs with substantial text content
      const textDivs = Array.from(doc.querySelectorAll('div, section'))
        .filter(el => {
          const text = el.textContent || '';
          return text.length > 100 && text.split('.').length > 3;  // Look for multi-sentence blocks
        });
      
      if (textDivs.length > 0) {
        // Sort by content length (descending)
        textDivs.sort((a, b) => (b.textContent || '').length - (a.textContent || '').length);
        
        // Take the top 5 divs with most content
        content = textDivs.slice(0, 5)
          .map(div => `<div>${div.innerHTML}</div>`)
          .join('');
        console.log(`Extracted content from ${Math.min(textDivs.length, 5)} richest text divs`);
      } else {
        // Last resort: get all text content from body
        content = `<p>${metaDescription}</p><p>${body.textContent?.trim().replace(/\s+/g, ' ')}</p>`;
        console.log("Extracted text content from body as last resort");
      }
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
  
  // If we still don't have enough content, throw an error
  if (content.trim() === '' || content.length < 100) {
    console.error("Extracted content is too short or empty");
    throw new Error("Could not extract sufficient content from the article");
  }
  
  console.log(`Successfully extracted article content (length: ${content.length})`);
  
  return {
    title,
    content,
    url,
    siteName,
    publishDate,
    author
  };
}
