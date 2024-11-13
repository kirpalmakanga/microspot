import axios from 'axios';

interface State {
    id: string;
    name: string;
    profilePicture: string;
}

const getDefaultState = (): State => ({
    id: '',
    name: '',
    profilePicture: ''
});

export const useUserStore = defineStore('user', () => {
    const state = reactive<State>(getDefaultState());

    return {
        ...toRefs(state),
        async getUserData(userId: string) {
            const {
                data: {
                    id,
                    display_name: name,
                    images: [{ url: profilePicture = '' } = {}]
                }
            } = await axios(`/users/${userId}`);

            Object.assign(state, {
                id,
                name,
                profilePicture
            });
        },
        clearUserData() {
            Object.assign(state, getDefaultState());
        }
    };
});
