import React, { useEffect, useState } from 'react';
import { X, Image, Calendar, Award, Plus, Smile, Clock, PlusCircle, PlusIcon } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { router } from '@inertiajs/react';
import PostImagePreviewEditor from './PostImagePreviewEditor';
import imageCompression from "browser-image-compression";
import { helpers } from '../utils/helpers';

const CreatePostModal = ({ onOpenChange, user, onOpen }) => {
    const [postText, setPostText] = useState('');
    const [postImages, setPostImages] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [openImagesEditor, setOpenImagesEditor] = useState(false)
    const { stopScrolling } = helpers()
    useEffect(() => {
        stopScrolling(true); // freeze scroll on open

        return () => {
            stopScrolling(false); // restore scroll on unmount
        };
    }, []);
    useEffect(() => {
        setOpenImagesEditor(true)
    }, [previews])
    const handleImagePreviews = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1500,
            useWebWorker: true,
        };

        // Compress all files correctly
        const compressedFiles = await Promise.all(
            files.map(file => imageCompression(file, options))
        );

        // Previews using compressed files (recommended)
        const previewsArray = compressedFiles.map(file =>
            URL.createObjectURL(file)
        );

        setPreviews(prev => [...prev, ...previewsArray]);
        setPostImages(prev => [...prev, ...compressedFiles]);
    };
    //! create post
    const handelCreatePost = () => {
        const newFormData = new FormData()
        newFormData.append('description', postText)
        postImages.forEach(file =>
            newFormData.append('images[]', file)
        )

        router.post('/posts/store/post', newFormData, {
            forceFormData: true,
            onSuccess: () => {
                onOpenChange(false)
            },
            onError: (error) => {
                console.log(error);
            }
        })
    }
    return (
        <>
            <div onClick={() => onOpenChange(false)} className="fixed inset-0 h-full z-30 bg-black/70">
            </div>
            <div className="w-full fixed inset-0 z-40 mx-auto top-1/2 transform -translate-y-1/2 max-w-[70%] h-[90vh] flex flex-col rounded-2xl shadow-2xl bg-light dark:bg-dark_gray overflow-auto transition-all duration-300">

                {/* Header */}
                <div className="p-5 border-b border-gray-200 dark:border-dark_gray flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar
                            className="w-12 h-12 overflow-hidden"
                            image={user?.image}
                            name={user?.name}
                            lastActivity={user?.last_online || null}
                            onlineCircleClass="hidden"
                        />
                        <div>
                            <h3 className="font-semibold text-base text-dark dark:text-light">{user?.name}</h3>
                            <span className="text-sm text-gray-500 dark:text-gray-400">Create post</span>
                        </div>
                    </div>

                    <button
                        onClick={() => onOpenChange(false)}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark_gray text-dark dark:text-light transition"
                        aria-label="Close modal"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col gap-4 px-5 py-4 overflow-y-auto">
                    <textarea
                        value={postText}
                        onChange={(e) => setPostText(e.target.value)}
                        placeholder="What do you want to talk about?"
                        className="w-full min-h-fit resize-none text-lg outline-none bg-transparent 
               text-dark dark:text-light placeholder-gray-400 dark:placeholder-gray-500 
               p-3 whitespace-pre-wrap"
                    />
                    {previews.length > 1 &&
                        <div className='w-full  p-2 flex justify-end'>
                            <X onClick={() => {
                                setPreviews([])
                                setPostImages([])
                            }} className='text-dark cursor-pointer dark:text-white' size={25} />
                        </div>
                    }
                    {previews.length !== 0 && (
                        <>
                            {openImagesEditor && (
                                <PostImagePreviewEditor
                                    imagesArray={previews}
                                    onOpenEditorChange={setOpenImagesEditor}
                                    onImagesArrayChange={setPreviews}
                                    onPostImagesChange={setPostImages}
                                />
                            )}

                            {
                                previews.length < 5 ? (
                                    // -------------------- 2 IMAGES --------------------
                                    <div className="flex flex-col w-full gap-3 overflow-auto">                                        <img
                                        src={previews[0]}
                                        alt=""
                                        className={`w-full h-[50vh] rounded-lg object-cover`}
                                    />
                                        {previews.length > 1 && (
                                            <div className="w-full h-[30vh] flex gap-3">
                                                {previews.slice(1).map((preview, index) => (
                                                    <img
                                                        key={index}
                                                        src={preview}
                                                        alt=""
                                                        className={`h-full object-cover rounded-lg w-1/${previews.length - 1}`}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                ) : (
                                    // -------------------- MORE THAN 5 IMAGES --------------------
                                    <div className="flex flex-col gap-3 rounded-t-lg overflow-auto">
                                        <img
                                            src={previews[0]}
                                            alt=""
                                            className="w-full h-[50vh] object-cover"
                                        />

                                        <div className="grid grid-cols-4 gap-3 items-center relative">
                                            {previews.slice(1, 5).map((preview, index) => (
                                                <div key={index} className="relative">
                                                    <img
                                                        src={preview}
                                                        alt=""
                                                        className={`object-cover w-full h-[30vh] ${index === 3 && previews.length > 5 ? 'opacity-20' : ''}`}
                                                    />

                                                    {index === 3 && previews.length > 5 && (
                                                        <div className="flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-1">
                                                            <PlusIcon size={20} className="text-white" />
                                                            <p className="text-white font-semibold text-3xl">
                                                                {previews.length - 5}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            }

                        </>
                    )}


                </div>

                {/* Footer */}
                <div className="p-5 border-t border-gray-200 dark:border-dark_gray bg-white/50 dark:bg-dark_gray/80 backdrop-blur-sm">
                    <div className="flex w-full items-center justify-between mb-3">
                        <label
                            htmlFor="imageUpload"
                            className="p-2 rounded-full hover:bg-gray-100 cursor-pointer dark:hover:bg-dark_gray text-gray-600 dark:text-gray-400 transition flex items-center justify-center"
                        >
                            <Image size={20} />
                            <input
                                id="imageUpload"
                                type="file"
                                accept="image/video"
                                multiple
                                onChange={handleImagePreviews}
                                className="hidden"
                            />
                        </label>
                        <button
                            disabled={!postText.trim()}
                            onClick={() => handelCreatePost()}
                            className={`px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 shadow-sm
                   ${postText.trim()
                                    ? 'bg-alpha text-dark hover:opacity-90'
                                    : 'bg-gray-200 dark:bg-dark_gray text-gray-400 cursor-not-allowed'}
                 `}
                        >
                            Post
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
export default CreatePostModal;