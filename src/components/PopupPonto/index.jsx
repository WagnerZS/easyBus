import React, { useState, useRef, useEffect } from "react";

import { OverlayView } from "@react-google-maps/api";
import "./popup.css";
import {
  deleteFavouritePoints,
  postFavouritePoints,
} from "../../services/favouriteServe";
import { useAuth } from "../../contexts/AuthContext";
import { Bookmark } from "lucide-react";

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

  const verifyFavourite = () => {
    if (favouritePointList.find((it) => it.point.id == pointSelectedId))
      return true;

    return false;
  };

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

  const handleRemoveFavourite = async (pointId) => {
    if (!token) return alert("Usuário não autenticado");

    try {
      await deleteFavouritePoints(token, pointId);
      alert("Ponto favorito removido com sucesso!");

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

  if (!open) return <></>;

  return (
    <OverlayView
      position={{ lat, lng }}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
    >
      <div
        className="flex flex-col items-stretch transform -translate-x-1/2 -translate-y-full left-[50%] top-0 absolute"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-lg shadow-lg border border-gray-300 p-4 w-80 max-w-xs">
          {modoEdicao ? (
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <div className="flex-1">
                  {editando ? (
                    <input
                      ref={inputRef}
                      className="w-full border border-gray-300 rounded text-base font-bold px-2"
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
                      className="text-base font-bold cursor-pointer w-full px-2"
                      title="Clique para editar"
                      onClick={() => setEditando(true)}
                    >
                      {descricao}
                    </h2>
                  )}
                </div>

                <button
                  className="ml-2 cursor-pointer p-0"
                  onClick={() => {
                    if (verifyFavourite())
                      return handleRemoveFavourite(pointSelectedId);

                    return handleAddFavourite(pointSelectedId);
                  }}
                >
                  {verifyFavourite() ? (
                    <Bookmark fill="#000000" />
                  ) : (
                    <Bookmark />
                  )}
                </button>
              </div>

              <div className="flex justify-between items-center mt-2">
                <button
                  className="px-3 py-1 rounded bg-black text-white text-sm mr-auto"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Tem certeza que deseja deletar este ponto?"
                      )
                    )
                      onDelete && onDelete();
                  }}
                >
                  Deletar
                </button>

                <div className="flex gap-2">
                  <button
                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm"
                    onClick={onClose}
                  >
                    Cancelar
                  </button>

                  <button
                    className="px-3 py-1 rounded text-white text-sm btn-salvar bg-[#FF0202]"
                    onClick={() => {
                      onSave(descricao, favorito);
                      setEditando(false);
                    }}
                    disabled={!descricao.trim()}
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <span className="flex-1 text-base font-bold">Novo ponto</span>

              <input
                ref={inputRef}
                className="w-full border border-gray-300 rounded px-2 py-1 mb-3 text-base"
                type="text"
                placeholder="Descrição"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && descricao.trim()) {
                    e.preventDefault();
                    onSave(descricao, favorito);
                  }
                }}
              />

              <div className="flex justify-end gap-2 items-center">
                <button
                  className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm"
                  onClick={onClose}
                >
                  Cancelar
                </button>

                <button
                  className="px-3 py-1 rounded text-white text-sm btn-salvar bg-[#FF0202]"
                  onClick={() => {
                    onSave(descricao, favorito);
                    setEditando(false);
                  }}
                  disabled={!descricao.trim()}
                >
                  Salvar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </OverlayView>
  );
}
