import React, { useState } from 'react';
import { X, Edit, Info, Plus, Copy, Trash2 } from 'lucide-react';

const PostImagePreviewEditor = ({ imagesArray, onOpenEditorChange, onImagesArrayChange }) => {
    const [selectedImage, setSelectedImage] = useState(0)
    //! remove image from array
    const removeImage = () => {
        const newImageArray = imagesArray.filter((arr , index) => index !== selectedImage)
        onImagesArrayChange(newImageArray)
        console.log(imagesArray.length);

    }
    return (
        <>
            <div>
                {/* Modal Overlay */}
                <div className="fixed inset-0 bg-black/80 dark:bg-black/90 flex items-center justify-center p-4 z-40">
                    {/* Modal Container */}
                    <div className="bg-light dark:bg-dark_gray w-full max-w-6xl h-[90vh] rounded-lg overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-beta/10 dark:border-beta/20">
                            <h2 className="text-xl font-semibold text-beta dark:text-light">Editor</h2>
                            <button onClick={() => onOpenEditorChange(false)} className="cursor-pointer text-beta dark:text-light hover:text-alpha transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                            {/* Image Preview Section */}
                            <div className="flex-1 bg-beta dark:bg-dark p-4 lg:p-8 flex items-center justify-center">
                                <div className="relative max-w-2xl w-full aspect-[4/3]">
                                    <img
                                        src={imagesArray[selectedImage]}
                                        alt={imagesArray[selectedImage]}
                                        className="w-full h-full object-cover rounded-lg"
                                    />
                                </div>
                            </div>

                            {/* Sidebar */}
                            <div className="w-full lg:w-80 xl:w-96 bg-light dark:bg-dark_gray border-t lg:border-t-0 lg:border-l border-beta/10 dark:border-beta/20 flex flex-col">
                                {/* Image Counter */}
                                <div className="px-6 py-4 border-b border-beta/10 dark:border-beta/20">
                                    <p className="text-sm text-beta dark:text-light">
                                        {selectedImage + 1} of {imagesArray.length}
                                    </p>
                                </div>

                                {/* Thumbnail Grid */}
                                <div className="flex-1 overflow-y-auto p-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        {imagesArray.map((image, index) => (
                                            <div key={image.id} className="relative">
                                                <button
                                                    onClick={() => setSelectedImage(index)}
                                                    className={`w-full aspect-square rounded-lg overflow-hidden transition-all ${selectedImage === index
                                                        ? 'ring-4 ring-alpha'
                                                        : 'hover:ring-2 hover:ring-alpha/50'
                                                        }`}
                                                >
                                                    <img
                                                        src={image}
                                                        alt={image}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </button>
                                                <span className="absolute bottom-2 left-2 bg-black/70 text-light text-xs px-2 py-1 rounded">
                                                    {String(index + 1).padStart(2, '0')}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Toolbar */}
                                <div className="px-6 py-4 border-t border-beta/10 dark:border-beta/20">


                                    {/* Action Buttons */}
                                    <div className="flex items-center justify-between gap-3">
                                        {/* <button className="cursor-pointer px-6 py-3 rounded-lg bg-beta/5 dark:bg-beta/10 hover:bg-beta/10 dark:hover:bg-beta/20 text-beta dark:text-light font-medium transition-colors">
                                            Back
                                        </button> */}
                                        <div className="flex items-center justify-center gap-4">
                                            {/* <button className="cursor-pointer p-3 rounded-lg bg-beta/5 dark:bg-beta/10 hover:bg-beta/10 dark:hover:bg-beta/20 text-beta dark:text-light transition-colors">
                                            <Copy size={20} />
                                        </button> */}
                                            <button onClick={() => removeImage()} className="cursor-pointer rounded-lg bg-beta/5 dark:bg-beta/10 hover:bg-beta/10 dark:hover:bg-beta/20 text-beta dark:text-light transition-colors">
                                                <Trash2 size={20} />
                                            </button>
                                            <button className="cursor-pointer rounded-lg  transition-colors">
                                                <Plus size={20} />
                                            </button>
                                        </div>
                                        <button className="cursor-pointer py-2 px-4 rounded-lg bg-alpha hover:bg-alpha/90 text-beta font-medium transition-colors">
                                            Next
                                        </button>
                                    </div>
                                </div>

                                {/* Bottom Toolbar Icons */}
                                {/* <div className="px-6 py-3 border-t border-beta/10 dark:border-beta/20 flex items-center justify-center gap-6">
                                    <button className="cursor-pointer text-beta dark:text-light hover:text-alpha transition-colors">
                                        <Edit size={20} />
                                    </button>
                                    <button className="cursor-pointer text-beta dark:text-light hover:text-alpha transition-colors">
                                        <Info size={20} />
                                    </button>
                                    <button className="cursor-pointer px-4 py-2 rounded bg-beta/5 dark:bg-beta/10 text-beta dark:text-light text-sm font-medium hover:bg-beta/10 dark:hover:bg-beta/20 transition-colors">
                                        ALT
                                    </button>
                                </div> */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PostImagePreviewEditor;



