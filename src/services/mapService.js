import axios from 'axios';

const BASE_URL = import.meta.env.VITE_URL_API + '/ws/point';

export async function getPoints(token) {
  try {
    const response = await axios.get(BASE_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // o objeto response.data possui os campos latitude e longitude mas precisamos mudar os nomes para lat lng
    const points = response.data.map(point => ({
      id: point.id,
      title: point.description,
      position: {
        lat: point.latitude,
        lng: point.longitude,
      },
    }));

    if (response.status === 200) {
      return points;
    } else {
      throw new Error('Erro ao buscar pontos');
    }
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erro ao buscar pontos');
  }
}

export async function postPoint(token, pointData) {
  try {
    const response = await axios.post(BASE_URL, pointData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 201) {
      return response.data;
    } else {
      throw new Error('Erro ao cadastrar ponto');
    }
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erro ao cadastrar ponto');
  }
}

export async function putPoint(token, id, pointData) {
  try {
    const response = await axios.put(`${BASE_URL}/${id}`, pointData,{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error('Erro ao atualizar ponto');
    }
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erro ao atualizar ponto');
  }
}

export async function deletePoint(token, id) {
  try {
    const response = await axios.delete(`${BASE_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 200) {
      return true;
    } else {
      throw new Error('Erro ao deletar ponto');
    }
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erro ao deletar ponto');
  }
}