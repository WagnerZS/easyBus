import axios from 'axios';

const BASE_URL = import.meta.env.VITE_URL_API + '/ws/point/favorite';

export async function getFavouritePoints(token) {
    try {
        const response = await axios.get(BASE_URL, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        console.log(response.data)
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Erro ao buscar pontos favoritos');
    }
}

// TODO: ajustar post
export async function postFavouritePoints(token, id_point) {
    try {
        const response = await axios.post(`${BASE_URL}/${id_point}`);

        console.log(response.data)
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Erro ao buscar pontos favoritos');
    }
}