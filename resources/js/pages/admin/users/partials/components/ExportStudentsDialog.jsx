import React, { useMemo, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

export default function ExportStudentsDialog({ open, setOpen }) {
    const [exportFields, setExportFields] = useState({
        name: true,
        email: true,
        cin: true,
        phone: false,
        formation: true,
        access_studio: false,
        access_cowork: false,
        role: false,
        status: false,
    });

    const exportQuery = useMemo(() => {
        const selected = Object.entries(exportFields)
            .filter(([, v]) => v)
            .map(([k]) => k)
            .join(",");

        return selected.length ? selected : "name,email,cin";
    }, [exportFields]);

    const triggerExport = () => {
        window.open(`/admin/users/export?fields=${encodeURIComponent(exportQuery)}`, "_blank");
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Export Students</DialogTitle>
                    <DialogDescription>Select columns to include.</DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 py-4">
                    {Object.keys(exportFields).map((key) => (
                        <div key={key} className="flex items-center space-x-3">
                            <Checkbox
                                checked={exportFields[key]}
                                onCheckedChange={(checked) =>
                                    setExportFields((prev) => ({
                                        ...prev,
                                        [key]: !!checked,
                                    }))
                                }
                            />
                            <label className="capitalize">{key.replace(/_/g, " ")}</label>
                        </div>
                    ))}
                </div>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={triggerExport} className="bg-[var(--color-alpha)] text-black border border-[var(--color-alpha)] hover:bg-transparent hover:text-[var(--color-alpha)] cursor-pointer">
                        Export
                    </Button>
                    <Button
                        onClick={() => window.open("/admin/users/export", "_blank")}
                        className="bg-[var(--color-alpha)] text-black border border-[var(--color-alpha)] hover:bg-transparent hover:text-[var(--color-alpha)] cursor-pointer"
                    >
                        Export All
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
