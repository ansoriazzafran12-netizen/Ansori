import React, { useState, useEffect } from "react";
import { Student, MADRASAH_SUBJECTS } from "../types";
import { Sparkles, Save, User, Award, CheckCircle, RefreshCw, AlertCircle } from "lucide-react";

interface BuatRaporAiProps {
  students: Student[];
  selectedStudent: Student | null;
  onUpdateStudent: (id: string, updated: Partial<Student>) => Promise<void>;
  onSelectStudent: (student: Student | null) => void;
}

export default function BuatRaporAi({
  students,
  selectedStudent,
  onUpdateStudent,
  onSelectStudent
}: BuatRaporAiProps) {
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);
  const [subjek, setSubjek] = useState(MADRASAH_SUBJECTS[0]);
  const [promptText, setPromptText] = useState("");
  const [generatedText, setGeneratedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Sync state if selectedStudent prop changes (e.g. from SiswaList tab)
  useEffect(() => {
    if (selectedStudent) {
      setActiveStudent(selectedStudent);
      setSubjek(selectedStudent.subjek || MADRASAH_SUBJECTS[0]);
      setGeneratedText(selectedStudent.deskripsiAi || "");
      setSuccess(false);
    } else if (students.length > 0 && !activeStudent) {
      // Pick first student if none selected
      setActiveStudent(students[0]);
      setSubjek(students[0].subjek || MADRASAH_SUBJECTS[0]);
      setGeneratedText(students[0].deskripsiAi || "");
    }
  }, [selectedStudent, students]);

  const handleStudentChange = (id: string) => {
    const student = students.find((s) => s.id === id) || null;
    setActiveStudent(student);
    if (student) {
      setSubjek(student.subjek || MADRASAH_SUBJECTS[0]);
      setGeneratedText(student.deskripsiAi || "");
      setSuccess(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!activeStudent) return;
    setLoading(true);
    setSuccess(false);
    setGeneratedText("Sedang merangkai kalimat rapor yang ramah dan bijak...");

    try {
      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "raport_desc",
          studentName: activeStudent.nama,
          studentGrade: activeStudent.nilai,
          studentSubject: subjek,
          studentClass: activeStudent.kelas
        })
      });

      const data = await response.json();
      if (response.ok && data.text) {
        setGeneratedText(data.text);
      } else {
        throw new Error(data.error || "Gagal menghasilkan deskripsi.");
      }
    } catch (err: any) {
      console.error(err);
      setGeneratedText(`Gagal membuat deskripsi rapor secara otomatis.\n\nSebab: ${err.message || err}\n\nSolusi: Silakan pastikan kunci akses Gemini API Anda diisi di Secrets dan ulangi kembali.`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReport = async () => {
    if (!activeStudent || !generatedText) return;
    setLoading(true);
    try {
      await onUpdateStudent(activeStudent.id, {
        subjek: subjek,
        deskripsiAi: generatedText
      });
      setSuccess(true);
      
      // Update our local active student state
      setActiveStudent({
        ...activeStudent,
        subjek,
        deskripsiAi: generatedText
      });
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan deskripsi rapor siswa!");
    } finally {
      setLoading(false);
    }
  };

  if (students.length === 0) {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center text-center bg-[#F0FDF4]">
        <AlertCircle className="w-12 h-12 text-slate-300 mb-3" />
        <p className="text-xs font-black text-slate-600 uppercase tracking-wide">Belum ada data siswa</p>
        <p className="text-[10px] text-slate-400 mt-2 max-w-xs font-semibold">
          Silakan tambahkan data siswa terlebih dahulu di tab <strong className="text-emerald-700 font-bold">Siswa</strong> untuk mulai merumuskan deskripsi rapor berbasis AI.
        </p>
      </div>
    );
  }

  const currentGrade = activeStudent?.nilai || 0;
  let gradeColor = "text-amber-500";
  let gradeLabel = "Cukup";
  if (currentGrade >= 90) {
    gradeColor = "text-emerald-600";
    gradeLabel = "Sangat Baik";
  } else if (currentGrade >= 80) {
    gradeColor = "text-emerald-500";
    gradeLabel = "Baik";
  } else if (currentGrade >= 75) {
    gradeColor = "text-teal-500";
    gradeLabel = "Cukup (Lulus)";
  } else {
    gradeColor = "text-rose-500";
    gradeLabel = "Perlu Bimbingan";
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F0FDF4]">
      {/* Header */}
      <div className="bg-white border-b-4 border-emerald-100 p-4 sticky top-0 z-10 shadow-md">
        <div className="flex items-center space-x-2">
          <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Generator Rapor AI</h3>
        </div>
        <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider leading-none mt-1">Sistem Perangkai Kalimat Rapor Otomatis</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Student Selector Card */}
        <div className="bg-white rounded-[2rem] border-4 border-emerald-100 p-5 shadow-xl space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-emerald-700 uppercase ml-1 mb-1 block">Pilih Siswa</label>
            <select
              value={activeStudent?.id || ""}
              onChange={(e) => handleStudentChange(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-xs focus:border-emerald-400 focus:bg-white outline-none transition-all font-bold text-slate-700 cursor-pointer"
            >
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.nama} ({student.kelas}) — Nilai: {student.nilai}
                </option>
              ))}
            </select>
          </div>

          {activeStudent && (
            <div className="grid grid-cols-3 gap-3 bg-slate-50 rounded-2xl p-3.5 border-2 border-slate-100">
              <div className="text-center border-r-2 border-slate-150">
                <span className="block text-[8px] font-black text-slate-400 uppercase tracking-wider">Kelas</span>
                <span className="text-xs font-black text-slate-800 mt-0.5 block">
                  {activeStudent.kelas}
                </span>
              </div>
              <div className="text-center border-r-2 border-slate-150">
                <span className="block text-[8px] font-black text-slate-400 uppercase tracking-wider">Nilai</span>
                <span className={`text-xs font-black mt-0.5 block ${gradeColor}`}>
                  {activeStudent.nilai}
                </span>
              </div>
              <div className="text-center">
                <span className="block text-[8px] font-black text-slate-400 uppercase tracking-wider">Predikat</span>
                <span className={`text-[9px] font-black mt-0.5 block ${gradeColor} truncate`}>
                  {gradeLabel}
                </span>
              </div>
            </div>
          )}

          {/* Subject Setting */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-emerald-700 uppercase ml-1 block">Mata Pelajaran Rapor</label>
            <select
              value={subjek}
              onChange={(e) => setSubjek(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-xs focus:border-emerald-400 focus:bg-white outline-none transition-all font-bold text-slate-700 cursor-pointer"
            >
              {MADRASAH_SUBJECTS.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          {/* Action Trigger Button */}
          <button
            onClick={handleGenerateReport}
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300 animate-pulse" />
            <span>{loading ? "Menghubungi Guru AI..." : "Hasilkan Deskripsi Rapor AI"}</span>
          </button>
        </div>

        {/* AI Result Card - Styled using the blue/Gemini colors from the Design Theme */}
        <div className="bg-white rounded-[2rem] border-4 border-blue-50 p-5 shadow-xl space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3">
            <span className="px-3 py-1 bg-blue-100 text-blue-600 text-[8px] font-black rounded-full uppercase tracking-wider">POWERED BY GEMINI AI</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-blue-800 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-blue-600" />
              <span>Draf Deskripsi Rapor</span>
            </span>
            {success && (
              <span className="text-[9px] text-emerald-600 font-extrabold flex items-center gap-0.5 bg-emerald-50 px-2.5 py-0.5 rounded-full animate-bounce">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Tersimpan!</span>
              </span>
            )}
          </div>

          <textarea
            value={generatedText}
            onChange={(e) => setGeneratedText(e.target.value)}
            placeholder="Klik tombol hijau di atas untuk merangkai deskripsi rapor otomatis secara cepat berbasis AI..."
            rows={6}
            disabled={loading}
            className="w-full bg-blue-50/40 border-2 border-blue-100 rounded-2xl p-4 text-xs leading-relaxed focus:border-blue-400 focus:bg-white outline-none transition-all disabled:opacity-75 resize-none font-sans text-slate-700 font-medium"
          />

          {generatedText && (
            <div className="flex gap-3">
              <button
                onClick={handleGenerateReport}
                disabled={loading}
                className="flex-1 bg-slate-50 border-2 border-slate-100 hover:bg-slate-100 text-slate-700 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                <span>Buat Ulang</span>
              </button>
              <button
                onClick={handleSaveReport}
                disabled={loading || !generatedText.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Nilai</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
