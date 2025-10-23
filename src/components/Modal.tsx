import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: "success" | "error" | "info";
  confirmButton?: {
    text: string;
    onClick: () => void;
  };
}

const Modal = ({ isOpen, onClose, title, message, type = "info", confirmButton }: ModalProps) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return (
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case "error":
        return (
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-card rounded-xl shadow-2xl border border-border animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>
        
        <div className="p-6 space-y-4">
          {getIcon()}
          
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold text-foreground">
              {title}
            </h3>
            <p className="text-muted-foreground whitespace-pre-line">
              {message}
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            {confirmButton ? (
              <>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    confirmButton.onClick();
                    onClose();
                  }}
                  className="flex-1"
                >
                  {confirmButton.text}
                </Button>
              </>
            ) : (
              <Button
                onClick={onClose}
                className="w-full"
              >
                OK
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
