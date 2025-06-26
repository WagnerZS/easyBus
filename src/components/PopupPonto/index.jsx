import React, { useState, useRef, useEffect } from "react";

import { OverlayView } from "@react-google-maps/api";
import "./popup.css";
import { postFavouritePoints } from "../../services/favouriteServe";
import { useAuth } from "../../contexts/AuthContext";

export function PopupPonto({
  open,
  onClose,
  onSave,
  onDelete,
  lat,
  lng,
  descricaoInicial = "",
  modoEdicao = false,
  favoritoInicial = false,
  pointSelectedId,
  favouritePointList,
}) {
  const [descricao, setDescricao] = useState(descricaoInicial);
  const [editando, setEditando] = useState(!modoEdicao);
  const [favorito, setFavorito] = useState(favoritoInicial);
  const inputRef = useRef(null);

  const { token } = useAuth();

  const handleAddFavourite = async (pointId) => {
    if (!token) {
      alert("Usuário não autenticado");
      return;
    }

    try {
      await postFavouritePoints(token, pointId);
      alert("Ponto favoritado com sucesso!");

      window.location.reload();
    } catch (error) {
      alert(error.message);
    }
  };

  useEffect(() => {
    setDescricao(descricaoInicial);
    setEditando(!modoEdicao);
    setFavorito(favoritoInicial);
  }, [open, lat, lng, descricaoInicial, modoEdicao, favoritoInicial]);

  useEffect(() => {
    if (open && editando) {
      setTimeout(() => {
        inputRef.current && inputRef.current.focus();
      }, 0);
    }
  }, [open, editando]);

  if (!open) return null;

  const bookmarkIcon = (filled) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="28"
      viewBox="0 0 24 24"
      width="28"
      fill={filled ? "#000000" : "none"}
      stroke="#000000"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "block" }}
    >
      <path
        d="M6 4a2 2 0 0 0-2 2v14l8-5.333L20 20V6a2 2 0 0 0-2-2z"
        fill={filled ? "#000000" : "none"}
      />
      <path
        d="M6 4a2 2 0 0 0-2 2v14l8-5.333L20 20V6a2 2 0 0 0-2-2z"
        stroke="#000000"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );

  return (
    <OverlayView
      position={{ lat, lng }}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
    >
      <div
        className="relative flex flex-col items-stretch transform -translate-x-1/2 -translate-y-full"
        style={{ left: "50%", top: 0, position: "absolute" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-lg shadow-lg border border-gray-300 p-4 w-80 max-w-xs">
          <div className="flex justify-between items-center mb-2">
            <div className="flex-1">
              {modoEdicao ? (
                editando ? (
                  <input
                    ref={inputRef}
                    className="w-full border border-gray-300 rounded px-2 py-1 mb-0 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    type="text"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    onBlur={() => setEditando(false)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && descricao.trim()) {
                        onSave(descricao, favorito);
                        setEditando(false);
                      }
                    }}
                  />
                ) : (
                  <h2
                    className="text-base font-bold cursor-pointer"
                    title="Clique para editar"
                    onClick={() => setEditando(true)}
                  >
                    {descricao}
                  </h2>
                )
              ) : (
                <h2 className="text-base font-bold">Novo ponto</h2>
              )}
            </div>
            {modoEdicao &&
              !favouritePointList.find(
                (it) => it.point.id == pointSelectedId
              ) && (
                <button
                  className="ml-2"
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                  }}
                  title={favorito ? "Desfavoritar" : "Favoritar"}
                  onClick={() => {
                    handleAddFavourite(pointSelectedId);
                  }}
                  tabIndex={0}
                >
                  {bookmarkIcon(favorito)}
                </button>
              )}
          </div>
          {!modoEdicao && (
            <input
              ref={inputRef}
              className="w-full border border-gray-300 rounded px-2 py-1 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              type="text"
              placeholder="Descrição"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && descricao.trim()) {
                  onSave(descricao, favorito);
                }
              }}
            />
          )}
          <div className="flex justify-between items-center mt-2">
            {modoEdicao && (
              <button
                className="px-3 py-1 rounded bg-black text-white text-sm"
                style={{ marginRight: "auto" }}
                onClick={() => {
                  if (
                    window.confirm("Tem certeza que deseja deletar este ponto?")
                  ) {
                    onDelete && onDelete();
                  }
                }}
                type="button"
              >
                Deletar
              </button>
            )}
            <div className="flex gap-2">
              <button
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm"
                onClick={onClose}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="px-3 py-1 rounded text-white text-sm btn-salvar"
                style={{ backgroundColor: "#FF0202" }}
                onClick={() => {
                  onSave(descricao, favorito);
                  setEditando(false);
                }}
                disabled={!descricao.trim()}
                type="button"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>

        <div className="absolute left-1/2 top-full -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white drop-shadow"></div>
      </div>
    </OverlayView>
  );
}
