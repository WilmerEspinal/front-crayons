import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { User, Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

// Constantes para rate limiting
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutos

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Rate limiting state
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState(0);

  // Cargar intentos desde localStorage al montar
  useEffect(() => {
    const storedAttempts = localStorage.getItem("loginAttempts");
    const storedLockoutTime = localStorage.getItem("lockoutTime");

    if (storedAttempts) {
      setLoginAttempts(parseInt(storedAttempts, 10));
    }

    if (storedLockoutTime) {
      const lockoutEnd = parseInt(storedLockoutTime, 10);
      const now = Date.now();

      if (now < lockoutEnd) {
        setIsLocked(true);
        setLockoutTime(lockoutEnd);
        setRemainingTime(Math.ceil((lockoutEnd - now) / 1000));
      } else {
        // Limpiar bloqueo expirado
        localStorage.removeItem("loginAttempts");
        localStorage.removeItem("lockoutTime");
      }
    }
  }, []);

  // Timer para cuenta regresiva
  useEffect(() => {
    if (isLocked && lockoutTime) {
      const interval = setInterval(() => {
        const now = Date.now();
        const remaining = Math.ceil((lockoutTime - now) / 1000);

        if (remaining <= 0) {
          setIsLocked(false);
          setLoginAttempts(0);
          setLockoutTime(null);
          setRemainingTime(0);
          localStorage.removeItem("loginAttempts");
          localStorage.removeItem("lockoutTime");
          clearInterval(interval);
        } else {
          setRemainingTime(remaining);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isLocked, lockoutTime]);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Verificar si está bloqueado
    if (isLocked) {
      const minutes = Math.ceil(remainingTime / 60);
      setError(`Cuenta bloqueada. Intente nuevamente en ${minutes} minuto(s).`);
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/auth/login`,
        form,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      // Reset de intentos exitosos
      setLoginAttempts(0);
      localStorage.removeItem("loginAttempts");
      localStorage.removeItem("lockoutTime");

      const token = response.data.token || response.data.data?.token;
      let roleId =
        response.data.roleId ||
        response.data.role ||
        response.data.data?.roleId ||
        response.data.data?.role ||
        (response.data.user && response.data.user.roleId);

      if (!token) {
        setError("Error al iniciar sesión. Por favor, intente nuevamente.");
        setIsLoading(false);
        return;
      }

      login(token, roleId);
      if (roleId === 1) {
        navigate("/dashboard");
      } else if (roleId === 2) {
        navigate("/teacher");
      } else {
        navigate("/");
      }
    } catch (error: unknown) {
      // Incrementar intentos fallidos
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      localStorage.setItem("loginAttempts", newAttempts.toString());

      // Verificar si se debe bloquear
      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        const lockoutEnd = Date.now() + LOCKOUT_DURATION_MS;
        setIsLocked(true);
        setLockoutTime(lockoutEnd);
        localStorage.setItem("lockoutTime", lockoutEnd.toString());
        setError(`Demasiados intentos fallidos. Cuenta bloqueada por 5 minutos.`);
      } else {
        const remaining = MAX_LOGIN_ATTEMPTS - newAttempts;

        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as {
            response: {
              status: number;
              data: {
                message?: string;
                change_password_required?: boolean;
                cambiar_password?: boolean;
                token?: string;
                roleId?: number;
                data?: { token?: string; roleId?: number }
              }
            }
          };
          const { status, data } = axiosError.response;

          // Check if password change is required (by flag or message)
          const requiresPasswordChange =
            data.cambiar_password ||
            data.change_password_required ||
            (data.message && data.message.toLowerCase().includes('debe cambiar su contraseña'));

          if ((status === 403 || status === 401) && requiresPasswordChange) {
            const tempToken = data.token || data.data?.token;
            const tempRoleId = data.roleId || data.data?.roleId;

            if (tempToken) {
              // Guardamos el token para que la página de cambio de contraseña lo use
              login(tempToken, tempRoleId || null);
            }
            // Reset de intentos al requerir cambio de contraseña
            setLoginAttempts(0);
            localStorage.removeItem("loginAttempts");
            // Redirect immediately without showing error
            navigate("/change-password");
            return;
          }

          // Mensaje de error sanitizado
          if (status === 401) {
            setError(`Usuario o contraseña incorrectos. ${remaining} intento(s) restante(s).`);
          } else if (status === 403) {
            setError("Acceso denegado. Contacte al administrador.");
          } else if (status >= 500) {
            setError("Error del servidor. Por favor, intente más tarde.");
          } else {
            setError(`Error de autenticación. ${remaining} intento(s) restante(s).`);
          }
        } else {
          setError("Error de conexión. Verifique su conexión a internet.");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-100 font-sans antialiased p-4 flex items-center justify-center h-[calc(100vh-40px)] md:h-[calc(100vh-30px)]">
      <div className="flex w-full max-w-4xl bg-white rounded-2xl overflow-hidden shadow-xl ">
        {/* LADO IZQUIERDO: Branding */}
        <div className="hidden md:flex md:w-1/2 relative bg-gradient-to-br from-slate-900 to-slate-700">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center opacity-20"></div>

          <div className="relative z-10 p-10 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <img
                  src="https://res.cloudinary.com/dszdc6rh8/image/upload/v1747351782/image_1_vhjpzr.png"
                  alt="Logo Crayon's"
                  className="h-10 w-auto"
                />
              </div>

              <h2 className="text-3xl font-bold text-white leading-tight mb-4">
                El futuro de <br />
                <span className="text-white/60 italic font-light">tus hijos</span> <br />
                comienza aquí.
              </h2>
              <div className="h-1 w-16 bg-[#F26513] rounded-full"></div>
            </div>
          </div>
        </div>

        {/* LADO DERECHO: Formulario */}
        <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-1">MiCole Login</h1>
            <p className="text-slate-500 text-sm">Acceso exclusivo para la comunidad Crayon's</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded-lg text-sm">
                <p className="font-semibold text-xs mb-1">Error de acceso</p>
                <p className="text-xs">{error}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">Usuario <span className="text-red-500">*</span></label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="DNI o Código de Familia"
                  className="w-full h-10 bg-white border border-slate-300 rounded-lg text-sm pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">Contraseña <span className="text-red-500">*</span></label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Contraseña"
                  className="w-full h-10 bg-white border border-slate-300 rounded-lg text-sm pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Botón de Acción */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold h-11 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span className="text-sm">Entrar a MiCole</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
