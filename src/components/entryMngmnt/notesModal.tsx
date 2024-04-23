import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface NotesModalProps {
  info: {
    tradenotes: string;
    currencypair: string;
  };
}

export default function NotesModal({ info }: NotesModalProps) {
  return (
    <Dialog>
      <DialogTrigger>Open Note</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Entry on {info.currencypair}</DialogTitle>
          <DialogDescription>{info.tradenotes}</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
