import React from "react";
import { Bot, X, Send, Loader2, Sparkles, ChevronDown } from "lucide-react";
import api from "@/lib/axios";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};



export default function ChatBot() {
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "¡Hola! Soy el asistente inteligente de Crayon's. Puedes preguntarme sobre alumnos, docentes, pagos, asistencia y más. ¿En qué te puedo ayudar?",
    },
  ]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", text: trimmed },
    ]);
    setInput("");
    setLoading(true);

    try {
      const { data } = await api.post("/ai-assistant", { pregunta: trimmed });
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: data.respuesta || "No pude obtener una respuesta.",
        },
      ]);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text:
            error?.response?.data?.message ||
            "Ocurrió un error al consultar el asistente. Inténtalo de nuevo.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 ${open
          ? "bg-slate-800"
          : "bg-gradient-to-br from-blue-600 to-indigo-600 hover:scale-105 hover:shadow-2xl hover:shadow-blue-200"
          }`}
        title="Asistente IA"
      >
        {open ? (
          <ChevronDown className="w-6 h-6 text-white" />
        ) : (
          <>
            <Bot className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
          </>
        )}
      </button>

      {/* Chat Panel */}
      <div
        className={`fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col transition-all duration-300 origin-bottom-right ${open
          ? "opacity-100 scale-100 pointer-events-auto"
          : "opacity-0 scale-95 pointer-events-none"
          }`}
        style={{ maxHeight: "520px" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl flex-shrink-0">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-white">Asistente Inteligente</p>
            <p className="text-[10px] text-blue-100 font-medium">Crayon's AI · Datos en tiempo real</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-white/70 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto p-4 space-y-3"
          style={{ minHeight: 0, maxHeight: "340px" }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                  <Bot className="w-3 h-3 text-white" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-xl px-3 py-2 text-xs leading-relaxed ${msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-slate-100 text-slate-800 rounded-bl-none"
                  }`}
              >
                <p>{msg.text}</p>

              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mr-2 mt-0.5">
                <Bot className="w-3 h-3 text-white" />
              </div>
              <div className="bg-slate-100 rounded-xl rounded-bl-none px-3 py-2">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>



        {/* Input */}
        <div className="px-3 pb-3 pt-1 flex-shrink-0">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-100 transition-all">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu pregunta..."
              className="flex-1 bg-transparent text-xs text-slate-800 placeholder:text-slate-400 outline-none"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white flex items-center justify-center transition-all active:scale-95 flex-shrink-0"
            >
              {loading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Send className="w-3 h-3" />
              )}
            </button>
          </div>
          <p className="text-[9px] text-slate-300 text-center mt-1.5 font-medium uppercase tracking-widest">
            AI · Datos en tiempo real
          </p>
        </div>
      </div>
    </>
  );
}
