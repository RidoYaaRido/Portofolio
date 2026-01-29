# 🚀 Setup Guide - Portfolio Full-Stack

Panduan lengkap step-by-step untuk menjalankan aplikasi portfolio.

## 📋 Checklist Persiapan

- [ ] Node.js terinstall (v16+)
- [ ] MongoDB terinstall atau MongoDB Atlas account
- [ ] Text editor (VS Code recommended)
- [ ] Terminal/Command Prompt

## 🔧 Setup Step-by-Step

### Step 1: Extract Project

Extract file zip ke folder yang Anda inginkan, misal: `D:/portfolio-fullstack`

### Step 2: Install Dependencies Backend

```bash
cd portfolio-fullstack/server
npm install
```

Tunggu hingga semua package terinstall.

### Step 3: Konfigurasi Database

#### Opsi A: MongoDB Local

1. Install MongoDB Community Edition
2. Jalankan MongoDB service
3. Database akan otomatis dibuat saat aplikasi pertama kali dijalankan

#### Opsi B: MongoDB Atlas (Cloud)

1. Buat account di [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Buat cluster (free tier tersedia)
3. Buat database user
4. Whitelist IP address (0.0.0.0/0 untuk development)
5. Dapatkan connection string

### Step 4: Setup Environment Variables

Edit file `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/portfolio
# Atau untuk MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/portfolio
JWT_SECRET=ganti_dengan_string_random_yang_panjang_dan_aman
NODE_ENV=development
```

**⚠️ IMPORTANT**: Ganti `JWT_SECRET` dengan string random, misal:
```
JWT_SECRET=mY_sUp3r_S3cR3t_K3y_2024_p0rtf0li0_@pp
```

### Step 5: Install Dependencies Frontend

```bash
cd ../client
npm install
```

### Step 6: Jalankan Backend

Buka terminal baru, jalankan:

```bash
cd server
npm run dev
```

Anda akan melihat:
```
🚀 Server running on port 5000
✅ MongoDB connected successfully
```

### Step 7: Jalankan Frontend

Buka terminal baru lagi, jalankan:

```bash
cd client
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

### Step 8: Buat Admin User

Gunakan salah satu cara berikut:

#### Cara 1: Menggunakan cURL (di terminal)

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","email":"admin@example.com","password":"admin123","role":"admin"}'
```

#### Cara 2: Menggunakan Postman

1. Install Postman
2. Buat request baru:
   - Method: POST
   - URL: `http://localhost:5000/api/auth/register`
   - Body (raw JSON):
   ```json
   {
     "username": "admin",
     "email": "admin@example.com",
     "password": "admin123",
     "role": "admin"
   }
   ```
3. Click Send

#### Cara 3: Menggunakan Thunder Client (VS Code Extension)

1. Install extension "Thunder Client" di VS Code
2. Buat New Request
3. Set method POST, URL: `http://localhost:5000/api/auth/register`
4. Di Body, pilih JSON dan paste:
   ```json
   {
     "username": "admin",
     "email": "admin@example.com",
     "password": "admin123",
     "role": "admin"
   }
   ```
5. Click Send

### Step 9: Login ke Admin Dashboard

1. Buka browser: `http://localhost:3000/login`
2. Login dengan:
   - Email: `admin@example.com`
   - Password: `admin123`
3. Anda akan diarahkan ke dashboard admin

### Step 10: Mulai Mengelola Portfolio

Sekarang Anda bisa:
- ✅ Tambah/edit projects
- ✅ Tambah/edit skills
- ✅ Tambah/edit testimonials
- ✅ Update profile

## 🎯 Testing the Application

### Test Portfolio Public Page
Buka `http://localhost:3000` untuk melihat portfolio public page.

### Test Admin Features
1. Login ke admin dashboard
2. Coba tambah project baru
3. Coba tambah skill baru
4. Cek hasilnya di public page

## 🐛 Common Issues & Solutions

### Issue 1: MongoDB Connection Failed

**Error**: `MongoDB connection error`

**Solution**:
- Pastikan MongoDB service running
- Cek `MONGODB_URI` di `.env`
- Untuk Atlas: cek username, password, dan whitelist IP

### Issue 2: Port Already in Use

**Error**: `Port 5000 is already in use`

**Solution**:
- Ganti PORT di `.env` menjadi 5001 atau port lain
- Atau kill process di port 5000:
  ```bash
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  
  # Linux/Mac
  lsof -i :5000
  kill -9 <PID>
  ```

### Issue 3: Cannot Login

**Solution**:
- Pastikan admin user sudah dibuat (Step 8)
- Cek console browser untuk error messages
- Cek backend terminal untuk error logs

### Issue 4: Images Not Showing

**Solution**:
- Pastikan folder `server/uploads` ada
- Cek permission folder
- Restart backend server

### Issue 5: Dependencies Installation Error

**Solution**:
```bash
# Hapus node_modules dan package-lock.json
rm -rf node_modules package-lock.json

# Install ulang
npm install
```

## 📱 Next Steps

Setelah setup berhasil, Anda bisa:

1. **Kustomisasi Design**
   - Edit file CSS di `client/src/assets/css/`
   - Ubah color scheme di `index.css`

2. **Tambah Fitur**
   - Tambah model baru di `server/models/`
   - Buat route baru di `server/routes/`
   - Buat page baru di `client/src/pages/`

3. **Deploy ke Production**
   - Backend: Deploy ke Heroku, Railway, atau DigitalOcean
   - Frontend: Deploy ke Vercel, Netlify, atau Cloudflare Pages
   - Database: MongoDB Atlas (recommended)

## 🔐 Security Checklist untuk Production

- [ ] Ganti JWT_SECRET dengan string yang sangat kuat
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS
- [ ] Set CORS origin ke domain spesifik
- [ ] Buat strong password untuk admin
- [ ] Regular backup database
- [ ] Update dependencies secara berkala

## 📞 Need Help?

Jika masih ada masalah:
1. Cek error message di console browser
2. Cek error log di terminal backend
3. Pastikan semua step diikuti dengan benar
4. Cek file `.env` sudah dikonfigurasi dengan benar

---

**Selamat! Aplikasi portfolio Anda sudah siap digunakan! 🎉**
