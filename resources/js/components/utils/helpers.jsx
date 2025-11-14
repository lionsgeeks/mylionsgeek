import { router, usePage } from "@inertiajs/react";
export const helpers = () => {
    const { auth } = usePage().props
    const addFollow = (userId) => {
        try {
            router.post(`/users/follow/${userId}`, {}, {
                onSuccess: () => {
                    console.log('you are now follow');
                }
            })
        } catch (error) {
            console.log('Follow error : ' + error);
        }
    }
    return { addFollow }
}
