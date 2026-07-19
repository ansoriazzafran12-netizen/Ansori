import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Bot, User, Trash2, ArrowRight } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

export default function AsistenAi() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m1",
      sender: "ai",
      text: "Assalamu'alaikum Wr. Wb. Saya adalah Asisten AI Madrasah Anda. Saya siap membantu Anda menyusun rencana pembelajaran (RPP), ide mengajar kreatif Islami, membuat soal ujian, atau menyusun kalimat motivasi siswa. \n\nBagaimana saya bisa membantu perjuangan mengajar Anda hari ini?",
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    "Buatkan ide Ice Breaking Islami singkat sebelum mulai mengajar",
    "Buatkan RPP ringkas Fiqih Bab Sholat Berjamaah Kelas 7",
    "Rekomendasi materi Akhlak terpuji tentang Menghormati Orang Tua",
    "Buat 5 butir soal pilihan ganda tentang sejarah dakwah Nabi Muhammad"
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "lesson_plan",
          prompt: textToSend
        })
      });

      const data = await response.json();
      if (response.ok && data.text) {
        const aiMsg: Message = {
          id: `msg_${Date.now() + 1}`,
          sender: "ai",
          text: data.text,
          timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error(data.error || "Gagal mendapatkan respon AI.");
      }
    } catch (err: any) {
      console.error(err);
      const errorMsg: Message = {
        id: `msg_${Date.now() + 1}`,
        sender: "ai",
        text: `Maaf, terjadi kesalahan koneksi atau sistem AI belum sepenuhnya siap: ${err.message || err}. Harap pastikan GEMINI_API_KEY Anda sudah terpasang dengan benar di menu Secrets.`,
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    if (confirm("Apakah Anda ingin menghapus riwayat obrolan ini?")) {
      setMessages([
        {
          id: "m_init",
          sender: "ai",
          text: "Riwayat dibersihkan. Ada yang ingin Anda tanyakan lagi seputar materi mengajar di Madrasah?",
          timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F0FDF4]">
      {/* Chat Header */}
      <div className="bg-white border-b-4 border-emerald-100 p-4 sticky top-0 z-10 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="bg-emerald-100 p-1.5 rounded-xl">
            <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Asisten Pembelajaran AI</h3>
            <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none block mt-1">Model Gemini 3.5 Flash</span>
          </div>
        </div>
        {messages.length > 1 && (
          <button
            onClick={clearChat}
            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-xl transition-all border border-rose-200/40"
            title="Bersihkan obrolan"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F0FDF4]">
        {messages.map((msg) => {
          const isAi = msg.sender === "ai";
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isAi ? "justify-start" : "justify-end"}`}
            >
              {isAi && (
                <div className="bg-emerald-500 text-white p-2 rounded-xl flex-shrink-0 shadow-md">
                  <Bot className="w-4 h-4 stroke-[2px]" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-[1.6rem] px-4 py-3 text-xs shadow-lg ${
                  isAi
                    ? "bg-white text-slate-700 border-4 border-blue-50 rounded-tl-none whitespace-pre-line"
                    : "bg-emerald-600 text-white rounded-tr-none border-2 border-emerald-500"
                }`}
              >
                <p className="leading-relaxed font-semibold">{msg.text}</p>
                <span
                  className={`block text-[8px] mt-2 font-bold text-right uppercase tracking-wider ${
                    isAi ? "text-slate-400" : "text-emerald-200"
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
              {!isAi && (
                <div className="bg-emerald-100 text-emerald-800 p-2 rounded-xl flex-shrink-0 shadow-sm">
                  <User className="w-4 h-4 stroke-[2px]" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-2.5">
            <div className="bg-emerald-500 text-white p-2 rounded-xl flex-shrink-0 animate-bounce">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white text-slate-500 border-4 border-blue-50 rounded-[1.6rem] rounded-tl-none px-4 py-3 text-xs shadow-lg flex items-center gap-2">
              <span className="flex gap-1.5">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </span>
              <span className="font-black italic text-[9px] uppercase tracking-wide text-blue-600">AI sedang merumuskan ide...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Chat Suggestion chips or input block */}
      <div className="bg-white border-t-4 border-emerald-100 p-4 space-y-4 sticky bottom-0 shadow-2xl">
        {messages.length === 1 && (
          <div className="space-y-2">
            <p className="text-[9px] font-black text-emerald-700 uppercase tracking-widest block ml-1">Rekomendasi Pertanyaan:</p>
            <div className="flex flex-col gap-2">
              {suggestions.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(sug)}
                  className="flex items-center justify-between text-left bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border-2 border-slate-100 hover:border-emerald-200 px-3.5 py-2.5 rounded-2xl text-[10px] font-bold transition-all shadow-sm"
                >
                  <span className="truncate pr-4 leading-normal">{sug}</span>
                  <ArrowRight className="w-3.5 h-3.5 flex-shrink-0 text-emerald-600 opacity-60" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Text Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputText);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Tanyakan ide ice breaking, rpp, atau soal..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={loading}
            className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-xs focus:border-emerald-400 focus:bg-white outline-none transition-all disabled:opacity-60 text-slate-700 font-medium"
          />
          <button
            type="submit"
            disabled={loading || !inputText.trim()}
            className="bg-emerald-500 hover:bg-emerald-600 text-white p-3.5 rounded-2xl shadow-lg shadow-emerald-200/50 hover:shadow-emerald-300/50 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex-shrink-0"
          >
            <Send className="w-4 h-4 stroke-[2.5px]" />
          </button>
        </form>
      </div>
    </div>
  );
}
