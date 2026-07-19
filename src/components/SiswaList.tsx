import React, { useState } from "react";
import { Student, MADRASAH_SUBJECTS, MADRASAH_CLASSES } from "../types";
import { Search, Plus, Trash2, Edit2, Sparkles, Filter, Check, X, Award, AlertCircle } from "lucide-react";

interface SiswaListProps {
  students: Student[];
  onAdd: (student: Omit<Student, "id" | "createdAt">) => Promise<void>;
  onUpdate: (id: string, updated: Partial<Student>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSelectStudentForReport: (student: Student) => void;
}

export default function SiswaList({
  students,
  onAdd,
  onUpdate,
  onDelete,
  onSelectStudentForReport
}: SiswaListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("Semua");
  const [selectedSubject, setSelectedSubject] = useState("Semua");
  
  // Modal/Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form fields
  const [nama, setNama] = useState("");
  const [kelas, setKelas] = useState(MADRASAH_CLASSES[6]); // 7A default
  const [subjek, setSubjek] = useState(MADRASAH_SUBJECTS[0]); // Al-Qur'an Hadits default
  const [nilai, setNilai] = useState<number>(80);
  const [deskripsiAi, setDeskripsiAi] = useState("");
  
  const [loading, setLoading] = useState(false);

  const openAddForm = () => {
    setEditingId(null);
    setNama("");
    setKelas(MADRASAH_CLASSES[6]);
    setSubjek(MADRASAH_SUBJECTS[0]);
    setNilai(80);
    setDeskripsiAi("");
    setIsFormOpen(true);
  };

  const openEditForm = (student: Student) => {
    setEditingId(student.id);
    setNama(student.nama);
    setKelas(student.kelas);
    setSubjek(student.subjek || MADRASAH_SUBJECTS[0]);
    setNilai(student.nilai);
    setDeskripsiAi(student.deskripsiAi || "");
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) return alert("Nama siswa wajib diisi!");
    if (nilai < 0 || nilai > 100) return alert("Nilai harus berada antara 0 - 100!");

    setLoading(true);
    try {
      if (editingId) {
        await onUpdate(editingId, { nama, kelas, nilai, subjek, deskripsiAi });
      } else {
        await onAdd({ nama, kelas, nilai, subjek, deskripsiAi });
      }
      setIsFormOpen(false);
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan data!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data nilai ${name}?`)) {
      try {
        await onDelete(id);
      } catch (err) {
        console.error(err);
        alert("Gagal menghapus data!");
      }
    }
  };

  // Filter & Search logic
  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          student.kelas.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClass === "Semua" || student.kelas === selectedClass;
    const matchesSubject = selectedSubject === "Semua" || student.subjek === selectedSubject;
    return matchesSearch && matchesClass && matchesSubject;
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F0FDF4]">
      {/* Header with Search and Filters */}
      <div className="bg-white border-b-4 border-emerald-100 p-4 sticky top-0 z-10 space-y-3.5 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Manajemen Siswa & Nilai</h3>
          </div>
          <button
            onClick={openAddForm}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-3.5 py-2 rounded-2xl text-xs font-black shadow-lg shadow-emerald-200/50 hover:shadow-emerald-300/50 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5px]" />
            <span>TAMBAH</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Cari nama siswa atau kelas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-10 pr-4 py-3 text-xs focus:border-emerald-400 focus:bg-white outline-none transition-all text-slate-700 font-medium"
          />
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="flex items-center bg-slate-50 border-2 border-slate-100 rounded-2xl px-3 py-2 text-slate-600">
            <span className="text-[10px] font-black text-emerald-700 mr-2 uppercase tracking-wide">Kelas:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-transparent text-xs outline-none flex-1 font-bold text-slate-800 cursor-pointer"
            >
              <option value="Semua">Semua</option>
              {MADRASAH_CLASSES.map((cls) => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center bg-slate-50 border-2 border-slate-100 rounded-2xl px-3 py-2 text-slate-600">
            <span className="text-[10px] font-black text-emerald-700 mr-2 uppercase tracking-wide">Mapel:</span>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-transparent text-xs outline-none flex-1 font-bold text-slate-800 cursor-pointer truncate"
            >
              <option value="Semua">Semua Mapel</option>
              {MADRASAH_SUBJECTS.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Student List Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredStudents.length === 0 ? (
          <div className="bg-white rounded-[2rem] border-4 border-dashed border-slate-200 p-8 text-center flex flex-col items-center justify-center">
            <AlertCircle className="w-12 h-12 text-slate-300 mb-3" />
            <p className="text-xs font-black text-slate-600 uppercase tracking-wide">Tidak ada siswa ditemukan</p>
            <p className="text-[10px] text-slate-400 mt-1 font-semibold">Coba ubah filter atau tambah data siswa baru.</p>
          </div>
        ) : (
          filteredStudents.map((student) => {
            const isPassing = student.nilai >= 75;
            return (
              <div
                key={student.id}
                className="bg-white rounded-[2rem] border-4 border-slate-100 p-4 shadow-xl hover:border-emerald-100 transition-all space-y-3"
              >
                {/* Siswa Card Top Section */}
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-black text-slate-800 tracking-tight leading-tight">{student.nama}</h4>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black tracking-wide px-2.5 py-0.5 rounded-full">
                        KELAS {student.kelas}
                      </span>
                      <span className="bg-slate-100 text-slate-700 text-[9px] font-bold px-2.5 py-0.5 rounded-full truncate max-w-[140px]">
                        {student.subjek || "Umum"}
                      </span>
                    </div>
                  </div>

                  {/* Grade Badge */}
                  <div className="text-right flex flex-col items-end">
                    <span className={`text-xl font-black ${isPassing ? "text-emerald-500" : "text-amber-500"}`}>
                      {student.nilai}
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Nilai Akhir</span>
                  </div>
                </div>

                {/* AI Description preview if exists */}
                {student.deskripsiAi ? (
                  <div className="bg-emerald-50/70 rounded-2xl p-3 border-2 border-emerald-100">
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-black uppercase mb-1.5">
                      <Award className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Rapor Deskripsi AI</span>
                    </div>
                    <p className="text-[11px] text-slate-700 line-clamp-3 leading-relaxed font-medium italic">
                      "{student.deskripsiAi}"
                    </p>
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-2xl p-3 border-2 border-dashed border-slate-200 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-bold italic">
                      Belum memiliki Rapor AI
                    </span>
                    <button
                      onClick={() => onSelectStudentForReport(student)}
                      className="flex items-center gap-1 text-[10px] text-emerald-600 hover:text-emerald-700 font-black uppercase tracking-wider"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-300 animate-pulse" />
                      <span>BUAT RAPOR</span>
                    </button>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-[9px] text-slate-400 font-bold">
                    {new Date(student.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    })}
                  </span>
                  <div className="flex items-center gap-2">
                    {student.deskripsiAi && (
                      <button
                        onClick={() => onSelectStudentForReport(student)}
                        className="flex items-center gap-1 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                        title="Edit Deskripsi Rapor AI"
                      >
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        <span>Edit Rapor</span>
                      </button>
                    )}
                    <button
                      onClick={() => openEditForm(student)}
                      className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-xl transition-all border border-slate-200"
                      title="Edit Nilai"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(student.id, student.nama)}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-500 hover:text-rose-700 rounded-xl transition-all border border-rose-200/50"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Form Dialog Modal */}
      {isFormOpen && (
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <form
            onSubmit={handleSubmit}
            className="w-full sm:max-w-md bg-white rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl border-t-4 sm:border-4 border-emerald-100 overflow-hidden flex flex-col max-h-[90%] animate-in slide-in-from-bottom duration-200"
          >
            {/* Modal Header */}
            <div className="bg-emerald-600 text-white px-5 py-4 flex items-center justify-between shadow-md">
              <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
                {editingId ? <Edit2 className="w-4 h-4 stroke-[2.5px]" /> : <Plus className="w-4 h-4 stroke-[2.5px]" />}
                <span>{editingId ? "Edit Nilai Siswa" : "Input Nilai Siswa"}</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="text-white hover:bg-white/10 p-1.5 rounded-full transition-all"
              >
                <X className="w-4 h-4 stroke-[2.5px]" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto bg-white">
              {/* Nama Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-emerald-700 uppercase block mb-1">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Muhammad Rizky"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-xs focus:border-emerald-400 focus:bg-white outline-none transition-all text-slate-700 font-medium"
                />
              </div>

              {/* Kelas & Nilai Grid */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-emerald-700 uppercase block mb-1">Kelas</label>
                  <select
                    value={kelas}
                    onChange={(e) => setKelas(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-xs focus:border-emerald-400 focus:bg-white outline-none transition-all text-slate-700 font-bold"
                  >
                    {MADRASAH_CLASSES.map((cls) => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-emerald-700 uppercase block mb-1">Nilai Akhir (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={nilai}
                    onChange={(e) => setNilai(Number(e.target.value))}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-xs focus:border-emerald-400 focus:bg-white outline-none transition-all text-slate-800 font-black text-center"
                  />
                </div>
              </div>

              {/* Subjek (Mata Pelajaran) */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-emerald-700 uppercase block mb-1">Mata Pelajaran (Subjek)</label>
                <select
                  value={subjek}
                  onChange={(e) => setSubjek(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-xs focus:border-emerald-400 focus:bg-white outline-none transition-all text-slate-700 font-bold"
                >
                  {MADRASAH_SUBJECTS.map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              {/* Deskripsi Rapor AI (Optional) */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-emerald-700 uppercase block mb-1 flex items-center justify-between">
                  <span>Catatan Perkembangan</span>
                  {editingId && (
                    <span className="text-[8px] text-emerald-600 font-black italic">Bisa di-AI otomatis</span>
                  )}
                </label>
                <textarea
                  placeholder="Catatan perkembangan belajar siswa..."
                  value={deskripsiAi}
                  onChange={(e) => setDeskripsiAi(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-xs focus:border-emerald-400 focus:bg-white outline-none transition-all resize-none text-slate-700"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-5 py-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2.5 bg-white border-2 border-slate-100 hover:bg-slate-100 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-wider transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-200 transition-all flex items-center gap-1.5"
              >
                {loading ? "Menyimpan..." : "Simpan Data"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
