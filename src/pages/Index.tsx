
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Search, Download, Sparkles } from "lucide-react";
import { ArticleData, AudioData, ProcessingStatus } from "@/lib/types";
import { extractArticle } from "@/lib/article-extractor";
import { convertToSpeech } from "@/lib/text-to-speech";
import { generateSummary } from "@/lib/ai-summarizer";
import AudioPanel from "@/components/AudioPanel";
import ApiKeyModal from "@/components/ApiKeyModal";
import { Input } from "@/components/ui/input";

const Index = () => {
  // API Keys
  const [elevenlabsKey, setElevenlabsKey] = useState<string>("");
  const [openaiKey, setOpenaiKey] = useState<string>("");
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  
  // URL input
  const [url, setUrl] = useState<string>("");
  
  // Processing state
  const [status, setStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  
  // Content state
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [fullArticleAudio, setFullArticleAudio] = useState<AudioData | null>(null);
  const [cruxAudio, setCruxAudio] = useState<AudioData | null>(null);
  
  // Load API keys from local storage
  useEffect(() => {
    const savedElevenlabsKey = localStorage.getItem("elevenlabs-api-key");
    const savedOpenaiKey = localStorage.getItem("openai-api-key");
    
    if (savedElevenlabsKey) setElevenlabsKey(savedElevenlabsKey);
    if (savedOpenaiKey) setOpenaiKey(savedOpenaiKey);
  }, []);
  
  // Save API keys to local storage
  const handleSaveApiKeys = (elevenlabsKey: string, openaiKey: string) => {
    setElevenlabsKey(elevenlabsKey);
    setOpenaiKey(openaiKey);
    
    localStorage.setItem("elevenlabs-api-key", elevenlabsKey);
    localStorage.setItem("openai-api-key", openaiKey);
  };
  
  // Handle URL submission
  const handleSubmitUrl = async () => {
    if (!url.trim()) return;
    
    try {
      // Reset state
      setStatus(ProcessingStatus.LOADING);
      setError(null);
      setArticle(null);
      setSummary(null);
      setFullArticleAudio(null);
      setCruxAudio(null);
      
      // Extract article
      setStatus(ProcessingStatus.EXTRACTING);
      const extractedArticle = await extractArticle(url);
      setArticle(extractedArticle);
      
      // Generate summary
      setStatus(ProcessingStatus.SUMMARIZING);
      const articleSummary = await generateSummary(extractedArticle, openaiKey);
      setSummary(articleSummary);
      
      // Convert full article to speech
      setStatus(ProcessingStatus.CONVERTING);
      const fullAudio = await convertToSpeech(
        extractedArticle.content,
        true,
        elevenlabsKey
      );
      setFullArticleAudio(fullAudio);
      
      // Convert summary to speech
      const summaryAudio = await convertToSpeech(
        articleSummary,
        false,
        elevenlabsKey
      );
      setCruxAudio(summaryAudio);
      
      // Done!
      setStatus(ProcessingStatus.READY);
    } catch (error) {
      console.error("Error processing article:", error);
      setError(error instanceof Error ? error.message : "Unknown error occurred");
      setStatus(ProcessingStatus.ERROR);
    }
  };
  
  // Check if we're loading/processing
  const isLoading = status === ProcessingStatus.LOADING ||
                    status === ProcessingStatus.EXTRACTING ||
                    status === ProcessingStatus.SUMMARIZING ||
                    status === ProcessingStatus.CONVERTING;

  // Handle key press for URL input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmitUrl();
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="pt-8 pb-4 text-center">
        <h1 className="text-4xl font-bold text-gray-700">Audicle</h1>
      </header>
      
      {/* Main content */}
      <main className="flex-1 container mx-auto p-6 flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
          {/* Left panel */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div className="flex space-x-2 mb-4">
              <Input
                placeholder="Paste article URL here and press Enter"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={handleKeyPress}
                className="flex-1"
                disabled={isLoading}
              />
              <Button 
                className="bg-gray-400 hover:bg-gray-500 text-white" 
                disabled={!url.trim() || isLoading}
                onClick={handleSubmitUrl}
              >
                {isLoading ? (
                  "Loading..."
                ) : (
                  <>
                    <Search size={16} className="mr-2" />
                    Extract
                  </>
                )}
              </Button>
            </div>
            
            {/* Article content */}
            <div className="h-[calc(100%-60px)] overflow-auto">
              {article ? (
                <div className="prose max-w-none">
                  <h2 className="text-xl font-bold mb-4">{article.title}</h2>
                  {article.author && (
                    <p className="text-sm text-gray-500 mb-4">
                      By {article.author}
                      {article.publishDate && ` • ${article.publishDate}`}
                    </p>
                  )}
                  <div dangerouslySetInnerHTML={{ __html: article.content }} />
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  {isLoading ? (
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-gray-600 mb-2"></div>
                      <p>{status === ProcessingStatus.EXTRACTING ? "Extracting article..." :
                         status === ProcessingStatus.SUMMARIZING ? "Creating summary..." :
                         status === ProcessingStatus.CONVERTING ? "Converting to audio..." :
                         "Loading..."}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p>Enter an article URL above to get started</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Right panel */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 flex flex-col items-center">
            <div className="flex-1 flex items-center justify-center">
              <img 
                src="/lovable-uploads/record-player.png" 
                alt="Record Player" 
                className="w-48 h-48 object-contain"
              />
            </div>

            <div className="w-full space-y-4 mt-auto">
              <div className="flex justify-between text-sm text-gray-500">
                <span>0:00</span>
                <span>0:00</span>
              </div>
              
              <div className="w-full bg-gray-200 h-1 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: "0%" }}></div>
              </div>
              
              <div className="flex items-center justify-center my-4">
                <button className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shadow-md">
                  <div className="text-blue-500">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 5V19L19 12L8 5Z" fill="currentColor" />
                    </svg>
                  </div>
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                  </svg>
                </span>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 h-1 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: "50%" }}></div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between gap-4 mt-4">
                <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                  Full Article
                </Button>
                <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                  <Sparkles size={16} className="mr-2" />
                  Play the Crux
                </Button>
                <Button variant="outline" size="icon" className="border-gray-300">
                  <Download size={16} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSaveKeys={handleSaveApiKeys}
      />
    </div>
  );
};

export default Index;
