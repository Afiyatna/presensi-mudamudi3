# Komponen Loading untuk Presensi Mudamudi

Dokumentasi ini menjelaskan komponen loading yang telah ditambahkan ke project untuk memberikan pengalaman pengguna yang lebih baik saat perpindahan halaman dan loading data.

## Komponen yang Tersedia

### 1. LoadingSpinner
Komponen spinner loading utama yang ditampilkan saat perpindahan halaman.

**Fitur:**
- Spinner animasi yang menarik
- Background overlay dengan blur effect
- Teks loading dengan animasi dots
- Pesan subtitle dalam bahasa Indonesia

**Penggunaan:**
```jsx
import LoadingSpinner from './components/LoadingSpinner';

// Otomatis digunakan oleh PageTransition
```

### 2. DataLoadingSpinner
Komponen spinner untuk loading data di dalam halaman.

**Fitur:**
- Spinner yang lebih kecil
- Dapat dikustomisasi pesannya
- Tidak menggunakan overlay fullscreen

**Penggunaan:**
```jsx
import DataLoadingSpinner from './components/DataLoadingSpinner';

// Dalam komponen
if (isLoading) {
  return <DataLoadingSpinner message="Memuat data..." />;
}
```

### 3. PageTransition
Komponen wrapper yang menangani loading state saat perpindahan halaman.

**Fitur:**
- Otomatis mendeteksi perpindahan halaman
- Menampilkan LoadingSpinner saat transisi
- Tidak menampilkan loading untuk navigasi back/forward
- Efek opacity pada konten selama loading

**Penggunaan:**
```jsx
import PageTransition from './components/PageTransition';

// Di App.jsx
<PageTransition>
  <Routes>
    {/* routes */}
  </Routes>
</PageTransition>
```

### 4. usePageLoading Hook
Custom hook untuk menangani loading state perpindahan halaman.

**Penggunaan:**
```jsx
import { usePageLoading } from './hooks/usePageLoading';

function MyComponent() {
  const isLoading = usePageLoading();
  
  return (
    <div>
      {isLoading && <LoadingSpinner />}
      {/* konten */}
    </div>
  );
}
```

## Implementasi

### 1. Loading Saat Perpindahan Halaman
Sudah diimplementasikan di `App.jsx` dengan membungkus `Routes` dengan `PageTransition`.

### 2. Loading Data di Halaman
Contoh implementasi di `Dashboard.jsx`:
```jsx
if (userLoading) {
  return <DataLoadingSpinner message="Memuat data dashboard..." />;
}
```

## Kustomisasi

### Mengubah Durasi Loading
Edit file `src/hooks/usePageLoading.js`:
```jsx
const timer = setTimeout(() => {
  setIsLoading(false);
}, 500); // Ubah nilai 500 untuk mengubah durasi (dalam milidetik)
```

### Mengubah Style Spinner
Edit file `src/components/LoadingSpinner.jsx` atau `src/components/DataLoadingSpinner.jsx` untuk mengubah:
- Warna spinner
- Ukuran spinner
- Pesan loading
- Background overlay

### Menambahkan Loading di Halaman Lain
1. Import DataLoadingSpinner
2. Tambahkan state loading
3. Tampilkan spinner saat loading

```jsx
import DataLoadingSpinner from '../components/DataLoadingSpinner';

function MyPage() {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Fetch data
    fetchData().finally(() => setIsLoading(false));
  }, []);
  
  if (isLoading) {
    return <DataLoadingSpinner message="Memuat data..." />;
  }
  
  return (
    // konten halaman
  );
}
```

## Catatan Teknis

- Loading spinner menggunakan Tailwind CSS untuk styling
- Animasi menggunakan CSS classes bawaan Tailwind
- Komponen responsive dan mendukung dark mode
- Tidak mempengaruhi performa aplikasi secara signifikan
- Compatible dengan React Router v7 