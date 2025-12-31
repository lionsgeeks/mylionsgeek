import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm, router } from '@inertiajs/react';
import { Plus, X } from "lucide-react";

export default function CoursesModal() {
  const [open, setOpen] = useState(false);
  const [badge1Preview, setBadge1Preview] = useState(null);
  const [badge2Preview, setBadge2Preview] = useState(null);
  const [badge3Preview, setBadge3Preview] = useState(null);

  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    description: '',
    badge1: null,
    badge2: null,
    badge3: null,
  });

  function handleSubmit(e) {
    e.preventDefault();

    post('/admin/courses', {
      forceFormData: true,
      onSuccess: () => {
        reset();
        setBadge1Preview(null);
        setBadge2Preview(null);
        setBadge3Preview(null);
        setOpen(false);
        router.reload({ only: ['courses'], preserveState: false });
      },
      onError: (errors) => {
        console.error('Form errors:', errors);
      },
    });
  }

  const handleFileChange = (badgeNumber, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (badgeNumber === 1) setBadge1Preview(reader.result);
        else if (badgeNumber === 2) setBadge2Preview(reader.result);
        else if (badgeNumber === 3) setBadge3Preview(reader.result);
      };
      reader.readAsDataURL(file);
      setData(`badge${badgeNumber}`, file);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-2">
        <Plus size={16} />
        Add Course
      </Button>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-dark dark:text-light">Add New Course</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOpen(false)}
                >
                  <X size={18} />
                </Button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark dark:text-light mb-2">
                  Course Name
                </label>
                <Input
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  placeholder="Enter course name"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-dark dark:text-light mb-2">
                  Description
                </label>
                <Textarea
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  placeholder="Enter course description"
                  rows={3}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((badgeNumber) => (
                  <div key={badgeNumber}>
                    <label className="block text-sm font-medium text-dark dark:text-light mb-2">
                      Badge {badgeNumber}
                    </label>
                    <div className="space-y-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(badgeNumber, e.target.files[0])}
                        className={errors[`badge${badgeNumber}`] ? 'border-red-500' : ''}
                      />
                      {eval(`badge${badgeNumber}Preview`) && (
                        <img
                          src={eval(`badge${badgeNumber}Preview`)}
                          alt={`Badge ${badgeNumber} preview`}
                          className="w-full h-32 object-cover rounded"
                        />
                      )}
                    </div>
                    {errors[`badge${badgeNumber}`] && (
                      <p className="mt-1 text-sm text-red-500">{errors[`badge${badgeNumber}`]}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={processing}
                  className="flex-1"
                >
                  {processing ? 'Creating...' : 'Create Course'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={processing}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
