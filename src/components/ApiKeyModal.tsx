
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveKeys: (elevenlabsKey: string, openaiKey: string) => void;
}

const ApiKeyModal = ({ isOpen, onClose, onSaveKeys }: ApiKeyModalProps) => {
  const [elevenlabsKey, setElevenlabsKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveKeys(elevenlabsKey, openaiKey);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>API Keys</DialogTitle>
          <DialogDescription>
            Enter your ElevenLabs and OpenAI API keys to enable full functionality.
            Your keys are stored locally and never sent to our servers.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <label htmlFor="elevenlabs-key" className="text-sm font-medium">
              ElevenLabs API Key
            </label>
            <Input
              id="elevenlabs-key"
              type="password"
              value={elevenlabsKey}
              onChange={(e) => setElevenlabsKey(e.target.value)}
              placeholder="Enter your ElevenLabs API key"
            />
            <p className="text-xs text-gray-500">
              Used for high-quality text-to-speech conversion.
            </p>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="openai-key" className="text-sm font-medium">
              OpenAI API Key
            </label>
            <Input
              id="openai-key"
              type="password"
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              placeholder="Enter your OpenAI API key"
            />
            <p className="text-xs text-gray-500">
              Used for article summarization ("The Crux" feature).
            </p>
          </div>
          
          <DialogFooter>
            <Button type="submit" className="bg-audio hover:bg-audio-dark">
              Save Keys
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyModal;
