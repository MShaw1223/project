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
    entryprice: number;
    stoploss: number;
    takeprofit: number;
  };
}

function NotesModal({ info }: NotesModalProps) {
  return (
    <>
      <Dialog>
        <DialogTrigger>Open Note</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Entry on {info.currencypair}</DialogTitle>
            <DialogDescription>{info.tradenotes}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}

function EntryInfoModal({ info }: NotesModalProps) {
  return (
    <>
      <Dialog>
        <DialogTrigger>Details</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Entry on {info.currencypair}</DialogTitle>
            <DialogDescription>
              Entry: {info.entryprice}
              <br />
              Stop Loss: {info.stoploss}
              <br />
              Take Profit: {info.takeprofit}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}

export { NotesModal, EntryInfoModal };
