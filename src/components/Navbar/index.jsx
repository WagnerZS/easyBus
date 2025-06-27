import "./navbar.css";
import { useAuth } from "../../contexts/AuthContext";
import { BookmarkIcon, LogOutIcon, MapPinIcon } from "lucide-react";

export function Navbar({
  setIsFavouriteList = () => any,
  redirectedMap = () => any,
}) {
  const { logout } = useAuth();

  return (
    <div className="bg-[#FF0202] h-20 w-full flex items-center justify-around px-8 text-white">
      <button
        className="cursor-pointer flex flex-col gap-0.5 items-center"
        onClick={redirectedMap}
      >
        <MapPinIcon size={26} />
        <span>Mapa</span>
      </button>

      <button
        className="cursor-pointer flex flex-col gap-0.5 items-center"
        onClick={setIsFavouriteList}
      >
        <BookmarkIcon size={26} />
        <span>Favoritos</span>
      </button>

      <button
        className="cursor-pointer flex flex-col gap-0.5 items-center"
        onClick={logout}
      >
        <LogOutIcon size={26} />
        <span>Sair</span>
      </button>
    </div>
  );
}
