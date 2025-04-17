
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { ArticleData, AudioData, ProcessingStatus } from "@/lib/types";
import { extractArticle } from "@/lib/article-extractor";
import { convertToSpeech } from "@/lib/text-to-speech";
import ArticleView from "@/components/ArticleView";
import AudioPanel from "@/components/AudioPanel";
import ApiKeyModal from "@/components/ApiKeyModal";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  // API Key
  const [elevenlabsKey, setElevenlabsKey] = useState<string>("");
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const { toast } = useToast();
  
  // Processing state
  const [status, setStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  
  // Content state
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [audioData, setAudioData] = useState<AudioData | null>(null);
  
  // Load API key from local storage
  useEffect(() => {
    const savedElevenlabsKey = localStorage.getItem("elevenlabs-api-key");
    if (savedElevenlabsKey) setElevenlabsKey(savedElevenlabsKey);
  }, []);
  
  // Save API key to local storage
  const handleSaveApiKey = (elevenlabsKey: string) => {
    setElevenlabsKey(elevenlabsKey);
    localStorage.setItem("elevenlabs-api-key", elevenlabsKey);
  };
  
  // Get the plain text content from HTML
  const getPlainTextFromHTML = (html: string): string => {
    // Create a temporary div to hold the HTML content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Get the text content
    const text = tempDiv.textContent || tempDiv.innerText || "";
    
    // Clean up the text (remove extra whitespace)
    return text.replace(/\s+/g, ' ').trim();
  };
  
  // Handle URL submission
  const handleSubmitUrl = async (url: string) => {
    try {
      // Reset state
      setStatus(ProcessingStatus.LOADING);
      setError(null);
      setArticle(null);
      setAudioData(null);
      
      // Extract article
      setStatus(ProcessingStatus.EXTRACTING);
      console.log("Extracting article from URL:", url);
      const extractedArticle = await extractArticle(url);
      console.log("Article extracted successfully:", extractedArticle.title);
      setArticle(extractedArticle);
      
      // Check if we have an ElevenLabs API key
      if (!elevenlabsKey) {
        toast({
          title: "API Key Required",
          description: "Please set your ElevenLabs API key to convert the article to audio.",
          variant: "destructive"
        });
        setStatus(ProcessingStatus.ERROR);
        setError("ElevenLabs API key is required to convert to audio.");
        return;
      }
      
      // Get article text content
      setStatus(ProcessingStatus.CONVERTING);
      console.log("Converting article to speech");
      const articleText = extractedArticle.title + ". " + getPlainTextFromHTML(extractedArticle.content);
      console.log("Article text length:", articleText.length);
      
      // Convert article text to speech
      const audioData = await convertToSpeech(
        articleText,
        elevenlabsKey
      );
      console.log("Speech conversion complete, audio URL created");
      setAudioData(audioData);
      
      // Done!
      setStatus(ProcessingStatus.READY);
    } catch (error) {
      console.error("Error processing article:", error);
      setError(error instanceof Error ? error.message : "Unknown error occurred");
      setStatus(ProcessingStatus.ERROR);
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process article",
        variant: "destructive"
      });
    }
  };
  
  return (
    <TooltipProvider>
      <div className="flex flex-col min-h-screen font-inter">
        {/* Header */}
        <header className="border-b bg-white p-4">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl font-instrument font-bold text-audio-dark">
              Audicle
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Convert articles to audio
            </p>
            <div className="absolute top-4 right-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsApiKeyModalOpen(true)}
                className="border-audio/30 text-audio-dark hover:bg-audio hover:text-white"
              >
                <Settings className="h-4 w-4 mr-2" />
                API Key
              </Button>
            </div>
          </div>
        </header>
        
        {/* Main content */}
        <main className="flex-1 container mx-auto py-6 px-4 flex flex-col">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 h-[70vh]">
            {/* Left panel - Article view */}
            <div className="article-panel h-full overflow-hidden flex flex-col border rounded-lg shadow-sm">
              <ArticleView
                article={article}
                status={status}
                onSubmitUrl={handleSubmitUrl}
                error={error}
              />
            </div>
            
            {/* Right panel - Audio player */}
            <div className="audio-panel h-full overflow-hidden border rounded-lg shadow-sm">
              <AudioPanel
                audioData={audioData}
                status={status}
                articleTitle={article?.title}
              />
            </div>
          </div>
        </main>
        
        {/* Footer */}
        <footer className="border-t bg-white p-4 text-center text-sm text-gray-500">
          <div className="container mx-auto">
            <p>
              Audicle • Convert articles to audio
            </p>
          </div>
        </footer>
        
        {/* API Key Modal */}
        <ApiKeyModal
          isOpen={isApiKeyModalOpen}
          onClose={() => setIsApiKeyModalOpen(false)}
          onSaveKeys={handleSaveApiKey}
        />
      </div>
    </TooltipProvider>
  );
};

export default Index;
