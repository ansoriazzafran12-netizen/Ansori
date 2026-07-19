import React, { useState, useEffect } from "react";
import { Student } from "./types";
import AndroidFrame from "./components/AndroidFrame";
import Dashboard from "./components/Dashboard";
import SiswaList from "./components/SiswaList";
import AsistenAi from "./components/AsistenAi";
import BuatRaporAi from "./components/BuatRaporAi";
import { Home, Users, Sparkles, MessageSquare, Download, Upload, BookMarked } from "lucide-react";

export default function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [activeTab, setActiveTab] = useState<string>("home");
  const [selectedStudentForReport, setSelectedStudentForReport] = useState<Student | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch all students from the server
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/students");
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      } else {
        console.error("Gagal memuat data siswa");
      }
    } catch (err) {
      console.error("Koneksi gagal:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Add student to backend
  const handleAddStudent = async (newStudent: Omit<Student, "id" | "createdAt">) => {
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStudent),
      });
      if (res.ok) {
        await fetchStudents();
      } else {
        const errData = await res.json();
        alert(`Gagal menambah siswa: ${errData.error || "Kesalahan server"}`);
      }
    } catch (err) {
      console.error("Gagal menambah siswa:", err);
      alert("Terjadi kesalahan jaringan!");
    }
  };

  // Update student in backend
  const handleUpdateStudent = async (id: string, updatedData: Partial<Student>) => {
    try {
      const res = await fetch(`/api/students/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      if (res.ok) {
        await fetchStudents();
      } else {
        const errData = await res.json();
        alert(`Gagal memperbarui siswa: ${errData.error || "Kesalahan server"}`);
      }
    } catch (err) {
      console.error("Gagal memperbarui siswa:", err);
      alert("Terjadi kesalahan jaringan!");
    }
  };

  // Delete student in backend
  const handleDeleteStudent = async (id: string) => {
    try {
      const res = await fetch(`/api/students/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchStudents();
      } else {
        const errData = await res.json();
        alert(`Gagal menghapus siswa: ${errData.error || "Kesalahan server"}`);
      }
    } catch (err) {
      console.error("Gagal menghapus siswa:", err);
      alert("Terjadi kesalahan jaringan!");
    }
  };

  // Switch tab and forward preselected student to AI Report generator
  const handleSelectStudentForReport = (student: Student) => {
    setSelectedStudentForReport(student);
    setActiveTab("raport");
  };

  // Backup Download: Downloads all current student data as a JSON file
  const handleDownloadBackup = () => {
    const dataStr = JSON.stringify(students, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `backup_madrasah_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Backup Upload: Parses uploaded JSON file and overwrites / syncs
  const handleUploadBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content) as Student[];

        if (!Array.isArray(parsed)) {
          throw new Error("Format berkas tidak valid. Harus berupa array siswa.");
        }

        const confirmRestore = confirm(
          `Apakah Anda yakin ingin memulihkan ${parsed.length} data siswa? Tindakan ini akan menambah data baru.`
        );

        if (confirmRestore) {
          // Send all to server sequentially or bulk (we can post each one)
          for (const s of parsed) {
            await handleAddStudent({
              nama: s.nama,
              kelas: s.kelas,
              nilai: s.nilai,
              subjek: s.subjek || "Umum",
              deskripsiAi: s.deskripsiAi || ""
            });
          }
          alert("Data cadangan berhasil dipulihkan!");
        }
      } catch (err: any) {
        alert("Gagal membaca file cadangan: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <AndroidFrame>
      {/* App bar / Top Header */}
      <div id="app-bar" className="h-16 bg-emerald-600 text-white flex items-center justify-between px-5 z-10 border-b border-emerald-500/20 shadow-lg flex-shrink-0 select-none">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md">
            <div className="text-emerald-600 font-black text-lg">M</div>
          </div>
          <div>
            <h1 className="text-xs font-black tracking-tight leading-none uppercase">MADRASAH DIGITAL</h1>
            <span className="text-[8px] text-emerald-100 font-bold tracking-wider uppercase">Portal Guru Pintar</span>
          </div>
        </div>

        {/* Backup Controls */}
        <div className="flex items-center gap-1.5 bg-emerald-700/50 py-1 px-2.5 rounded-full border border-emerald-500/30">
          <button
            onClick={handleDownloadBackup}
            className="p-1.5 hover:bg-emerald-600 rounded-lg text-white/90 hover:text-white transition-all"
            title="Unduh Cadangan Data"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <label
            className="p-1.5 hover:bg-emerald-600 rounded-lg text-white/90 hover:text-white transition-all cursor-pointer"
            title="Unggah Cadangan Data"
          >
            <Upload className="w-3.5 h-3.5" />
            <input
              type="file"
              accept=".json"
              onChange={handleUploadBackup}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Main Viewport Content Area */}
      <div id="main-content" className="flex-1 overflow-hidden flex flex-col bg-[#F0FDF4] relative">
        {loading && students.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-emerald-800">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-[10px] font-bold tracking-wider uppercase">Memuat Database Madrasah...</p>
          </div>
        ) : (
          <>
            {activeTab === "home" && (
              <Dashboard
                students={students}
                onNavigate={setActiveTab}
                onAddSiswaClick={() => {
                  setActiveTab("siswa");
                }}
              />
            )}

            {activeTab === "siswa" && (
              <SiswaList
                students={students}
                onAdd={handleAddStudent}
                onUpdate={handleUpdateStudent}
                onDelete={handleDeleteStudent}
                onSelectStudentForReport={handleSelectStudentForReport}
              />
            )}

            {activeTab === "raport" && (
              <BuatRaporAi
                students={students}
                selectedStudent={selectedStudentForReport}
                onUpdateStudent={handleUpdateStudent}
                onSelectStudent={setSelectedStudentForReport}
              />
            )}

            {activeTab === "asisten" && <AsistenAi />}
          </>
        )}
      </div>

      {/* Bottom Android Navigation Buttons */}
      <div id="bottom-tabs" className="h-15 bg-white border-t border-emerald-100/50 flex items-center justify-around select-none flex-shrink-0 z-30 shadow-[0_-5px_20px_rgba(4,120,87,0.06)]">
        {/* Home Button */}
        <button
          onClick={() => setActiveTab("home")}
          className={`flex flex-col items-center justify-center w-14 h-full transition-all ${
            activeTab === "home" ? "text-emerald-600 scale-105" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Home className={`w-4 h-4 ${activeTab === "home" ? "stroke-[2.5px]" : "stroke-[1.8px]"}`} />
          <span className="text-[8px] font-black tracking-tight mt-1">Beranda</span>
        </button>

        {/* Siswa Button */}
        <button
          onClick={() => setActiveTab("siswa")}
          className={`flex flex-col items-center justify-center w-14 h-full transition-all ${
            activeTab === "siswa" ? "text-emerald-600 scale-105" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Users className={`w-4 h-4 ${activeTab === "siswa" ? "stroke-[2.5px]" : "stroke-[1.8px]"}`} />
          <span className="text-[8px] font-black tracking-tight mt-1">Siswa</span>
        </button>

        {/* Rapor AI Button */}
        <button
          onClick={() => {
            setSelectedStudentForReport(null);
            setActiveTab("raport");
          }}
          className={`flex flex-col items-center justify-center w-14 h-full transition-all ${
            activeTab === "raport" ? "text-emerald-600 scale-105" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Sparkles className={`w-4 h-4 ${activeTab === "raport" ? "text-amber-500 fill-amber-300 stroke-[2.2px]" : "text-slate-400"}`} />
          <span className="text-[8px] font-black tracking-tight mt-1">Rapor AI</span>
        </button>

        {/* Asisten AI Button */}
        <button
          onClick={() => setActiveTab("asisten")}
          className={`flex flex-col items-center justify-center w-14 h-full transition-all ${
            activeTab === "asisten" ? "text-emerald-600 scale-105" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <MessageSquare className={`w-4 h-4 ${activeTab === "asisten" ? "stroke-[2.5px]" : "stroke-[1.8px]"}`} />
          <span className="text-[8px] font-black tracking-tight mt-1">Asisten AI</span>
        </button>
      </div>
    </AndroidFrame>
  );
}
