import GAuthButton from "./GAuthButton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AuthModal({
  open,
  onClose,
}: AuthModalProps) {

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-96 h-36 bg-zinc-900">
        <DialogHeader>
          <DialogTitle>Sign In</DialogTitle>
          <DialogDescription>
            To save your favorite fonts, please authenticate.
          </DialogDescription>
        </DialogHeader>
        <div className="flex w-full justify-center">
          <GAuthButton />
        </div>
      </DialogContent>
    </Dialog>
  );
}