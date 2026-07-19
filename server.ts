import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";

dotenv.config();

const app = express();
const PORT = 3000;

// Body parser
app.use(express.json());

// Path for storing students data
const DATA_FILE = path.join(process.cwd(), "students.json");

interface Student {
  id: string;
  nama: string;
  kelas: string;
  nilai: number;
  subjek?: string; // e.g. Al-Qur'an Hadits, Fiqih, Akidah Akhlak, Sejarah Kebudayaan Islam, Matematika, dll.
  deskripsiAi?: string;
  createdAt: string;
}

// Sample student data to populate if file does not exist
const sampleStudents: Student[] = [
  {
    id: "stu_1",
    nama: "Ahmad Fauzi",
    kelas: "7A",
    nilai: 88,
    subjek: "Akidah Akhlak",
    deskripsiAi: "Ahmad menunjukkan akhlak yang mulia dan pemahaman yang sangat baik dalam materi Akidah Akhlak. Ia selalu antusias mengikuti kegiatan kelas dan menghargai sesama teman. Pertahankan prestasimu!",
    createdAt: new Date().toISOString()
  },
  {
    id: "stu_2",
    nama: "Siti Aminah",
    kelas: "7A",
    nilai: 95,
    subjek: "Al-Qur'an Hadits",
    deskripsiAi: "Siti memiliki kemampuan hafalan dan pemahaman Al-Qur'an Hadits yang luar biasa. Tajwid dan makhrajnya sangat baik serta selalu berpartisipasi aktif dalam diskusi kelas. Sangat membanggakan!",
    createdAt: new Date().toISOString()
  },
  {
    id: "stu_3",
    nama: "Yusuf Mansur",
    kelas: "7B",
    nilai: 72,
    subjek: "Fiqih",
    deskripsiAi: "Yusuf cukup memahami tata cara ibadah praktis. Namun, Yusuf perlu meningkatkan kedisiplinan belajar dan lebih fokus menyimak penjelasan materi agar pemahamannya lebih mantap pada ujian berikutnya.",
    createdAt: new Date().toISOString()
  },
  {
    id: "stu_4",
    nama: "Fatimah Azzahra",
    kelas: "7B",
    nilai: 84,
    subjek: "Sejarah Kebudayaan Islam",
    deskripsiAi: "Fatimah menunjukkan ketertarikan yang baik dalam meneladani sejarah perjuangan Islam. Ia mampu menceritakan kembali peristiwa penting dengan runtut. Pertahankan semangat belajarmu!",
    createdAt: new Date().toISOString()
  }
];

// Helper to read students
function readStudents(): Student[] {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(sampleStudents, null, 2), "utf-8");
      return sampleStudents;
    }
    const data = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading student data file:", err);
    return [];
  }
}

// Helper to write students
function writeStudents(students: Student[]) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(students, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing student data file:", err);
  }
}

// Initialize Gemini Client
// Using the recommended @google/genai SDK with the user-agent telemetry header
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("WARNING: GEMINI_API_KEY is not defined. AI features will be unavailable.");
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
};

// API Endpoints

// Get all students
app.get("/api/students", (req, res) => {
  const students = readStudents();
  res.json(students);
});

