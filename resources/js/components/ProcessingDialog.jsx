import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

const ProcessingDialog = ({ open, title = 'Processing', description = 'Please wait while this finishes.' }) => {
    return (
        <Dialog open={open}>
            <DialogContent
                showCloseButton={false}
                className="sm:max-w-sm"
                onInteractOutside={(event) => event.preventDefault()}
                onEscapeKeyDown={(event) => event.preventDefault()}
            >
                <DialogHeader className="items-center sm:text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin" aria-hidden="true" />
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
};

export default ProcessingDialog;
