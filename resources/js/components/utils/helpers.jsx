import { router, usePage } from "@inertiajs/react";
export const helpers = () => {
    const { auth } = usePage().props
    const addOrRemoveFollow = (user) => {
        if (user.is_Following) {
            try {
                router.delete(`/users/unfollow/${user?.id}`, {}, {
                    onSuccess: () => {
                        console.log('you are now unfollow');
                    }
                })
            } catch (error) {
                console.log('unfollow error : ' + error);
            }
        } else {
            try {
                router.post(`/users/follow/${user?.id}`, {}, {
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
