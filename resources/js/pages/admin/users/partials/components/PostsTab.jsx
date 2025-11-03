import React, { useState } from "react";
import { FileText, User, Calendar, ExternalLink, Heart, MessageCircle, X } from "lucide-react";
import TablePagination from "@/components/TablePagination";
import { useInitials } from '@/hooks/use-initials';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime'; // <-- import the plugin
import { Logo } from "../../../../../../../public/assets/icons/logo";


export default function PostsTab({ posts, user }) {
  console.log(posts.posts);
  const [LikedPost, setLikedPost] = useState([])
  const [likesCount, setLikesCount] = useState(0)
  dayjs.extend(relativeTime);

  const getInitials = useInitials();
  const toggleLikedPost = (postId) => {
    setLikedPost(prev =>
      prev.includes(postId)
        ? prev.filter(id => id !== postId) // remove LikedPost
        : [...prev, postId] // add LikedPost
    );
    // setLikesCount(p.)
  };

  return (
    <>
      <div className="max-w-2xl mx-auto p-4 bg-[#fafafa] dark:bg-[#171717] min-h-screen">
        {posts.posts.map((p, index) => {
          const isLiked = LikedPost.includes(p.id);


          return (
            <>
              <div className="bg-white dark:bg-[#1f2326] rounded-lg shadow">
                {/* Post Header */}
                <div className="p-4 flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Avatar
                      className="w-12 h-12 overflow-hidden relative z-50">
                      {user?.image ? (
                        <AvatarImage
                          src={`/storage/img/profile/${user.image}`}
                          alt={user?.name}
                        />
                      ) : (
                        <AvatarFallback className="w-12 h-12 overflow-hidden">
                          {getInitials(user?.name)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                          {user.name}
                        </h3>
                        <span className="text-gray-500 dark:text-light text-xs">• Following</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-light leading-relaxed">
                        {user.status}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-light mt-1">
                        <span>{dayjs(p.created_at).fromNow()}</span>
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zM3.5 8a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="text-dark_gray dark:text-light p-2 rounded hover:bg-gray-100 dark:hover:bg-dark" onClick={() => alert('actions')}>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                      </svg>
                    </button>
                    {/* <X size={25} className="text-dark_gray dark:text-light" /> */}
                  </div>
                </div>

                {/* Post Content - Arabic Text */}
                <div className="px-4 pb-3">
                  <p className="text-sm text-dark_gray text-left dark:text-light" dir="rtl">
                    {p.description}
                  </p>
                  {/* <button className="text-sm text-gray-600 hover:text-blue-600 mt-1">
                Show translation
              </button> */}
                </div>

                {/* Video Container */}
                <div className="relative bg-black aspect-video">
                  <img
                    src={`/storage${p.image}`}
                    alt="Video thumbnail"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Engagement Stats */}
                <div className="px-4 py-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1">
                      <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center border-2 border-white dark:border-gray-800">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
                        </svg>
                      </div>
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 hover:underline cursor-pointer">{p.likes_count}</span>
                  </div>
                  <div className="text-xs text-gray-600 hover:underline cursor-pointer dark:text-gray-400">
                    <span>{p.comments_count} comments</span>
                    {/* <span className="mx-1">•</span>
                <span>427 reposts</span> */}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="px-2 py-2 flex justify-around items-center rounded-lg shadow-sm bg-light dark:bg-dark_gray dark:border-dark">
                  {/* LikedPost Button */}
                  <button onClick={() => toggleLikedPost(p.id)} className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 text-beta dark:text-light hover:bg-dark_gray/10 cursor-pointer dark:hover:bg-light/10 hover:text-beta">
                    {
                      isLiked ?
                        <Logo size={20} color={"#fcc108"} />
                        :

                        <svg
                          className={`w-5 h-5 ${isLiked ? 'text-alpha' : 'text-beta dark:text-light'}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                          />
                        </svg>
                    }
                    <span className={`${isLiked ? 'text-alpha' : 'text-beta dark:text-light'} font-semibold text-sm`}>
                      {isLiked ? "Geeked" : "like"}
                    </span>
                  </button>

                  {/* Comment Button */}
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 text-beta dark:text-light hover:bg-dark_gray/10 cursor-pointer dark:hover:bg-light/10 hover:text-beta">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="text-sm font-semibold">Comment</span>
                  </button>

                  {/* Repost Button */}
                  {/* <button className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 text-beta dark:text-light hover:bg-dark_gray/10 cursor-pointer dark:hover:bg-light/10 hover:text-beta">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="text-sm font-semibold">Repost</span>
                  </button> */}

                  {/* Send Button */}
                  {/* <button className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 text-beta dark:text-light hover:bg-dark_gray/10 cursor-pointer dark:hover:bg-light/10 hover:text-beta">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    <span className="text-sm font-semibold">Send</span>
                  </button> */}
                </div>

              </div>
            </>
          )
        })}
      </div>
    </>
  );
}