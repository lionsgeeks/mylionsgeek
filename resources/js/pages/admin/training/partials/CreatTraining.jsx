import { useState } from 'react';
import { PlusCircle, Code, ImageIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm, router  } from '@inertiajs/react';

export default function CreatTraining({ coaches }) {
  const [open, setOpen] = useState(false); 
  const { data, setData, post, processing, reset, errors } = useForm({
    name: '',
    category: '',
    start_time: '',
    user_id: '',
    promo: ''
  });

  function handleSubmit(e) {
    e.preventDefault();
    post('/admin/training', data, {
      onSuccess: () => {
        reset();
        setOpen(false); 
        router.reload({ only: ['trainings'] });
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white">
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
            <Select
              value={data.category}
              onValueChange={(value) => setData('category', value)}
            >
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
              value={data.start_time}
              onChange={(e) => setData('start_time', e.target.value)}
            />
            {errors.start_time && <p className="text-red-600 text-sm">{errors.start_time}</p>}
          </div>

          {/* Coach */}
          <div>
            <Label>Coach</Label>
            <Select
              value={data.user_id?.toString()}
              onValueChange={(value) => setData('user_id', Number(value))}
            >
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
            {errors.user_id && <p className="text-red-600 text-sm">{errors.user_id}</p>}
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
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700"
              disabled={processing}
            >
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
