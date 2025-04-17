
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Link as LinkIcon } from "lucide-react";
import { ArticleData, ProcessingStatus } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ArticleViewProps {
  article: ArticleData | null;
  status: ProcessingStatus;
  onSubmitUrl: (url: string) => void;
  error?: string | null;
}

const ArticleView = ({
  article,
  status,
  onSubmitUrl,
  error
}: ArticleViewProps) => {
  const [url, setUrl] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmitUrl(url.trim());
    }
  };
  
  const isLoading = [
    ProcessingStatus.LOADING,
    ProcessingStatus.EXTRACTING,
    ProcessingStatus.SUMMARIZING,
    ProcessingStatus.CONVERTING
  ].includes(status);
  
  const getStatusMessage = () => {
    switch (status) {
      case ProcessingStatus.EXTRACTING:
        return "Extracting article...";
      case ProcessingStatus.SUMMARIZING:
        return "Processing article...";
      case ProcessingStatus.CONVERTING:
        return "Converting to audio...";
      default:
        return "Processing...";
    }
  };
  
  return (
    <div className="h-full flex flex-col">
      <form onSubmit={handleSubmit} className="p-4 border-b">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Input
              placeholder="Paste article URL here and press Enter"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="pr-10 focus-visible:ring-audio"
              disabled={isLoading}
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <LinkIcon size={16} />
            </span>
          </div>
          <Button 
            type="submit" 
            disabled={!url.trim() || isLoading}
            className="bg-audio hover:bg-audio-dark"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing
              </>
            ) : (
              "Convert"
            )}
          </Button>
        </div>
        
        {isLoading && (
          <div className="mt-2 text-sm text-gray-500 animate-pulse">
            {getStatusMessage()}
          </div>
        )}
        
        {error && (
          <div className="mt-2 text-sm text-red-500">
            {error}
          </div>
        )}
      </form>
      
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" style={{ maxHeight: "calc(70vh - 100px)" }}>
          <div className="p-6">
            {article ? (
              <div className="prose prose-sm max-w-none">
                <h1 className="text-2xl font-instrument font-bold mb-4">{article.title}</h1>
                
                {article.author && (
                  <p className="text-sm text-gray-500 mb-4">
                    By {article.author}
                    {article.publishDate && ` • ${article.publishDate}`}
                  </p>
                )}
                
                <div dangerouslySetInnerHTML={{ __html: article.content }} />
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <div className="text-center max-w-sm">
                  <h3 className="text-lg font-instrument font-medium mb-2">Paste an article URL above</h3>
                  <p className="text-sm">
                    Enter the URL of any article and we'll convert it to podcast-style audio.
                  </p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default ArticleView;
