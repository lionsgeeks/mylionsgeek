// resources/js/Pages/Profile/Complete.jsx

import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import React from 'react';
import Logo from '/public/assets/images/lionsgeek_logo_2.png'
// import { input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Camera, Eye, EyeOff } from 'lucide-react';

const CompleteProfile = ({ user }) => {
    const { data, setData, post, processing, errors, setError } = useForm({
        password: '',
        password_confirmation: '',
        phone: '',
        cin: '',
        entreprise: '',
        status: '',
        image: null,
    });

    const [imagePreview, setImagePreview] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData("image", file);
            setValidationErrors({ ...validationErrors, image: '' });
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!data.phone || data.phone.trim() === '') {
            newErrors.phone = 'Phone number is required';
        }

        if (!data.cin || data.cin.trim() === '') {
            newErrors.cin = 'CIN is required';
        }

        if (!data.entreprise || data.entreprise.trim() === '') {
            newErrors.entreprise = 'Entreprise is required';
        }

        if (!data.password || data.password.trim() === '') {
            newErrors.password = 'Password is required';
        } else {
            const passwordRegex = /^(?=.*[A-Z]).{8,}$/;
            if (!passwordRegex.test(data.password)) {
                newErrors.password = 'Password must be at least 8 characters long and include at least one uppercase letter';
            }
        }

        if (!data.password_confirmation || data.password_confirmation.trim() === '') {
            newErrors.password_confirmation = 'Password confirmation is required';
        } else if (data.password !== data.password_confirmation) {
            newErrors.password_confirmation = 'Passwords do not match';
        }

        if (!data.image) {
            newErrors.image = 'Profile image is required';
        }

        setValidationErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (userToken) => {
        // Clear previous manual errors
        setError("password", null);
        setError("password_confirmation", null);

        // Validate form
        if (!validateForm()) {
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
                //('Request finished');
            }
        });
    };

    return (
        <div className="min-h-screen w-full bg-white flex items-center justify-center p-4">
            <div className="w-full max-w-3xl">
                {/* Main Card */}
                <div className="bg-white rounded-3xl shadow-2xl p-8">
                    <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
                        Complete Your Profile
                    </h2>

                    <form onSubmit={(e) => e.preventDefault()}>
                        {/* Profile Image Upload */}
                        <div className="flex flex-col items-center mb-6">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full bg-gray-100 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <Camera className="w-10 h-10 text-gray-400" />
                                    )}
                                </div>
                            </div>
                            <label htmlFor="image-upload" className="mt-3 cursor-pointer">
                                <div className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2 px-5 rounded-lg transition-all duration-200 text-sm">
                                    Upload Image
                                </div>
                                <input
                                    id="image-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                            {(validationErrors.image || errors.image) && (
                                <span className="text-red-500 text-sm mt-2">{validationErrors.image || errors.image}</span>
                            )}
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-4">
                            {/* Row 1: Phone & CIN */}
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <Label htmlFor="phone" className="block text-gray-600 text-sm font-medium mb-2">
                                        Phone Number
                                    </Label>
                                    <input
                                        id="phone"
                                        type="text"
                                        value={data.phone}
                                        onChange={(e) => setData("phone", e.target.value)}
                                        placeholder="+212 600 000 000"
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-black focus:border-green-500 focus:outline-none"
                                    />
                                    {(validationErrors.phone || errors.phone) && (
                                        <span className="text-red-500 text-sm mt-1 block">{validationErrors.phone || errors.phone}</span>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <Label htmlFor="cin" className="block text-gray-600 text-sm font-medium mb-2">
                                        CIN
                                    </Label>
                                    <input
                                        id="cin"
                                        type="text"
                                        value={data.cin}
                                        onChange={(e) => setData("cin", e.target.value)}
                                        placeholder="Enter your CIN"
                                        className="w-full px-4 text-black py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                                    />
                                    {(validationErrors.cin || errors.cin) && (
                                        <span className="text-red-500 text-sm mt-1 block">{validationErrors.cin || errors.cin}</span>
                                    )}
                                </div>
                            </div>

                            {/* Row 2: Entreprise */}
                            <div>
                                <Label htmlFor="entreprise" className="block text-gray-600 text-sm font-medium mb-2">
                                    Entreprise
                                </Label>
                                <input
                                    id="entreprise"
                                    type="text"
                                    value={data.entreprise}
                                    onChange={(e) => setData("entreprise", e.target.value)}
                                    placeholder="Enter your company name"
                                    className="w-full text-black px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                                />
                                {(validationErrors.entreprise || errors.entreprise) && (
                                    <span className="text-red-500 text-sm mt-1 block">{validationErrors.entreprise || errors.entreprise}</span>
                                )}
                            </div>

                            {/* Row 3: Password & Confirm Password */}
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <Label htmlFor="password" className="block text-gray-600 text-sm font-medium mb-2">
                                        Password
                                    </Label>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            value={data.password}
                                            onChange={(e) => setData("password", e.target.value)}
                                            placeholder="Enter your password"
                                            className="w-full text-black px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    {(validationErrors.password || errors.password) && (
                                        <span className="text-red-500 text-sm mt-1 block">{validationErrors.password || errors.password}</span>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <Label htmlFor="password_confirmation" className="block text-gray-600 text-sm font-medium mb-2">
                                        Confirm Password
                                    </Label>
                                    <div className="relative">
                                        <input
                                            id="password_confirmation"
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={data.password_confirmation}
                                            onChange={(e) => setData("password_confirmation", e.target.value)}
                                            placeholder="Confirm your password"
                                            className="w-full text-black px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        >
                                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    {(validationErrors.password_confirmation || errors.password_confirmation) && (
                                        <span className="text-red-500 text-sm mt-1 block">{validationErrors.password_confirmation || errors.password_confirmation}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="mt-6">
                            <Button
                                type="button"
                                onClick={() => handleSubmit(user.activation_token)}
                                disabled={processing}
                                className="w-full bg-alpha text-beta font-semibold hover:bg-alpha hover:text-beta py-2.5 px-6 rounded-lg"
                            >
                                {processing ? 'Submitting...' : 'Next'}
                            </Button>
                        </div>
                    </form>

                </div>
            </div>
        </div>

    );
}
export default CompleteProfile;