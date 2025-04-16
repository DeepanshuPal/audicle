
import { ArticleData } from "./types";

/**
 * Extract article content from a URL
 * Using Mozilla's Readability library via a proxy service
 */
export async function extractArticle(url: string): Promise<ArticleData> {
  try {
    // In a production app, you'd use a server endpoint for this
    // For this demo, we'll use a mock implementation
    
    // We'd normally use something like:
    // const response = await fetch(`/api/extract?url=${encodeURIComponent(url)}`);
    
    // For demo, we'll simulate a successful extraction with a delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if the URL is valid
    try {
      new URL(url);
    } catch (e) {
      throw new Error("Please enter a valid URL");
    }
    
    // Mock response for demonstration
    const title = "Understanding Web Accessibility: A Comprehensive Guide";
    const content = `
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
      
      <h2>Common Accessibility Features</h2>
      <p>Some common features that improve web accessibility include:</p>
      
      <h3>Alternative Text for Images</h3>
      <p>Alt text provides a textual alternative to non-text content in web pages. It's read by screen readers to describe images to blind users, displayed in place of images when they don't load, and used by search engines.</p>
      
      <h3>Proper Heading Structure</h3>
      <p>Using heading elements (h1-h6) to create a logical document outline helps users navigate the page and understand the content hierarchy.</p>
      
      <h3>Keyboard Accessibility</h3>
      <p>Ensuring that all interactions can be performed using a keyboard alone helps users who can't use a mouse, including those with motor disabilities or who use screen readers.</p>
      
      <h3>Color and Contrast</h3>
      <p>Ensuring sufficient color contrast makes content perceivable for users with low vision or color blindness. It's also important not to rely on color alone to convey information.</p>
      
      <h2>Getting Started with Accessibility</h2>
      <p>If you're new to web accessibility, here are some steps to get started:</p>
      
      <ol>
        <li>Learn the basics of web accessibility through resources like the W3C Web Accessibility Initiative (WAI)</li>
        <li>Conduct an accessibility audit of your website using tools like WAVE or Lighthouse</li>
        <li>Address the most critical issues first, such as keyboard accessibility and alt text</li>
        <li>Include people with disabilities in user testing</li>
        <li>Make accessibility a part of your development process from the beginning</li>
      </ol>
      
      <h2>Conclusion</h2>
      <p>Web accessibility is not just a legal or moral obligation—it's good business. By making your website accessible, you expand your potential audience and provide a better user experience for everyone. Start small, learn continuously, and make accessibility a priority in your web development process.</p>
    `;
    
    return {
      title,
      content,
      url,
      siteName: "Web Development Blog",
      publishDate: "2023-05-15",
      author: "Jane Doe"
    };
  } catch (error) {
    console.error("Error extracting article:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to extract article");
  }
}
