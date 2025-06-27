import React, { useState } from "react";
import { Logo, Title, Input, Button } from "../components";
import { signIn } from "../services/authService";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";

const mapContainerStyle = {
  width: "100vw",
  height: "100vh",
  position: "absolute",
  top: 0,
  left: 0,
  zIndex: 0,
};

const center = {
  lat: -23.5505,
  lng: -46.6333,
};

export function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [isLoader, setIsLoader] = useState(false);
  const [isShowSenha, setIsShowSenha] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setIsLoader(true);
    try {
      const token = await signIn(email, senha);
      login(token);
      navigate("/map");
    } catch (err) {
      setIsLoader(false);
      setErro(err.message);
    }
  };

  if (!isLoaded) return <div>Carregando mapa...</div>;

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={12}
        options={{
          disableDefaultUI: true,
          draggable: false,
          keyboardShortcuts: false,
          zoomControl: false,
        }}
      />

      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="bg-white bg-opacity-90 rounded-xl shadow-lg p-8 w-full max-w-md">
          <div className="text-center">
            <Logo />
          </div>

          <div className="pt-6 pb-4">
            <Title title="Bem-vindo de volta" />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="pb-4">
              <Input
                label="Email"
                placeholder="Digite seu email..."
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="pb-4 relative">
              <Input
                label="Senha"
                placeholder="Digite sua senha..."
                type={isShowSenha ? "text" : "password"}
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="border-2 border-black rounded-[10px] p-2.5 block w-full"
              />
              <button
                type="button"
                onClick={() => setIsShowSenha((prev) => !prev)}
                className="absolute top-[44%] right-3 text-gray-500 hover:text-gray-700 cursor-pointer"
                tabIndex={-1}
              >
                {isShowSenha ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {erro && <p style={{ color: "red" }}>{erro}</p>}

            <div className="text-center pt-4">
              <Button type="submit" disabled={isLoader}>
                {isLoader ? (
                  <span className="flex items-center justify-center gap-2">
                    <div role="status">
                      <svg
                        aria-hidden="true"
                        class="inline w-6 h-6 text-gray-200 animate-spin dark:text-gray-600 fill-gray-600 dark:fill-gray-300"
                        viewBox="0 0 100 101"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                          fill="currentColor"
                        />
                        <path
                          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                          fill="currentFill"
                        />
                      </svg>
                      <span class="sr-only">Loading...</span>
                    </div>
                    <span>Acessando</span>
                  </span>
                ) : (
                  "Acessar"
                )}
              </Button>
            </div>
          </form>

          <div className="text-center pt-8">
            <Link
              to="/register"
              className="text-blue-600 hover:underline cursor-pointer"
            >
              Não possui uma conta? {"  "}
              <span className="font-semibold">Cadastre-se</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
