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
  deleteFavouritePoints,
  getFavouritePoints,
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
  const [favouritePointList, setFavouritePointList] = React.useState([]);
  const [markers, setMarkers] = React.useState([]);
  const [center, setCenter] = React.useState(defaultCenter);

  const [modalOpen, setModalOpen] = React.useState(false);
  const [clickedLatLng, setClickedLatLng] = React.useState(null);
  const [selectedMarker, setSelectedMarker] = React.useState(null);
  const [pointSelectedId, setPointSelectedId] = React.useState(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const handleMapClick = (event) => {
    setClickedLatLng({
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    });
    setSelectedMarker(null);      // Limpa seleção de ponto
    setPointSelectedId(null);     // Limpa seleção de id
    setModalOpen(true);
  };

  const handleGetFavourites = async () => {
    try {
      const favouriteList = await getFavouritePoints(token);
      setFavouritePointList(favouriteList);
    } catch (error) {
      console.error("Erro ao buscar favoritos:", error);
      setFavouritePointList([]);
    }
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

  const handleRemoveFavourite = async (pointId) => {
    if (!token) {
      alert("Usuário não autenticado");
      return;
    }

    try {
      await deleteFavouritePoints(token, pointId);

      const updatedFavourites = await getFavouritePoints(token);
      setFavouritePointList(updatedFavourites);
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
        () => {
          setCenter(defaultCenter);
        }
      );
    } else {
      setCenter(defaultCenter);
    }

    handleGetFavourites();
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

  React.useEffect(() => {
    handleGetFavourites();
  }, [isFavouriteList]);

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
            zoom={center == defaultCenter ? 12 : 16}
            onClick={handleMapClick}
          >
            {markers.map((marker) => (
              <Marker
                key={marker.id}
                position={marker.position}
                title={marker.title}
                onClick={() => {
                  setSelectedMarker(marker);
                  setPointSelectedId(marker.id);
                  setClickedLatLng(marker.position);
                  setModalOpen(true);
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
                  setPointSelectedId(null);
                  handleGetFavourites();
                }}
                pointSelectedId={pointSelectedId}
                favouritePointList={favouritePointList}
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
          redirectedMap={() => {
            setIsFavouriteList(false);
            handleGetFavourites();
          }}
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

            <div className="flex flex-col gap-4 px-4 sm:px-12 py-8">
              {Array.isArray(favouritePointList) &&
                favouritePointList.map((favouritePoint) => (
                  <div
                    key={favouritePoint.id}
                    className="group cursor-pointer w-full bg-white border border-gray-200 rounded-xl shadow-md flex justify-between items-center px-6 py-4 transition-all hover:shadow-lg hover:bg-gray-50"
                    onClick={() => {
                      setIsFavouriteList(false);
                      setCenter({
                        lat: favouritePoint.point.latitude,
                        lng: favouritePoint.point.longitude,
                      });
                    }}
                  >
                    <span className="text-lg font-medium text-gray-900 truncate">
                      {favouritePoint.point.description}
                    </span>
                    <button
                      className="ml-4 rounded-full p-2 hover:bg-red-100 transition-colors"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleRemoveFavourite(favouritePoint.point.id);
                        handleGetFavourites();
                      }}
                      title="Remover dos favoritos"
                    >
                      <Trash2Icon className="text-red-500 group-hover:text-red-700" />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