// Add a student
app.post("/api/students", (req, res) => {
  const { nama, kelas, nilai, subjek, deskripsiAi } = req.body;
  
  if (!nama || !kelas || nilai === undefined) {
    return res.status(400).json({ error: "Nama, kelas, dan nilai wajib diisi" });
  }

  const students = readStudents();
  const newStudent: Student = {
    id: `stu_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    nama,
    kelas,
    nilai: Number(nilai),
    subjek: subjek || "Umum",
    deskripsiAi: deskripsiAi || "",
    createdAt: new Date().toISOString()
  };

  students.push(newStudent);
  writeStudents(students);
  res.status(201).json(newStudent);
});

// Update student
app.put("/api/students/:id", (req, res) => {
  const { id } = req.params;
  const { nama, kelas, nilai, subjek, deskripsiAi } = req.body;

  const students = readStudents();
  const index = students.findIndex(s => s.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Siswa tidak ditemukan" });
  }

  students[index] = {
    ...students[index],
    nama: nama !== undefined ? nama : students[index].nama,
    kelas: kelas !== undefined ? kelas : students[index].kelas,
    nilai: nilai !== undefined ? Number(nilai) : students[index].nilai,
    subjek: subjek !== undefined ? subjek : students[index].subjek,
    deskripsiAi: deskripsiAi !== undefined ? deskripsiAi : students[index].deskripsiAi
  };

  writeStudents(students);
  res.json(students[index]);
});

// Delete student
app.delete("/api/students/:id", (req, res) => {
  const { id } = req.params;
  const students = readStudents();
  const filtered = students.filter(s => s.id !== id);

  if (students.length === filtered.length) {
    return res.status(404).json({ error: "Siswa tidak ditemukan" });
  }

  writeStudents(filtered);
  res.json({ success: true, message: "Siswa berhasil dihapus" });
});

// Gemini AI Route
app.post("/api/gemini/generate", async (req, res) => {
  const { action, prompt, studentName, studentGrade, studentSubject, studentClass } = req.body;

  const ai = getGeminiClient();
  if (!ai) {
    return res.status(503).json({ 
      error: "Sistem AI (Gemini) belum terkonfigurasi. Silakan tambahkan GEMINI_API_KEY di menu Secrets." 
    });
  }

  try {
    let systemInstruction = "Anda adalah asisten AI guru Madrasah profesional yang santun, inspiratif, dan mahir menyusun laporan akademik (raport) berbasis Kurikulum Merdeka dan KTSP Madrasah.";
    let finalPrompt = prompt;

    if (action === "raport_desc") {
      systemInstruction = `Anda adalah seorang Guru Madrasah teladan. Tugas Anda adalah membuat deskripsi raport perkembangan belajar siswa yang objektif, mendidik, santun, dan memotivasi orang tua serta siswa.
Format output harus langsung berupa teks deskripsi rapor akhir paragraf yang siap disalin (tanpa kata pembuka buatan atau penjelasan tambahan).
Gunakan bahasa Indonesia yang baku, ramah, dan mendidik.
Sebutkan nama mata pelajaran atau subjek jika disediakan.`;

      finalPrompt = `Buatkan deskripsi raport singkat (2-3 kalimat) untuk siswa berikut:
Nama Siswa: ${studentName}
Mata Pelajaran: ${studentSubject || "Umum"}
Kelas: ${studentClass || "-"}
Nilai Akhir: ${studentGrade}

Panduan Kategori Nilai:
- Nilai 90-100 (Sangat Baik): Berikan pujian konkret tentang pencapaian luar biasa mereka dan dorong mereka untuk terus menginspirasi yang lain atau menjaga konsistensi.
- Nilai 80-89 (Baik): Berikan apresiasi atas pencapaian yang solid, sebutkan beberapa kelebihan mereka, dan berikan tips ringan untuk menyempurnakan kemampuan.
- Nilai 70-79 (Cukup): Berikan apresiasi atas usahanya, sebutkan materi yang cukup dipahami, lalu sampaikan area yang perlu ditingkatkan secara ramah dan memotivasi.
- Nilai di bawah 70 (Perlu Bimbingan): Sampaikan dengan sangat santun, tekankan potensi siswa, fokus pada semangat perbaikan, berikan dorongan kuat, dan ajak bekerjasama demi kemajuan belajar siswa.`;
    } else if (action === "lesson_plan") {
      systemInstruction = "Anda adalah ahli kurikulum Madrasah profesional. Bantu guru menyusun ide mengajar kreatif, interaktif, dan Islami (mengintegrasikan nilai moral/akhlak mulia).";
      finalPrompt = `Buatkan ide mengajar kreatif, rencana pembelajaran singkat (RPP singkat), atau aktivitas kelas interaktif untuk topik/pertanyaan berikut:
Topik/Permintaan: "${prompt}"

Format yang rapi dengan poin-poin yang mudah dibaca meliputi:
1. Tujuan Pembelajaran Ringkas
2. Aktivitas Pembuka (Apersepsi Islami / Ice Breaking)
3. Aktivitas Inti (Interaktif & Menyenangkan)
4. Refleksi & Penanaman Nilai Akhlak Mulia
5. Tips untuk Guru`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: finalPrompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7
      }
    });

    const text = response.text;
    res.json({ text });
  } catch (err: any) {
    console.error("Gemini API Error:", err);
    res.status(500).json({ 
      error: "Gagal memproses permintaan AI: " + (err.message || err.toString()) 
    });
  }
});

// Serve static assets or use Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
    console.log("Using Vite development middleware");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static files from dist/");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
