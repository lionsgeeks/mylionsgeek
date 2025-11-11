import React, { useState } from "react";
import PostCard from "../../../../../components/post/PostCard";

export default function PostsTab({ posts, user }) {
  return (
    <>
      <div className="mx-auto p-4 bg-[#fafafa] dark:bg-[#171717] min-h-screen">
        {posts.posts.length === 0 ? <h1>No Posts There</h1> :
          posts.posts.map((p, index) => {
            return (
              <PostCard user={user} p={p} posts={posts.posts} />
            )
          })
        }
      </div>

    </>
  );
}