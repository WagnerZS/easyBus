import React, { useState } from "react";
import { Navbar, Logo, Title, Input, Button } from "../components";
import { Link, useNavigate } from "react-router-dom";
import { signUp } from "../services/authService";
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

export function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    try {
      await signUp(name, email, senha);
      navigate("/login");
    } catch (err) {
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
            <Title title="Faça seu cadastro" />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="pb-4">
              <Input
                label="Nome"
                placeholder="Digite seu nome..."
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
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
            <div className="pb-4">
              <Input
                label="Senha"
                placeholder="Digite sua senha..."
                type="password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>

            {erro && <p className="text-red-600">{erro}</p>}

            <div className="text-center pt-4">
              <Button type="submit">Cadastrar</Button>
            </div>
          </form>

          <div className="text-center pt-8">
            <Link to="/login" className="text-blue-600 hover:underline">
              Já tem cadastro? <strong>Faça Login</strong>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
