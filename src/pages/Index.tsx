
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { ArticleData, AudioData, ProcessingStatus } from "@/lib/types";
import { extractArticle } from "@/lib/article-extractor";
import { convertToSpeech } from "@/lib/text-to-speech";
import { generateSummary } from "@/lib/ai-summarizer";
import ArticleView from "@/components/ArticleView";
import AudioPanel from "@/components/AudioPanel";
import ApiKeyModal from "@/components/ApiKeyModal";

const Index = () => {
  // API Keys
  const [elevenlabsKey, setElevenlabsKey] = useState<string>("");
  const [openaiKey, setOpenaiKey] = useState<string>("");
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  
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
  const handleSubmitUrl = async (url: string) => {
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
  
  return (
    <div className="flex flex-col min-h-screen font-inter">
      {/* Header */}
      <header className="border-b bg-white p-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-instrument font-bold text-audio-dark">
            Audicle
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Convert articles to audio with AI summarization
          </p>
          <div className="absolute top-4 right-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsApiKeyModalOpen(true)}
              className="border-audio/30 text-audio-dark hover:bg-audio hover:text-white"
            >
              <Settings className="h-4 w-4 mr-2" />
              API Keys
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 container mx-auto py-6 px-4 flex flex-col">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 h-[70vh]">
          {/* Left panel */}
          <div className="article-panel h-[70vh] overflow-hidden">
            <ArticleView
              article={article}
              status={status}
              onSubmitUrl={handleSubmitUrl}
              error={error}
            />
          </div>
          
          {/* Right panel */}
          <div className="audio-panel h-[70vh] overflow-hidden">
            <AudioPanel
              fullArticleAudio={fullArticleAudio}
              cruxAudio={cruxAudio}
              status={status}
              fullArticleTitle={article?.title}
              cruxTitle="The Crux"
            />
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t bg-white p-4 text-center text-sm text-gray-500">
        <div className="container mx-auto">
          <p>
            Audicle • Convert articles to audio with AI summarization
          </p>
        </div>
      </footer>
      
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
