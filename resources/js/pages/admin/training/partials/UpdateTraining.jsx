import { useState, useEffect } from 'react';
import { Pencil } from 'lucide-react';
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
import { useForm, router } from '@inertiajs/react';

export default function UpdateTraining({ training, coaches }) {
  const [open, setOpen] = useState(false);

  const { data, setData, put, processing, reset, errors } = useForm({
    name: training.name || '',
    category: training.category || '',
    start_time: training.start_time || '',
    user_id: training.user_id || '',
    promo: training.promo || ''
  });

  const handleOpenChange = (newOpen) => {
    if (!newOpen) {
      reset();
    }
    setOpen(newOpen);
  };

  function handleSubmit(e) {
            e.preventDefault();

            put(`/trainings/${training.id}`, {
        onSuccess: () => {
            setOpen(false);
            router.reload({ only: ['trainings'], preserveState: false });
        },
        onError: (errors) => {
            //('Form errors:', errors);
        }
        });

        }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="flex items-center bg-transparent gap-2 rounded-lg text-yellow-600 border border-transparent  hover:border-yellow-600  px-3 cursor-pointer active:scale-95 hover:bg-transparent">
          <Pencil size={1} />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg bg-light text-dark dark:bg-dark dark:text-light border border-alpha/20">
        <DialogHeader>
          <DialogTitle>Edit Training</DialogTitle>
          <DialogDescription>
            Update the fields below to edit training session.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
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
                <SelectItem value="coding">Coding</SelectItem>
                <SelectItem value="media">Media</SelectItem>
              </SelectContent>
            </Select>
            {errors.category && <p className="text-red-600 text-sm">{errors.category}</p>}
          </div>

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

          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-[var(--color-alpha)] text-black border border-[var(--color-alpha)] hover:bg-transparent hover:text-[var(--color-alpha)] cursor-pointer"
              disabled={processing}
            >
              {processing ? 'Updating...' : 'Update'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
