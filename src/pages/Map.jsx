import { useEffect, useContext, useState } from "react";
import { Navbar } from "../components";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { getPoints, postPoint, putPoint, deletePoint } from '../services/mapService';
import { useAuth } from "../contexts/AuthContext";
import { PopupPonto } from "../components/PopupPonto";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = {
  lat: -23.55052,
  lng: -46.633308,
};

export const Map = () => {
  const { token } = useAuth();
  const [markers, setMarkers] = useState([]);
  const [center, setCenter] = useState(defaultCenter);

  const [modalOpen, setModalOpen] = useState(false);
  const [clickedLatLng, setClickedLatLng] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);

  // Substitua pela sua chave da API do Google Maps
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  // Tenta obter a localização do usuário ao montar o componente
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          // Se der erro, mantém o valor padrão
          setCenter(defaultCenter);
        }
      );
    } else {
      setCenter(defaultCenter);
    }
  }, []);

  useEffect(() => {
    async function fetchMarkers() {
      try {
        const data = await getPoints(token);
        setMarkers(data);
      } catch (error) {
        console.log(error.message);
      }
    }
    fetchMarkers();
  }, [token]);

  const handleMapClick = (event) => {
    setClickedLatLng({
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    });
    setModalOpen(true);
  };

  const handleSavePonto = async (descricao) => {
    if (!clickedLatLng) return;
    const newPoint = {
      latitude: clickedLatLng.lat,
      longitude: clickedLatLng.lng,
      description: descricao,
    };
    try {
      const savedPoint = await postPoint(token, newPoint);
      const savedMarker = {
        id: savedPoint.id,
        title: savedPoint.description || "Novo Ponto",
        position: {
          lat: savedPoint.latitude,
          lng: savedPoint.longitude,
        },
      };
      setMarkers((prev) => [...prev, savedMarker]);
      setModalOpen(false);
      setClickedLatLng(null);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleEditPonto = async (novaDescricao) => {
    if (!selectedMarker) return;
    try {
      const updatedPoint = {
        latitude: selectedMarker.position.lat,
        longitude: selectedMarker.position.lng,
        description: novaDescricao,
      };
      await putPoint(token, selectedMarker.id, updatedPoint);

      setMarkers(markers =>
        markers.map(m =>
          m.id === selectedMarker.id
            ? { ...m, title: novaDescricao }
            : m
        )
      );
      setModalOpen(false);
      setClickedLatLng(null);
      setSelectedMarker(null);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeletePonto = async () => {
    if (!selectedMarker) return;
    try {
      await deletePoint(token, selectedMarker.id);
      setMarkers(markers => markers.filter(m => m.id !== selectedMarker.id));
      setModalOpen(false);
      setClickedLatLng(null);
      setSelectedMarker(null);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ width: "100%", height: "100%" }}>
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={12}
            onClick={handleMapClick}
          >
            {markers.map(marker => (
              <Marker
                key={marker.id}
                position={marker.position}
                title={marker.title}
                onClick={() => {
                  setSelectedMarker(marker);
                  setModalOpen(true);
                  setClickedLatLng(marker.position);
                }}
              />
            ))}
            {modalOpen && clickedLatLng && (
              <PopupPonto
                open={modalOpen}
                onClose={() => {
                  setModalOpen(false);
                  setClickedLatLng(null);
                  setSelectedMarker(null);
                }}
                onSave={selectedMarker ? handleEditPonto : handleSavePonto}
                onDelete={selectedMarker ? handleDeletePonto : undefined}
                lat={clickedLatLng.lat}
                lng={clickedLatLng.lng}
                descricaoInicial={selectedMarker?.title || ""}
                modoEdicao={!!selectedMarker}
              />
            )}
          </GoogleMap>
        ) : (
          <div>Carregando mapa...</div>
        )}
      </div>
    </>
  );
};
