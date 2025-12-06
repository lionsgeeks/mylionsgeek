import React, { useMemo, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

export default function SendEmailDialog({ open, setOpen, trainings, filteredUsers }) {
    const [selectedTrainingIds, setSelectedTrainingIds] = useState([]);
    const [selectAllTrainings, setSelectAllTrainings] = useState(false);
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [userSearchQuery, setUserSearchQuery] = useState("");

    const [emailSubject, setEmailSubject] = useState("");
    const [emailBody, setEmailBody] = useState("");
    const [emailBodyFr, setEmailBodyFr] = useState("");
    const [emailBodyAr, setEmailBodyAr] = useState("");
    const [emailBodyEn, setEmailBodyEn] = useState("");

    const [emailProcessing, setEmailProcessing] = useState(false);

    const inputClass =
        "bg-[#e5e5e5] dark:bg-[#262626] text-black dark:text-white placeholder:text-[#0a0a0a]/50 dark:placeholder:text-white focus:ring-2 focus:ring-alpha";

    // Filter users by global search
    const searchedUsers = useMemo(() => {
        if (!userSearchQuery.trim()) return filteredUsers;
        const q = userSearchQuery.toLowerCase();
        return filteredUsers.filter(
            (user) =>
                (user.name || "").toLowerCase().includes(q) ||
                (user.email || "").toLowerCase().includes(q)
        );
    }, [userSearchQuery, filteredUsers]);

    // Training selection logic
    const handleTrainingToggle = (trainingId) => {
        if (trainingId === "all") {
            setSelectAllTrainings(!selectAllTrainings);
            setSelectedTrainingIds([]);
            return;
        }
        const id = Number(trainingId);
        if (selectedTrainingIds.includes(id)) {
            setSelectedTrainingIds(selectedTrainingIds.filter((t) => t !== id));
        } else {
            setSelectedTrainingIds([...selectedTrainingIds, id]);
        }
        setSelectAllTrainings(false);
    };

    // Determine recipients
    const selectedTrainingUsers = useMemo(() => {
        let users = [];

        if (selectAllTrainings) {
            users = filteredUsers;
        } else if (selectedTrainingIds.length > 0) {
            users = filteredUsers.filter((u) =>
                selectedTrainingIds.includes(u.formation_id)
            );
        }

        // Add manually-selected users
        if (selectedUserIds.length > 0) {
            const extraUsers = filteredUsers.filter((u) =>
                selectedUserIds.includes(u.id)
            );
            users = [...users, ...extraUsers];
        }

        // Remove duplicates
        const unique = users.filter(
            (u, i, arr) => arr.findIndex((x) => x.id === u.id) === i
        );

        return unique;
    }, [selectAllTrainings, selectedTrainingIds, selectedUserIds, filteredUsers]);

    // Send Email Handler
    const handleSendEmail = async (e) => {
        e.preventDefault();

        if (
            !emailSubject.trim() ||
            (!emailBody.trim() &&
                !emailBodyFr.trim() &&
                !emailBodyAr.trim() &&
                !emailBodyEn.trim())
        ) {
            alert("Please provide at least one language content.");
            return;
        }

        setEmailProcessing(true);

        try {
            const response = await fetch("/admin/users/send-email", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN":
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute("content") || "",
                },
                credentials: "same-origin",
                body: JSON.stringify({
                    training_ids: selectAllTrainings ? null : selectedTrainingIds,
                    user_ids: selectedUserIds.length > 0 ? selectedUserIds : null,
                    subject: emailSubject,
                    body: emailBody.trim() || null,
                    body_fr: emailBodyFr.trim() || null,
                    body_ar: emailBodyAr.trim() || null,
                    body_en: emailBodyEn.trim() || null,
                }),
            });

            const result = await response.json();

            if (response.ok) {
                alert(
                    result.message ||
                        `Email sent to ${result.total_users || result.sent_count} users.`
                );
                resetDialog();
            } else {
                alert(result.error || "Error sending email.");
            }
        } catch (err) {
            alert("Failed to send email. Try again.");
        }

        setEmailProcessing(false);
    };

    const resetDialog = () => {
        setSelectedTrainingIds([]);
        setSelectAllTrainings(false);
        setSelectedUserIds([]);
        setUserSearchQuery("");

        setEmailSubject("");
        setEmailBody("");
        setEmailBodyFr("");
        setEmailBodyAr("");
        setEmailBodyEn("");

        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen} >
            <DialogContent className="min-w-[50vw] max-h-[95vh] overflow-y-auto p-8 ">
                <DialogHeader className="pb-6">
                    <DialogTitle className="text-2xl font-bold">Send Newsletter Email</DialogTitle>
                    <DialogDescription className="text-base mt-2">
                        Select recipients and compose your message.
                    </DialogDescription>
                </DialogHeader>

                {/* MAIN FORM */}
                <form onSubmit={handleSendEmail} className="space-y-8 mt-6">

                    {/* Training Selection */}
                    <div className="space-y-4 p-5 border rounded-xl bg-muted/30">
                        <Label className="text-base font-semibold">Select Training(s) / Student(s) </Label>

                        {/* Search */}
                        <Input
                            value={userSearchQuery}
                            onChange={(e) => setUserSearchQuery(e.target.value)}
                            placeholder="Search trainings or users..."
                            className={`${inputClass} text-base py-3 px-4`}
                        />

                        {/* Select All */}
                        <div className="flex items-center gap-3 p-4 border rounded-lg hover:bg-alpha/10 transition-colors bg-background">
                            <Checkbox
                                checked={selectAllTrainings}
                                onCheckedChange={() => handleTrainingToggle("all")}
                            />
                            <label className="text-base cursor-pointer flex-1 font-medium">
                                All Users ({filteredUsers.length})
                            </label>
                        </div>

                        {/* Training List */}
                        <div className="max-h-45 overflow-y-auto space-y-3 border rounded-lg p-4 bg-background">
                            {/* Trainings */}
                            {trainings
                                .filter((t) => {
                                    if (!userSearchQuery.trim()) return true;
                                    const q = userSearchQuery.toLowerCase();
                                    return (
                                        t.name.toLowerCase().includes(q) ||
                                        (t.coach?.name || "").toLowerCase().includes(q)
                                    );
                                })
                                .map((t) => {
                                    const count = filteredUsers.filter(
                                        (u) => u.formation_id === t.id
                                    ).length;

                                    const isSelected = selectedTrainingIds.includes(t.id);

                                    return (
                                        <div
                                            key={t.id}
                                            className="flex items-center gap-3 p-3 rounded-md hover:bg-alpha/10 transition-colors"
                                        >
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={() => handleTrainingToggle(t.id)}
                                            />
                                            <label className="flex flex-col cursor-pointer flex-1">
                                                <span className="font-medium text-base">
                                                    {t.name} ({count})
                                                </span>
                                                <span className="text-sm text-muted-foreground mt-0.5">
                                                    Coach: {t.coach?.name || "—"}
                                                </span>
                                            </label>
                                        </div>
                                    );
                                })}

                            {/* Users (only when searching) */}
                            {userSearchQuery.trim() &&
                                searchedUsers.map((user) => {
                                    const isSelected = selectedUserIds.includes(user.id);

                                    return (
                                        <div
                                            key={user.id}
                                            className="flex items-center gap-3 p-3 rounded-md hover:bg-alpha/10 transition-colors"
                                        >
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setSelectedUserIds([
                                                            ...selectedUserIds,
                                                            user.id,
                                                        ]);
                                                    } else {
                                                        setSelectedUserIds(
                                                            selectedUserIds.filter(
                                                                (id) => id !== user.id
                                                            )
                                                        );
                                                    }
                                                }}
                                            />
                                            <label className="flex flex-col cursor-pointer flex-1">
                                                <span className="font-medium text-base">
                                                    {user.name || "No name"}
                                                </span>
                                                <span className="text-sm text-muted-foreground mt-0.5">
                                                    {user.email}
                                                </span>
                                            </label>
                                        </div>
                                    );
                                })}

                            {/* No results */}
                            {userSearchQuery.trim() &&
                                trainings.filter((t) => {
                                    const q = userSearchQuery.toLowerCase();
                                    return (
                                        t.name.toLowerCase().includes(q) ||
                                        (t.coach?.name || "")
                                            .toLowerCase()
                                            .includes(q)
                                    );
                                }).length === 0 &&
                                searchedUsers.length === 0 && (
                                    <p className="text-center text-sm text-muted-foreground py-4">
                                        No trainings or users found.
                                    </p>
                                )}
                        </div>

                        {/* Reset manual selection */}
                        {selectedUserIds.length > 0 && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedUserIds([])}
                                className="text-sm w-full py-2"
                            >
                                Clear User Selection ({selectedUserIds.length})
                            </Button>
                        )}

                        {(selectAllTrainings ||
                            selectedTrainingIds.length > 0 ||
                            selectedUserIds.length > 0) && (
                            <p className="text-base text-muted-foreground font-medium">
                                Sending to{" "}
                                <strong className="text-foreground">{selectedTrainingUsers.length}</strong>{" "}
                                user{selectedTrainingUsers.length !== 1 && "s"}.
                            </p>
                        )}
                    </div>

                    {/* Subject */}
                    <div className="flex flex-col gap-3 p-5 border rounded-xl bg-muted/30">
                        <Label className="text-base font-semibold">Email Subject</Label>
                        <Input
                            value={emailSubject}
                            onChange={(e) => setEmailSubject(e.target.value)}
                            className={`${inputClass} text-base py-3 px-4`}
                            required
                        />
                    </div>

                    {/* Message Body: Multi-Language */}
                    <div className="flex flex-col gap-6 p-5 border rounded-xl bg-muted/30">
                        <Label className="text-base font-semibold">Message Content (at least 1 language required)</Label>

                        {/* French */}
                        <div className="space-y-2">
                            <Label className="text-base font-semibold flex items-center gap-2">
                                French 🇫🇷
                            </Label>
                            <Textarea
                                rows={8}
                                value={emailBodyFr}
                                onChange={(e) => setEmailBodyFr(e.target.value)}
                                className={`${inputClass} text-base p-4`}
                            />
                        </div>

                        {/* Arabic */}
                        <div className="space-y-2">
                            <Label className="text-base font-semibold flex items-center gap-2">
                                Arabic 🇸🇦
                            </Label>
                            <Textarea
                                rows={8}
                                dir="rtl"
                                value={emailBodyAr}
                                onChange={(e) => setEmailBodyAr(e.target.value)}
                                className={`${inputClass} text-base p-4`}
                            />
                        </div>

                        {/* English */}
                        <div className="space-y-2">
                            <Label className="text-base font-semibold flex items-center gap-2">
                                English 🇬🇧
                            </Label>
                            <Textarea
                                rows={8}
                                value={emailBodyEn}
                                onChange={(e) => setEmailBodyEn(e.target.value)}
                                className={`${inputClass} text-base p-4`}
                            />
                        </div>

                        {/* Legacy field */}
                        <details className="mt-2">
                            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
                                Legacy Single Body Field (Optional)
                            </summary>
                            <Textarea
                                rows={6}
                                className={`${inputClass} text-base p-4 mt-3`}
                                value={emailBody}
                                onChange={(e) => setEmailBody(e.target.value)}
                            />
                        </details>
                    </div>

                    {/* Recipients Preview */}
                    {selectedTrainingUsers.length > 0 && (
                        <div className="p-5 bg-muted rounded-xl border">
                            <Label className="font-semibold text-base">
                                Recipients ({selectedTrainingUsers.length})
                            </Label>
                            <div className="max-h-40 overflow-y-auto mt-3 text-sm space-y-1">
                                {selectedTrainingUsers.slice(0, 10).map((u) => (
                                    <div key={u.id} className="flex gap-2 py-1">
                                        <span>{u.name}</span>
                                        <span className="text-xs text-muted-foreground">
                                            ({u.email})
                                        </span>
                                    </div>
                                ))}
                                {selectedTrainingUsers.length > 10 && (
                                    <p className="text-xs mt-2">
                                        ...and {selectedTrainingUsers.length - 10} more
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <DialogFooter className="pt-6 border-t">
                        <DialogClose asChild>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={resetDialog}
                                className="px-6 py-2.5 text-base"
                            >
                                Cancel
                            </Button>
                        </DialogClose>

                        <Button
                            type="submit"
                            disabled={
                                emailProcessing ||
                                (!selectAllTrainings &&
                                    selectedTrainingIds.length === 0 &&
                                    selectedUserIds.length === 0) ||
                                !emailSubject.trim() ||
                                (!emailBody.trim() &&
                                    !emailBodyFr.trim() &&
                                    !emailBodyAr.trim() &&
                                    !emailBodyEn.trim())
                            }
                            className="bg-[var(--color-alpha)] text-black border border-[var(--color-alpha)] hover:bg-transparent hover:text-[var(--color-alpha)] cursor-pointer px-8 py-2.5 text-base font-semibold"
                        >
                            {emailProcessing
                                ? "Sending..."
                                : `Send to ${selectedTrainingUsers.length} user${
                                      selectedTrainingUsers.length !== 1 ? "s" : ""
                                  }`}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
