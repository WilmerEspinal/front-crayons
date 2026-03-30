"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

// Función para validar fortaleza de contraseña
interface PasswordStrength {
  isValid: boolean;
  score: number; // 0-4
  errors: string[];
}

const validatePasswordStrength = (password: string): PasswordStrength => {
  const errors: string[] = [];
  let score = 0;

  // Mínimo 8 caracteres
  if (password.length >= 8) score++;
  else errors.push("Mínimo 8 caracteres");

  // Al menos una mayúscula
  if (/[A-Z]/.test(password)) score++;
  else errors.push("Al menos una mayúscula");

  // Al menos una minúscula
  if (/[a-z]/.test(password)) score++;
  else errors.push("Al menos una minúscula");

  // Al menos un número o símbolo
  if (/[0-9!@#$%^*&*()_+\-=\[\]{};':"\\|,.\/<>?]/.test(password)) score++;
  else errors.push("Al menos un número o símbolo");

  // Bonus por complejidad adicional
  if (password.length >= 12 && /(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^*&*])/.test(password)) {
    score++;
  }

  return {
    isValid: score >= 4,
    score: Math.min(score, 4),
    errors
  };
};

// Componente de indicador de fortaleza
const PasswordStrengthIndicator = ({ password }: { password: string }) => {
  if (!password) return null;

  const strength = validatePasswordStrength(password);
  const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500"];
  const labels = ["Débil", "Regular", "Buena", "Fuerte"];

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1 h-1">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className={`flex-1 rounded-full transition-all duration-300 ${index <= strength.score - 1 ? colors[strength.score - 1] : "bg-gray-200"
              }`}
          />
        ))}
      </div>
      <p className={`text-xs ${strength.score >= 3 ? "text-green-600" : strength.score >= 2 ? "text-yellow-600" : "text-red-600"
        }`}>
        Fortaleza: {labels[strength.score - 1] || "Débil"}
      </p>
      {strength.errors.length > 0 && (
        <ul className="text-xs text-gray-500 list-disc list-inside">
          {strength.errors.map((error, idx) => (
            <li key={idx}>{error}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default function ChangePassword() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    newPassword: "",
    repeatPassword: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Limpiar errores al escribir
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (form.newPassword !== form.repeatPassword) {
      setError("Las nuevas contraseñas no coinciden.");
      return;
    }

    // Validar fortaleza de contraseña
    const strengthCheck = validatePasswordStrength(form.newPassword);
    if (!strengthCheck.isValid) {
      setError(`Contraseña débil. Requisitos: ${strengthCheck.errors.join(", ")}`);
      return;
    }

    setLoading(true);

    try {
      await axios.post(
        `${API_URL}/auth/change-password`,
        form,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(
        "Contraseña actualizada correctamente. Redirigiendo al login..."
      );
      setForm({
        username: "",
        email: "",
        password: "",
        newPassword: "",
        repeatPassword: "",
      });

      setTimeout(() => {
        logout();
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      // Mensajes de error sanitizados
      const status = err.response?.status;
      if (status === 401) {
        setError("Credenciales inválidas. Verifique su contraseña actual.");
      } else if (status === 400) {
        setError("Datos inválidos. Verifique la información ingresada.");
      } else if (status >= 500) {
        setError("Error del servidor. Por favor, intente más tarde.");
      } else {
        setError("Error al cambiar la contraseña. Intente nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md p-4 shadow-md">
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                name="username"
                value={form.username}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Contraseña actual</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="newPassword">Nueva contraseña</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={form.newPassword}
                onChange={handleChange}
                required
              />
              <PasswordStrengthIndicator password={form.newPassword} />
            </div>
            <div>
              <Label htmlFor="repeatPassword">Confirmar nueva contraseña</Label>
              <Input
                id="repeatPassword"
                name="repeatPassword"
                type="password"
                value={form.repeatPassword}
                onChange={handleChange}
                required
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
            {message && <p className="text-green-600 text-sm">{message}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Actualizando..." : "Cambiar contraseña"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
