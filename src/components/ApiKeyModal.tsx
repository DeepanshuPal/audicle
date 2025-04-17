
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveKeys: (elevenlabsKey: string) => void;
}

const ApiKeyModal = ({ isOpen, onClose, onSaveKeys }: ApiKeyModalProps) => {
  const [elevenlabsKey, setElevenlabsKey] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveKeys(elevenlabsKey);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>API Key</DialogTitle>
          <DialogDescription>
            Enter your ElevenLabs API key to enable text-to-speech functionality.
            Your key is stored locally and never sent to our servers.
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
          
          <DialogFooter>
            <Button type="submit" className="bg-audio hover:bg-audio-dark">
              Save Key
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyModal;
