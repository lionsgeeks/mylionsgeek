// import React, { useState } from 'react';
// import { router, useForm } from '@inertiajs/react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { ImagePlus } from 'lucide-react';
// import { useInitials } from '@/hooks/use-initials';

// const User = ({ user, trainings = [], roles = [] }) => {

//     const [open, setOpen] = useState(false);
//     const getInitials = useInitials();

//     const { data, setData, processing, errors } = useForm({
//         name: user?.name || '',
//         email: user?.email || '',
//         role: user?.role || '',
//         status: user?.status || '',
//         formation_id: user?.formation_id || null,
//         phone: user?.phone || '', // Make sure the value is initialized properly
//         cin: user?.cin || '', // Make sure the value is initialized properly
//         image: null,
//     });

//     const onSubmit = (e) => {
//         e.preventDefault();
//         console.log(data.role);
//         router.put(`/admin/users/${user.id}`, {
//             forceFormData: true,
//             onSuccess: () => setOpen(false),
//         });
//     };

//     return (
//         <div className="p-10">
//             <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-4">
//                     <Avatar className="h-12 w-12 overflow-hidden rounded-full">
//                         <AvatarImage src={user.image} alt={user?.name} />
//                         <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
//                             {getInitials(user?.name)}
//                         </AvatarFallback>
//                     </Avatar>
//                     <div>
//                         <h2 className="text-xl font-semibold">{user?.name}</h2>
//                         <p className="text-alpha dark:text-beta">{user?.email}</p>
//                     </div>
//                 </div>
//                 <Button onClick={() => setOpen(true)} className="bg-beta text-light hover:bg-beta/90 dark:bg-light dark:text-dark">Modify</Button>
//             </div>

//             <Dialog open={open} onOpenChange={setOpen}>
//                 <DialogContent className="sm:max-w-[720px] bg-light text-dark dark:bg-dark dark:text-light">
//                     <DialogHeader>
//                         <DialogTitle>Modify user</DialogTitle>
//                     </DialogHeader>
//                     <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
//                         <div className="col-span-1">
//                             <Label htmlFor="name">Name</Label>
//                             <Input id="name" value={data.name} onChange={e => setData('name', e.target.value)} />
//                             {errors.name && <p className="text-error text-sm mt-1">{errors.name}</p>}
//                         </div>
//                         <div className="col-span-1">
//                             <Label htmlFor="email">Email</Label>
//                             <Input id="email" type="email" value={data.email} onChange={e => setData('email', e.target.value)} />
//                             {errors.email && <p className="text-error text-sm mt-1">{errors.email}</p>}
//                         </div>
//                         <div className="col-span-1">
//                             {/* <Label htmlFor="email">Email</Label> */}
//                             <Input id="email" type="email" value={data.email} onChange={e => setData('email', e.target.value)} />
//                             {errors.email && <p className="text-error text-sm mt-1">{errors.email}</p>}
//                         </div>
//                         <div className="col-span-1">
//                             <Label>Role</Label>
//                             <Select value={data.role || ''} onValueChange={v => setData('role', v)}>
//                                 <SelectTrigger>
//                                     <SelectValue placeholder="Select role" />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     {roles.map((role, idx) => (
//                                         <SelectItem key={idx} value={role}>{role}</SelectItem>
//                                     ))}
//                                 </SelectContent>
//                             </Select>
//                             {errors.role && <p className="text-error text-sm mt-1">{errors.role}</p>}
//                         </div>
//                         <div className="col-span-1">
//                             <Label>Status</Label>
//                             <Input value={data.status || ''} onChange={e => setData('status', e.target.value)} />
//                             {errors.status && <p className="text-error text-sm mt-1">{errors.status}</p>}
//                         </div>
//                         <div className="col-span-1 md:col-span-2">
//                             <Label>Training</Label>
//                             <Select value={data.formation_id ? String(data.formation_id) : ''} onValueChange={v => setData('formation_id', Number(v))}>
//                                 <SelectTrigger>
//                                     <SelectValue placeholder="Select training" />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     {trainings.map((t) => (
//                                         <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
//                                     ))}
//                                 </SelectContent>
//                             </Select>
//                             {errors.formation_id && <p className="text-error text-sm mt-1">{errors.formation_id}</p>}
//                         </div>

//                         {/* Add Phone Field */}
//                         <div className="col-span-1">
//                             <Label>Phone</Label>
//                             <Input value={data.phone || ''} onChange={e => setData('phone', e.target.value)} />
//                             {errors.phone && <p className="text-error text-sm mt-1">{errors.phone}</p>}
//                         </div>

//                         {/* Add CIN Field */}
//                         <div className="col-span-1">
//                             <Label>Cin</Label>
//                             <Input value={data.cin || ''} onChange={e => setData('cin', e.target.value)} />
//                             {errors.cin && <p className="text-error text-sm mt-1">{errors.cin}</p>}
//                         </div>

//                         <div className="col-span-1 md:col-span-2">
//                             <Label>Avatar</Label>
//                             <div className="flex items-center gap-4">
//                                 <Avatar className="h-12 w-12 overflow-hidden rounded-full">
//                                     <AvatarImage src={user?.image} alt={user?.name} />
//                                     <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
//                                         {getInitials(user?.name || 'U')}
//                                     </AvatarFallback>
//                                 </Avatar>
//                                 <label className="inline-flex items-center gap-2 cursor-pointer rounded-lg border border-alpha px-3 py-2 hover:bg-alpha/10 dark:hover:bg-beta/20">
//                                     <ImagePlus size={18} />
//                                     <span>Upload new</span>
//                                     <input type="file" accept="image/*" className="hidden" onChange={(e) => setData('image', e.target.files?.[0] || null)} />
//                                 </label>
//                             </div>
//                             {errors.image && <p className="text-error text-sm mt-1">{errors.image}</p>}
//                         </div>

//                         <div className="col-span-1 md:col-span-2 flex justify-end gap-2 mt-4">
//                             <Button type="button" variant="secondary" className="bg-beta text-light hover:bg-beta/90 dark:bg-light dark:text-dark" onClick={() => setOpen(false)}>Cancel</Button>
//                             <Button type="submit" disabled={processing} className="bg-alpha text-light hover:bg-alpha/90 disabled:opacity-70">Save changes</Button>
//                         </div>
//                     </form>
//                 </DialogContent>
//             </Dialog>
//         </div>
//     );
// };

// export default User;
