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

    export default function SendEmailDialog({ open, setOpen, trainings, filteredUsers, roles = [] }) {
        const [selectedTrainingIds, setSelectedTrainingIds] = useState([]);
        const [selectedRoles, setSelectedRoles] = useState([]);
        const [selectAllTrainings, setSelectAllTrainings] = useState(false);
        const [selectAllRoles, setSelectAllRoles] = useState(false);
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

        const searchedUsers = useMemo(() => {
            if (!userSearchQuery.trim()) return filteredUsers;
            const q = userSearchQuery.toLowerCase();
            return filteredUsers.filter(
                (user) =>
                    (user.name || "").toLowerCase().includes(q) ||
                    (user.email || "").toLowerCase().includes(q)
            );
        }, [userSearchQuery, filteredUsers]);

        const handleTrainingToggle = (trainingId) => {
            if (trainingId === "all") {
                setSelectAllTrainings(!selectAllTrainings);
                setSelectedTrainingIds([]);
                return;
            }

            const id = Number(trainingId);
            setSelectedTrainingIds((prev) =>
                prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
            );

            setSelectAllTrainings(false);
        };

        const handleRoleToggle = (role) => {
            if (role === "all") {
                setSelectAllRoles(!selectAllRoles);
                setSelectedRoles([]);
                return;
            }

            setSelectedRoles((prev) =>
                prev.includes(role)
                    ? prev.filter((r) => r !== role)
                    : [...prev, role]
            );

            setSelectAllRoles(false);
        };

        const formatRoleLabel = (role) =>
            role === "studio_responsable"
                ? "Responsable Studio"
                : role.charAt(0).toUpperCase() + role.slice(1);

        const selectedTrainingUsers = useMemo(() => {
            let users = [];

            if (selectAllTrainings) {
                users = filteredUsers;
            } else if (selectedTrainingIds.length > 0) {
                users = filteredUsers.filter((u) =>
                    selectedTrainingIds.includes(u.formation_id)
                );
            }

            if (selectAllRoles) {
                if (users.length === 0 && selectedTrainingIds.length === 0) {
                    users = filteredUsers;
                }
            } else if (selectedRoles.length > 0) {
                const roleUsers = filteredUsers.filter((u) => {
                    const userRoles = Array.isArray(u.role) ? u.role : [u.role];
                    return userRoles.some((r) =>
                        selectedRoles.includes(r?.toLowerCase())
                    );
                });

                if (users.length > 0) {
                    const ids = new Set(roleUsers.map((u) => u.id));
                    users = users.filter((u) => ids.has(u.id));
                } else {
                    users = roleUsers;
                }
            }

            if (selectedUserIds.length > 0) {
                users = [
                    ...users,
                    ...filteredUsers.filter((u) => selectedUserIds.includes(u.id)),
                ];
            }

            return users.filter(
                (u, i, arr) => arr.findIndex((x) => x.id === u.id) === i
            );
        }, [
            selectAllTrainings,
            selectAllRoles,
            selectedTrainingIds,
            selectedRoles,
            selectedUserIds,
            filteredUsers,
        ]);

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
                        role_ids: selectAllRoles ? null : selectedRoles,
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
            } catch {
                alert("Failed to send email. Try again.");
            }

            setEmailProcessing(false);
        };

        const resetDialog = () => {
            setSelectedTrainingIds([]);
            setSelectAllTrainings(false);
            setSelectedRoles([]);
            setSelectAllRoles(false);
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
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="min-w-[60vw] max-w-[90vw] max-h-[90%] h-fit overflow-y-scroll px-6">
                    <DialogHeader className="pb-6">
                        <DialogTitle className="text-2xl font-bold">
                            Send Newsletter Email
                        </DialogTitle>
                        <DialogDescription className="text-base">
                            Select recipients by training, role, or individual users and
                            compose your message.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSendEmail} className="space-y-6">
                        <Input
                            value={userSearchQuery}
                            onChange={(e) => setUserSearchQuery(e.target.value)}
                            placeholder="Search for individual users..."
                            className={`${inputClass} text-base px-4`}
                        />

                        {!userSearchQuery.trim() && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                                <div className="space-y-4 p-5 border rounded-xl bg-muted/30">
                                    <Label className="text-base font-semibold">
                                        Select Training(s)
                                    </Label>


                                    <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-alpha/10 transition-colors bg-background">
                                        <Checkbox
                                            checked={selectAllTrainings}
                                            onClick={(e) => e.stopPropagation()}
                                            onCheckedChange={() => handleTrainingToggle("all")}
                                        />
                                        <label
                                            onClick={() => handleTrainingToggle("all")}
                                            className="text-sm cursor-pointer flex-1 font-medium"
                                        >
                                            All Trainings ({filteredUsers.length} users)
                                        </label>
                                    </div>


                                    <div className="space-y-2 border rounded-lg p-3 bg-background max-h-70 overflow-y-auto">
                                        {trainings
                                            .filter((t) => {
                                                if (!userSearchQuery.trim()) return true;
                                                const q = userSearchQuery.toLowerCase();
                                                return (
                                                    t.name.toLowerCase().includes(q) ||
                                                    (t.coach?.name || "")
                                                        .toLowerCase()
                                                        .includes(q)
                                                );
                                            })
                                            .map((t) => {
                                                const count = filteredUsers.filter(
                                                    (u) => u.formation_id === t.id
                                                ).length;

                                                const isSelected =
                                                    selectedTrainingIds.includes(t.id);

                                                return (
                                                    <div
                                                        key={t.id}
                                                        className="flex items-center gap-3 p-2.5 rounded-md hover:bg-alpha/10 transition-colors"
                                                    >
                                                        <Checkbox
                                                            checked={isSelected}
                                                            onClick={(e) => e.stopPropagation()}
                                                            onCheckedChange={() =>
                                                                handleTrainingToggle(t.id)
                                                            }
                                                        />

                                                        <label
                                                            className="flex flex-col cursor-pointer"
                                                            onClick={() =>
                                                                handleTrainingToggle(t.id)
                                                            }
                                                        >
                                                            <span className="font-medium text-sm">
                                                                {t.name}{" "}
                                                                <span className="text-muted-foreground">
                                                                    ({count})
                                                                </span>
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                Coach: {t.coach?.name || "—"}
                                                            </span>
                                                        </label>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>


                                <div className="space-y-4 p-5 border rounded-xl bg-muted/30">
                                    <Label className="text-base font-semibold">
                                        Select Role(s)
                                    </Label>

                                    <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-alpha/10 transition-colors bg-background">
                                        <Checkbox
                                            checked={selectAllRoles}
                                            onClick={(e) => e.stopPropagation()}
                                            onCheckedChange={() => handleRoleToggle("all")}
                                        />
                                        <label
                                            className="text-sm cursor-pointer flex-1"
                                            onClick={() => handleRoleToggle("all")}
                                        >
                                            All Roles ({filteredUsers.length} users)
                                        </label>
                                    </div>

                                    <div className="max-h-64 overflow-y-auto space-y-2 border rounded-lg p-3 bg-background">
                                        {roles.map((role) => {
                                            const count = filteredUsers.filter((u) => {
                                                const userRoles = Array.isArray(u.role)
                                                    ? u.role
                                                    : [u.role];
                                                return userRoles.some(
                                                    (r) =>
                                                        r?.toLowerCase() ===
                                                        role.toLowerCase()
                                                );
                                            }).length;

                                            const isSelected = selectedRoles.includes(
                                                role.toLowerCase()
                                            );

                                            return (
                                                <div
                                                    key={role}
                                                    className="flex items-center gap-3 p-2.5 rounded-md hover:bg-alpha/10 transition-colors"
                                                >
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onClick={(e) => e.stopPropagation()}
                                                        onCheckedChange={() =>
                                                            handleRoleToggle(
                                                                role.toLowerCase()
                                                            )
                                                        }
                                                    />

                                                    <label
                                                        className="flex items-center cursor-pointer flex-1"
                                                        onClick={() =>
                                                            handleRoleToggle(
                                                                role.toLowerCase()
                                                            )
                                                        }
                                                    >
                                                        <span className="font-medium text-sm">
                                                            {formatRoleLabel(role)}{" "}
                                                            <span className="text-muted-foreground">
                                                                ({count})
                                                            </span>
                                                        </span>
                                                    </label>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}


                        {userSearchQuery.trim() && (
                            <div className="space-y-4 p-5 border rounded-xl bg-muted/30">
                                <Label className="text-base font-semibold">
                                    Select Individual Users
                                </Label>

                                <div className="max-h-48 overflow-y-auto space-y-2 border rounded-lg p-3 bg-background">
                                    {searchedUsers.length > 0 ? (
                                        searchedUsers.map((user) => {
                                            const isSelected =
                                                selectedUserIds.includes(user.id);

                                            const toggle = () =>
                                                setSelectedUserIds((prev) =>
                                                    prev.includes(user.id)
                                                        ? prev.filter((id) => id !== user.id)
                                                        : [...prev, user.id]
                                                );

                                            return (
                                                <div
                                                    key={user.id}
                                                    className="flex items-center gap-3 p-2.5 rounded-md hover:bg-alpha/10 transition-colors"
                                                >
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onClick={(e) => e.stopPropagation()}
                                                        onCheckedChange={toggle}
                                                    />

                                                    <label
                                                        className="flex flex-col cursor-pointer flex-1"
                                                        onClick={toggle}
                                                    >
                                                        <span className="font-medium text-sm">
                                                            {user.name || "No name"}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {user.email}
                                                        </span>
                                                    </label>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <span className="text-xs text-muted-foreground">
                                            No user found
                                        </span>
                                    )}
                                </div>

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
                            </div>
                        )}


                        {(selectAllTrainings ||
                            selectAllRoles ||
                            selectedTrainingIds.length > 0 ||
                            selectedRoles.length > 0 ||
                            selectedUserIds.length > 0) && (
                            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                                <p className="text-sm font-medium">
                                    <span className="text-muted-foreground">Sending to:</span>{" "}
                                    <strong className="text-foreground text-base">
                                        {selectedTrainingUsers.length}
                                    </strong>{" "}
                                    user{selectedTrainingUsers.length !== 1 && "s"}
                                </p>
                            </div>
                        )}


                        <div className="flex flex-col gap-3 p-5 border rounded-xl bg-muted/30">
                            <Label className="text-base font-semibold">Email Subject</Label>
                            <Input
                                value={emailSubject}
                                onChange={(e) => setEmailSubject(e.target.value)}
                                placeholder="Enter email subject..."
                                className={`${inputClass} text-base py-2.5 px-4`}
                                required
                            />
                        </div>


                        <div className="flex flex-col gap-5 p-5 border rounded-xl bg-muted/30">
                            <Label className="text-base font-semibold">
                                Message Content{" "}
                                <span className="text-xs text-muted-foreground font-normal">
                                    (at least 1 language required)
                                </span>
                            </Label>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* french */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">French 🇫🇷</Label>
                                    <Textarea
                                        rows={6}
                                        value={emailBodyFr}
                                        onChange={(e) => setEmailBodyFr(e.target.value)}
                                        placeholder="French content..."
                                        className={`${inputClass} text-sm p-3`}
                                    />
                                </div>

                                {/* arabic */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Arabic 🇸🇦</Label>
                                    <Textarea
                                        rows={6}
                                        dir="rtl"
                                        value={emailBodyAr}
                                        onChange={(e) => setEmailBodyAr(e.target.value)}
                                        placeholder="المحتوى العربي..."
                                        className={`${inputClass} text-sm p-3`}
                                    />
                                </div>

                                {/* english */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">English 🇬🇧</Label>
                                    <Textarea
                                        rows={6}
                                        value={emailBodyEn}
                                        onChange={(e) => setEmailBodyEn(e.target.value)}
                                        placeholder="English content..."
                                        className={`${inputClass} text-sm p-3`}
                                    />
                                </div>
                            </div>


                            <details className="mt-2">
                                <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground py-2">
                                    Legacy Single Body Field (Optional)
                                </summary>
                                <Textarea
                                    rows={4}
                                    className={`${inputClass} text-sm p-3 mt-2`}
                                    value={emailBody}
                                    onChange={(e) => setEmailBody(e.target.value)}
                                    placeholder="Legacy body content..."
                                />
                            </details>
                        </div>


                        {selectedTrainingUsers.length > 0 &&
                            selectedTrainingUsers.length <= 20 && (
                                <div className="p-4 bg-muted/50 rounded-xl border">
                                    <Label className="font-semibold text-sm">
                                        Recipients Preview ({selectedTrainingUsers.length})
                                    </Label>
                                    <div className="max-h-32 overflow-y-auto mt-2 text-xs space-y-1">
                                        {selectedTrainingUsers.slice(0, 15).map((u) => (
                                            <div key={u.id} className="flex gap-2 py-0.5">
                                                <span className="font-medium">{u.name}</span>
                                                <span className="text-muted-foreground">
                                                    ({u.email})
                                                </span>
                                            </div>
                                        ))}
                                        {selectedTrainingUsers.length > 15 && (
                                            <p className="text-xs mt-1 text-muted-foreground">
                                                ...and {selectedTrainingUsers.length - 15} more
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}


                        <DialogFooter>
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
                                        !selectAllRoles &&
                                        selectedTrainingIds.length === 0 &&
                                        selectedRoles.length === 0 &&
                                        selectedUserIds.length === 0) ||
                                    !emailSubject.trim() ||
                                    (!emailBody.trim() &&
                                        !emailBodyFr.trim() &&
                                        !emailBodyAr.trim() &&
                                        !emailBodyEn.trim())
                                }
                                className="bg-[var(--color-alpha)] text-black border border-[var(--color-alpha)] hover:bg-transparent hover:text-[var(--color-alpha)] cursor-pointer text-base font-semibold"
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
