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

export function ExperienceMenuModal({ experience }) {
    const [openEdit, setOpenEdit] = useState(false)
    const [openDelete, setOpenDelete] = useState(false)

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
        </>
    )
}
