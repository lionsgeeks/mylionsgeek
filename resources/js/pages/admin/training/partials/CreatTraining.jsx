
import { PlusCircle, Code, ImageIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function CreatTraining() {
  return (
    
      

      <div className="p-6">
        

          {/* Dialog for Add Training */}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                <PlusCircle size={20} />
                Add Training
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Training</DialogTitle>
                <DialogDescription>
                  Fill the form below to create a new training session.
                </DialogDescription>
              </DialogHeader>

              <form className="space-y-4 mt-4">
                {/* Training Name */}
                <div>
                  <Label htmlFor="title">Training Name</Label>
                  <Input id="title" placeholder="Enter training name" />
                </div>

                {/* Category */}
                <div>
                  <Label>Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="coding">
                        <div className="flex items-center gap-2">
                          <Code size={16} /> Coding
                        </div>
                      </SelectItem>
                      <SelectItem value="media">
                        <div className="flex items-center gap-2">
                          <ImageIcon size={16} /> Media
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Starting Day */}
                <div>
                  <Label htmlFor="startDay">Starting Day</Label>
                  <Input id="startDay" type="date" />
                </div>

                {/* Coach */}
                <div>
                  <Label>Coach</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select coach" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="coach1">Coach A</SelectItem>
                      <SelectItem value="coach2">Coach B</SelectItem>
                      <SelectItem value="coach3">Coach C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Promo */}
                <div>
                  <Label htmlFor="promo">Promo</Label>
                  <Input id="promo" placeholder="Enter promo name/number" />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    Save
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

      
     
    
  )
}
