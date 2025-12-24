"use client"

import { useState } from "react"
import { Edit2, MoreHorizontalIcon, Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import EditExperienceModal from "./EditExperienceModal"
import { router } from "@inertiajs/react"
import DeleteModal from "./DeleteModal"

export function ExperienceMenuModal({ experience }) {
    const [openEdit, setOpenEdit] = useState(false)
    const [openDelete, setOpenDelete] = useState(false)
    const deleteExperience = (id) => {
        try {
            // Update existing experience
            router.delete(`/users/experience/${id}`, {
                onSuccess: () => {
                },
                onError: (error) => {
                    console.log(error);
                }
            });
        } catch (error) {
            console.log(error);
        }
    }
    return (
        <>
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" aria-label="Open menu" size="icon-sm">
                        <MoreHorizontalIcon />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-40 dark:bg-dark" align="end">
                    <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => setOpenEdit(true)}>
                            <span className="flex gap-2 items-center"><Edit2 />Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <span onClick={() => setOpenDelete(true)} className="flex gap-2 items-center text-error"><Trash className="text-error" />Delete</span>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
            {openEdit && <EditExperienceModal onOpen={openEdit} onOpenChange={setOpenEdit} item={experience} />}
            {openDelete && <DeleteModal open={openDelete} onOpenChange={setOpenDelete} title='Delete this experience' description="Are you sure want To delete this Experience" onConfirm={() => deleteExperience(experience?.id)} />}
        </>
    )
}
