// resources/js/Pages/Profile/Complete.jsx

import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import React from 'react';
import Logo from '/public/assets/images/lionsgeek_logo_2.png'
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const CompleteProfile = ({ user }) => {
    const { data, setData, post, processing, errors, setError } = useForm({
        password: '',
        // password_confirmation: '',
        phone: '',
        cin: '',
        entreprise: '',
        status: '',
        image: null,
    });

    const handleSubmit = (userToken) => {
        // Clear previous manual errors (optional, but useful)
        setError("password", null);
        setError("password_confirmation", null);

        // Frontend password validation
        const passwordRegex = /^(?=.*[A-Z]).{8,}$/;

        if (!passwordRegex.test(data.password)) {
            setError("password", "Password must be at least 8 characters long and include at least one uppercase letter.");
            return;
        }

        if (data.password !== data.password_confirmation) {
            setError("password_confirmation", "Passwords do not match.");
            return;
        }

        // Continue with form submission if valid
        router.post(`/complete-profile/update/${userToken}`, data, {
            onSuccess: () => {
                window.location.href = '/login';
            },
            onError: (errors) => {
                console.error('Validation Errors:', errors);
            },
            onFinish: () => {
                console.log('Request finished');
            }
        });
    };






    return (
        <div className="min-h-screen w-full bg-white flex flex-col items-center justify-center py-10">
            {/* Logo/Header */}
            <div className="mb-8">
                <img src={Logo} alt="LionsGeek Logo" className="h-25" />
            </div>

            <div className="w-full bg-white ">

                <form className="space-y-6 mx-auto w-1/2 shadow-lg rounded-lg p-8" onSubmit={(e) => e.preventDefault()}>
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">Complete Your Profile</h2>
                    {/* Row 1: CIN + Entreprise */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Label htmlFor="cin" className="mb-1 font-medium text-gray-700 block">
                                CIN
                            </Label>
                            <Input
                                id="cin"
                                type="text"
                                value={data.cin}
                                onChange={(e) => setData("cin", e.target.value)}
                                className="w-full text-beta focus:outline-0"
                            />
                            {errors.cin && <p className="text-error text-sm mt-1">{errors.cin}</p>}
                        </div>

                        <div>
                            <Label htmlFor="entreprise" className="mb-1 font-medium text-gray-700 block">
                                Entreprise
                            </Label>
                            <Input
                                id="entreprise"
                                type="text"
                                value={data.entreprise}
                                onChange={(e) => setData("entreprise", e.target.value)}
                                className="w-full text-beta focus:outline-0"
                            />
                            {errors.entreprise && <p className="text-error text-sm mt-1">{errors.entreprise}</p>}
                        </div>
                    </div>

                    {/* Row 2: Image + Phone */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Label htmlFor="image" className="mb-1 font-medium text-gray-700 block">
                                Profile Image
                            </Label>
                            <input
                                id="image"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setData("image", e.target.files[0])}
                                className="w-full border border-gray-300 rounded-md px-4 py-2 text-beta"
                            />
                            {errors.image && <p className="text-error text-sm mt-1">{errors.image}</p>}
                        </div>

                        <div>
                            <Label htmlFor="phone" className="mb-1 font-medium text-gray-700 block">
                                Phone
                            </Label>
                            <Input
                                id="phone"
                                type="text"
                                value={data.phone}
                                onChange={(e) => setData("phone", e.target.value)}
                                className="w-full text-beta focus:outline-0"
                            />
                            {errors.phone && <p className="text-error text-sm mt-1">{errors.phone}</p>}
                        </div>
                    </div>

                    {/* Row 3: Password + Confirm Password */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Label htmlFor="password" className="mb-1 font-medium text-gray-700 block">
                                Password
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(e) => {
                                    setData("password", e.target.value);
                                    setError("password", null); // ✅ Clear error as user types
                                }}
                                className="w-full text-beta focus:outline-0"
                            />
                            {errors.password && <p className="text-error text-sm mt-1">{errors.password}</p>}
                        </div>

                        <div>
                            <Label htmlFor="password_confirmation" className="mb-1 font-medium text-gray-700 block">
                                Confirm Password
                            </Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) => {
                                    setData("password_confirmation", e.target.value);
                                    setError("password_confirmation", null); // ✅ Clear error
                                }}
                                className="w-full text-beta focus:outline-0"
                            />
                            {errors.password_confirmation && (
                                <p className="text-error text-sm mt-1">{errors.password_confirmation}</p>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="mt-8 text-end">
                        <Button
                            type='button'
                            disabled={processing}
                            className="bg-alpha hover:bg-alpha text-beta font-bold py-2 px-6 rounded-md transition-all duration-200 disabled:opacity-50"
                            onClick={() => handleSubmit(user.activation_token)}
                        >
                            {processing ? "Submitting..." : "Submit"}
                        </Button>
                    </div>
                </form>

            </div>
        </div>
    );
}
export default CompleteProfile;