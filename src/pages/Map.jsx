import React from "react";
import { Navbar } from "../components";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import {
  getPoints,
  postPoint,
  putPoint,
  deletePoint,
} from "../services/mapService";
import {
  getFavouritePoints,
  postFavouritePoints,
} from "../services/favouriteServe";
import { useAuth } from "../contexts/AuthContext";
import { PopupPonto } from "../components/PopupPonto";
import { Trash2Icon, XIcon } from "lucide-react";

const defaultCenter = {
  lat: -28.2650862084303,
  lng: -52.3974821975343,
};

export const Map = () => {
  const { token } = useAuth();
  const [isFavouriteList, setIsFavouriteList] = React.useState(false);
  const [markers, setMarkers] = React.useState([]);
  const [center, setCenter] = React.useState(defaultCenter);

  const [modalOpen, setModalOpen] = React.useState(false);
  const [clickedLatLng, setClickedLatLng] = React.useState(null);
  const [selectedMarker, setSelectedMarker] = React.useState(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const favouritePointList = getFavouritePoints(token);

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

      setMarkers((markers) =>
        markers.map((m) =>
          m.id === selectedMarker.id ? { ...m, title: novaDescricao } : m
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
      setMarkers((markers) =>
        markers.filter((m) => m.id !== selectedMarker.id)
      );
      setModalOpen(false);
      setClickedLatLng(null);
      setSelectedMarker(null);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteListFavouritesPoint = async (id) => {
    try {
      await deletePoint(token, id);
      setMarkers((markers) => markers.filter((m) => m.id !== id));
    } catch (error) {
      alert(error.message);
    }
  };

  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          setCenter(defaultCenter);
        }
      );
    } else {
      setCenter(defaultCenter);
    }
  }, []);

  React.useEffect(() => {
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

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-0 left-0 w-full h-screen">
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={{
              width: "100%",
              height: "100%",
            }}
            center={center}
            zoom={center == defaultCenter ? 12 : 18}
            onClick={handleMapClick}
          >
            {markers.map((marker) => (
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
      <div className="absolute bottom-0 left-0 w-full z-[10]">
        <Navbar
          setIsFavouriteList={() => setIsFavouriteList(!isFavouriteList)}
        />
      </div>

      {isFavouriteList && (
        <>
          <div className="w-full h-full p-4 bg-black opacity-[0.7] z-[1] top-0 left-0 fixed" />

          <div className="bg-white rounded w-[90%] h-[80%] z-[999] fixed top-[5%] left-[5%] opacity-[1] overflow-y-auto -x-hidden">
            <div className="w-full flex items-center justify-between py-2 px-3">
              <span className="text-2xl font-medium">Favoritos</span>
              <div className="flex items-center">
                <XIcon
                  size={26}
                  onClick={() => setIsFavouriteList(false)}
                  className="text-black hover:text-red-500 ease-in duration-200 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1 px-4 sm:px-12 py-8">
              {markers.length > 0 &&
                markers.map((point) => (
                  <div
                    key={point.id}
                    className="cursor-pointer w-full border rounded border-gray-400 flex justify-between items-center px-4 py-2"
                    onClick={() => {
                      setIsFavouriteList(false);
                      setCenter(point.position);
                    }}
                  >
                    <span className="text-xl">{point.title}</span>

                    <div onClick={(event) => event.stopPropagation()}>
                      <Trash2Icon
                        onClick={() => postFavouritePoints(token, point.id)}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
