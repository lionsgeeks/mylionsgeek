import { router } from "@inertiajs/react";
export const helpers = () => {
    const addOrRemoveFollow = (userId, isFollowing) => {
        if (isFollowing) {
            try {
                router.delete(`/users/unfollow/${userId}`, {}, {
                    onSuccess: () => {
                        console.log('you are now unfollow');
                    }
                })
            } catch (error) {
                console.log('unfollow error : ' + error);
            }
        } else {
            try {
                router.post(`/users/follow/${userId}`, {}, {
                    onSuccess: () => {
                        // console.log('you are now follow');
                    }
                })
            } catch (error) {
                // console.log('Follow error : ' + error);
            }
        }
    }
    return { addOrRemoveFollow }
}
