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
    let scrollY = 0;

    const stopScrolling = (isOpen) => {
        if (isOpen) {
            scrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.left = '0';
            document.body.style.right = '0';
            document.body.style.width = '100%'; // prevent width jump
        } else {
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.left = '';
            document.body.style.right = '';
            document.body.style.width = '';
            window.scrollTo(0, scrollY);
        }
    };
    return { addOrRemoveFollow, stopScrolling }
}
