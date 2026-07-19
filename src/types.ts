export interface Student {
  id: string;
  nama: string;
  kelas: string;
  nilai: number;
  subjek?: string;
  deskripsiAi?: string;
  createdAt: string;
}

export const MADRASAH_SUBJECTS = [
  "Al-Qur'an Hadits",
  "Fiqih",
  "Akidah Akhlak",
  "Sejarah Kebudayaan Islam (SKI)",
  "Bahasa Arab",
  "Bahasa Indonesia",
  "Matematika",
  "IPA",
  "IPS",
  "Pendidikan Pancasila / PKn",
  "Seni Budaya & Prakarya",
  "PJOK",
  "Umum"
];

export const MADRASAH_CLASSES = [
  "Kelas 1", "Kelas 2", "Kelas 3", "Kelas 4", "Kelas 5", "Kelas 6",
  "7A", "7B", "7C", "8A", "8B", "8C", "9A", "9B", "9C",
  "10-MIA", "10-IIS", "11-MIA", "11-IIS", "12-MIA", "12-IIS"
];
