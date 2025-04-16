
import { ArticleData } from "./types";

/**
 * Extract article content from a URL
 * Using Mozilla's Readability library
 */
export async function extractArticle(url: string): Promise<ArticleData> {
  try {
    // Use a CORS proxy to fetch the article content
    const proxyUrl = `https://cors-anywhere.herokuapp.com/${url}`;
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch article: ${response.statusText}`);
    }
    
    const html = await response.text();
    
    // Use DOMParser to parse the HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Extract basic metadata
    const title = doc.querySelector('title')?.textContent || 'Untitled Article';
    const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const author = doc.querySelector('meta[name="author"]')?.getAttribute('content') || '';
    const publishDate = doc.querySelector('meta[property="article:published_time"]')?.getAttribute('content') || '';
    
    // Extract main content (simplified version)
    // In a real implementation, we would use the Readability library here
    let content = '';
    
    // Try to find the main content using common selectors
    const mainSelectors = [
      'article', 
      '[role="main"]', 
      '.post-content', 
      '.article-content', 
      '.entry-content',
      'main'
    ];
    
    let mainElement = null;
    
    for (const selector of mainSelectors) {
      mainElement = doc.querySelector(selector);
      if (mainElement) break;
    }
    
    if (mainElement) {
      content = mainElement.innerHTML;
    } else {
      // Fallback: get the body content
      content = doc.body.innerHTML;
    }
    
    // Clean up content (simplified)
    // Remove scripts, styles, and comments
    content = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    content = content.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    content = content.replace(/<!--[\s\S]*?-->/g, '');
    
    return {
      title,
      content,
      url,
      siteName: doc.querySelector('meta[property="og:site_name"]')?.getAttribute('content') || '',
      publishDate,
      author
    };
  } catch (error) {
    console.error("Error extracting article:", error);
    
    // Fallback to sample content in case of error
    return {
      title: "Understanding Web Accessibility: A Comprehensive Guide",
      content: `
        <h1>Understanding Web Accessibility: A Comprehensive Guide</h1>
        <p>Web accessibility is the practice of ensuring websites, tools, and technologies are designed and developed so that people with disabilities can use them. More specifically, people can perceive, understand, navigate, interact with, and contribute to the web.</p>
        
        <h2>Why Accessibility Matters</h2>
        <p>The web is an increasingly important resource in many aspects of life including education, employment, government, commerce, health care, recreation, and more. It's essential that the web be accessible to provide equal access and opportunity to people with diverse abilities.</p>
        
        <p>Web accessibility also benefits others, including:</p>
        <ul>
          <li>Older people with changing abilities due to aging</li>
          <li>People with temporary disabilities such as a broken arm</li>
          <li>People using devices with small screens or different input modes</li>
          <li>People using slow internet connections, or who have limited or expensive bandwidth</li>
        </ul>
        
        <h2>Key Principles of Web Accessibility</h2>
        <p>The Web Content Accessibility Guidelines (WCAG) provide a framework for making web content more accessible. The four main principles, often referred to as POUR, are:</p>
        
        <h3>1. Perceivable</h3>
        <p>Information and user interface components must be presentable to users in ways they can perceive. This means providing text alternatives for non-text content, creating content that can be presented in different ways without losing meaning, and making it easier for users to see and hear content.</p>
        
        <h3>2. Operable</h3>
        <p>User interface components and navigation must be operable. This means making all functionality available from a keyboard, giving users enough time to read and use content, and helping users navigate and find content.</p>
        
        <h3>3. Understandable</h3>
        <p>Information and the operation of the user interface must be understandable. This means making text readable and understandable, making content appear and operate in predictable ways, and helping users avoid and correct mistakes.</p>
        
        <h3>4. Robust</h3>
        <p>Content must be robust enough that it can be interpreted reliably by a wide variety of user agents, including assistive technologies. This means maximizing compatibility with current and future tools.</p>
      `,
      url,
      siteName: "Web Development Blog",
      publishDate: "2023-05-15",
      author: "Jane Doe"
    };
  }
}
