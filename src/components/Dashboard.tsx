import React from "react";
import { Student } from "../types";
import { Users, GraduationCap, CheckCircle, AlertCircle, Sparkles, BookOpen, UserPlus, ArrowRight, BookMarked } from "lucide-react";

interface DashboardProps {
  students: Student[];
  onNavigate: (tab: string) => void;
  onAddSiswaClick: () => void;
}

export default function Dashboard({ students, onNavigate, onAddSiswaClick }: DashboardProps) {
  // Statistics Calculations
  const totalSiswa = students.length;
  
  const avgNilai = totalSiswa > 0 
    ? Math.round(students.reduce((acc, s) => acc + s.nilai, 0) / totalSiswa) 
    : 0;

  const tuntas = students.filter(s => s.nilai >= 75).length;
  const remedial = totalSiswa - tuntas;

  // Grade categorization
  const gradeA = students.filter(s => s.nilai >= 90).length;
  const gradeB = students.filter(s => s.nilai >= 80 && s.nilai < 90).length;
  const gradeC = students.filter(s => s.nilai >= 75 && s.nilai < 80).length;
  const gradeD = students.filter(s => s.nilai < 75).length;

  // Inspirational Islamic educational quote
  const educationalQuotes = [
    { quote: "Tuntutlah ilmu, sesungguhnya menuntut ilmu karena Allah adalah ibadah.", author: "Muadz bin Jabal" },
    { quote: "Ilmu itu seperti air. Jika ia berhenti mengalir, ia akan menjadi keruh.", author: "Imam Syafi'i" },
    { quote: "Didiklah anak-anakmu sesuai dengan zamannya, karena mereka hidup bukan di zamanmu.", author: "Sayyidina Ali bin Abi Thalib" },
    { quote: "Sebaik-baik manusia adalah yang paling bermanfaat bagi orang lain.", author: "HR. Ahmad" }
  ];

  // Pick quote based on date or random
  const todayIndex = new Date().getDate() % educationalQuotes.length;
  const activeQuote = educationalQuotes[todayIndex];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F0FDF4]">
      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Madrasah Welcoming Banner */}
        <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700 rounded-[2rem] p-5 text-white shadow-xl border-4 border-emerald-100/50 relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full w-fit">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300 animate-pulse" />
              <span className="text-[9px] font-black tracking-widest uppercase">Portal Guru Digital</span>
            </div>
            <h2 className="text-lg font-black tracking-tight leading-tight">Assalamu'alaikum, Ustaz/Ustazah!</h2>
            <p className="text-xs text-emerald-100 leading-relaxed font-semibold">
              Semoga dedikasi mulia Anda mendidik putra-putri Madrasah dicatat sebagai amal jariyah yang berkah & berlipat ganda.
            </p>
          </div>

          {/* Decorative Mosque Shape Accent in Background */}
          <div className="absolute right-0 bottom-0 top-0 opacity-10 flex items-center justify-center">
            <BookMarked className="w-40 h-40 translate-x-8 translate-y-8" />
          </div>
        </div>

        {/* Daily Quote Card */}
        <div className="bg-amber-50/90 rounded-[1.8rem] p-4 border-4 border-amber-150 shadow-md space-y-1.5">
          <p className="text-[11px] text-amber-900 font-bold italic leading-relaxed">
            "{activeQuote.quote}"
          </p>
          <span className="block text-[9px] text-amber-700 font-black text-right uppercase tracking-wider">
            — {activeQuote.author}
          </span>
        </div>

        {/* Core Statistics Bento Grid - Vibrant Pastel Colors */}
        <div className="grid grid-cols-2 gap-3.5">
          {/* Total Siswa */}
          <div className="bg-amber-50 rounded-[1.8rem] p-4 shadow-md border-4 border-amber-100 flex items-center gap-3">
            <div className="bg-amber-100 p-2.5 rounded-2xl text-amber-800">
              <Users className="w-5 h-5 stroke-[2.5px]" />
            </div>
            <div>
              <span className="block text-[8px] text-amber-800/70 font-black tracking-wider uppercase">Total Murid</span>
              <span className="text-xl font-black text-amber-900 leading-none">{totalSiswa}</span>
            </div>
          </div>

          {/* Average Grade */}
          <div className="bg-emerald-50 rounded-[1.8rem] p-4 shadow-md border-4 border-emerald-100 flex items-center gap-3">
            <div className="bg-emerald-100 p-2.5 rounded-2xl text-emerald-800">
              <GraduationCap className="w-5 h-5 stroke-[2.5px]" />
            </div>
            <div>
              <span className="block text-[8px] text-emerald-800/70 font-black tracking-wider uppercase">Rata Nilai</span>
              <span className="text-xl font-black text-emerald-950 leading-none">{avgNilai}</span>
            </div>
          </div>

          {/* Tuntas KKM */}
          <div className="bg-blue-50 rounded-[1.8rem] p-4 shadow-md border-4 border-blue-100 flex items-center gap-3">
            <div className="bg-blue-100 p-2.5 rounded-2xl text-blue-800">
              <CheckCircle className="w-5 h-5 stroke-[2.5px]" />
            </div>
            <div>
              <span className="block text-[8px] text-blue-800/70 font-black tracking-wider uppercase">Tuntas KKM</span>
              <span className="text-sm font-black text-blue-900 leading-none">
                {tuntas} <span className="text-[10px] font-bold text-blue-500">({totalSiswa > 0 ? Math.round((tuntas/totalSiswa)*100) : 0}%)</span>
              </span>
            </div>
          </div>

          {/* Remedial */}
          <div className="bg-rose-50 rounded-[1.8rem] p-4 shadow-md border-4 border-rose-100 flex items-center gap-3">
            <div className="bg-rose-100 p-2.5 rounded-2xl text-rose-800">
              <AlertCircle className="w-5 h-5 stroke-[2.5px]" />
            </div>
            <div>
              <span className="block text-[8px] text-rose-800/70 font-black tracking-wider uppercase">Remedial</span>
              <span className="text-sm font-black text-rose-900 leading-none">
                {remedial} <span className="text-[10px] font-bold text-rose-500">({totalSiswa > 0 ? Math.round((remedial/totalSiswa)*100) : 0}%)</span>
              </span>
            </div>
          </div>
        </div>

        {/* Visual Grade Distribution Section */}
        <div className="bg-white border-4 border-emerald-100 rounded-[2rem] p-5 shadow-xl space-y-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Distribusi Nilai Siswa</h4>
              <p className="text-[8px] text-slate-400 font-medium leading-none">Pengelompokan predikat raport madrasah</p>
            </div>
          </div>

          {totalSiswa === 0 ? (
            <p className="text-[10px] text-slate-400 italic text-center py-4">Belum ada data nilai siswa.</p>
          ) : (
            <div className="space-y-3">
              {/* Grade A */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-black text-slate-600">
                  <span>Sangat Baik (90-100)</span>
                  <span>{gradeA} Siswa</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(gradeA / totalSiswa) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Grade B */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-black text-slate-600">
                  <span>Baik (80-89)</span>
                  <span>{gradeB} Siswa</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(gradeB / totalSiswa) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Grade C */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-black text-slate-600">
                  <span>Cukup (75-79)</span>
                  <span>{gradeC} Siswa</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-teal-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(gradeC / totalSiswa) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Grade D */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-black text-slate-600">
                  <span>Remedial ({"<"}75)</span>
                  <span>{gradeD} Siswa</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(gradeD / totalSiswa) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Menu Actions */}
        <div className="bg-white border-4 border-slate-100 rounded-[2rem] p-5 shadow-xl space-y-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Aksi Pintas Kelas</h4>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onAddSiswaClick}
              className="flex flex-col items-center justify-center p-4 bg-emerald-50/70 hover:bg-emerald-100 border-2 border-emerald-200/50 rounded-2xl text-center gap-2 transition-all group shadow-sm"
            >
              <div className="bg-emerald-500 text-white p-3 rounded-xl shadow-md shadow-emerald-200 group-hover:scale-105 transition-transform">
                <UserPlus className="w-5 h-5 stroke-[2.5px]" />
              </div>
              <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider">Input Nilai</span>
            </button>

            <button
              onClick={() => onNavigate("raport")}
              className="flex flex-col items-center justify-center p-4 bg-blue-50/70 hover:bg-blue-100 border-2 border-blue-200/50 rounded-2xl text-center gap-2 transition-all group shadow-sm"
            >
              <div className="bg-blue-600 text-white p-3 rounded-xl shadow-md shadow-blue-200 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-amber-300 fill-amber-300 stroke-[2.2px]" />
              </div>
              <span className="text-[10px] font-black text-blue-800 uppercase tracking-wider">Rapor AI</span>
            </button>
          </div>
        </div>

        {/* Quick Guide */}
        <div className="bg-slate-50 border-2 border-slate-150 rounded-[1.8rem] p-4 flex items-start gap-3 shadow-inner">
          <BookOpen className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h5 className="text-[10px] font-black text-slate-700 uppercase tracking-wider">Langkah Ringkas</h5>
            <p className="text-[9px] text-slate-500 leading-relaxed font-semibold">
              1. Masukkan data nilai di tab <strong className="text-emerald-700 font-bold">Siswa</strong>.<br/>
              2. Buat deskripsi raport instan di tab <strong className="text-emerald-700 font-bold">Rapor AI</strong>.<br/>
              3. Tanya ide RPP / materi mengajar di tab <strong className="text-emerald-700 font-bold">Asisten AI</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
