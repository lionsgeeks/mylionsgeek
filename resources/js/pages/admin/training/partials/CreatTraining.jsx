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
import { useForm } from '@inertiajs/react'

export default function CreatTraining({ coaches  }) {
  const { data, setData, post, processing, reset, errors } = useForm({
    name: '',
    category: '',
    starting_day: '',
    coach_id: '',
    promo: ''
  })
  console.log(typeof data.coach_id)
  function handleSubmit(e) {
    e.preventDefault()
    post('/admin/training', { ...data }, {
  onSuccess: () => reset()
})

  }

  return (
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

        <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
          {/* Training Name */}
          <div>
            <Label htmlFor="title">Training Name</Label>
            <Input
              id="title"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
              placeholder="Enter training name"
            />
            {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}
          </div>

          {/* Category */}
          <div>
            <Label>Category</Label>
            <Select onValueChange={(value) => setData('category', value)}>
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
            {errors.category && <p className="text-red-600 text-sm">{errors.category}</p>}
          </div>

          {/* Starting Day */}
          <div>
            <Label htmlFor="startDay">Starting Day</Label>
            <Input
              id="startDay"
              type="date"
              value={data.starting_day}
              onChange={(e) => setData('starting_day', e.target.value)}
            />
            {errors.starting_day && <p className="text-red-600 text-sm">{errors.starting_day}</p>}
          </div>

          {/* Coach */}
          <div>
            <Label>Coach</Label>
            <Select onValueChange={(value) => setData('coach_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select coach" />
              </SelectTrigger>
              <SelectContent>
                {coaches?.map((coach) => (
                  <SelectItem key={coach.id} value={coach.id.toString()}>
                    {coach.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.coach_id && <p className="text-red-600 text-sm">{errors.coach_id}</p>}
          </div>

          {/* Promo */}
          <div>
            <Label htmlFor="promo">Promo</Label>
            <Input
              id="promo"
              value={data.promo}
              onChange={(e) => setData('promo', e.target.value)}
              placeholder="Enter promo name/number"
            />
            {errors.promo && <p className="text-red-600 text-sm">{errors.promo}</p>}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={processing}>
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
