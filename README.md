# Portfolio Full-Stack Application

Portfolio website dengan admin dashboard untuk mengelola projects, skills, testimonials, dan profile. Dibangun dengan **React + Vite** untuk frontend dan **Express + MongoDB** untuk backend.

## 🚀 Features

### Frontend (React + Vite)
- ✨ Modern UI dengan responsive design
- 🎨 Portfolio public page untuk menampilkan projects dan skills
- 🔐 Admin authentication system
- 📊 Admin dashboard dengan:
  - Projects management (CRUD)
  - Skills management (CRUD)
  - Testimonials management (CRUD)
  - Profile management
- 🖼️ Image upload support
- 📱 Mobile-friendly design

### Backend (Express + MongoDB)
- 🔒 JWT authentication
- 📝 RESTful API endpoints
- 💾 MongoDB database
- 📤 File upload dengan Multer
- 🛡️ Role-based access control (Admin)
- ✅ Input validation

## 📋 Prerequisites

Pastikan Anda sudah menginstall:
- Node.js (v16 atau lebih tinggi)
- MongoDB (bisa local atau cloud seperti MongoDB Atlas)
- npm atau yarn

## 🔧 Installation

### 1. Clone atau Extract Project

```bash
cd portfolio-fullstack
```

### 2. Setup Backend

```bash
cd server
npm install
```

Edit file `.env` dengan konfigurasi Anda:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/portfolio
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

**PENTING**: Ganti `JWT_SECRET` dengan string random yang aman!

### 3. Setup Frontend

```bash
cd ../client
npm install
```

## 🏃 Running the Application

### Jalankan Backend (Terminal 1)

```bash
cd server
npm run dev
```

Server akan berjalan di `http://localhost:5000`

### Jalankan Frontend (Terminal 2)

```bash
cd client
npm run dev
```

Client akan berjalan di `http://localhost:3000`

## 👤 Creating Admin User

Setelah server berjalan, buat admin user pertama dengan mengirim POST request ke:

**Endpoint**: `POST http://localhost:5000/api/auth/register`

**Body** (JSON):
```json
{
  "username": "admin",
  "email": "admin@example.com",
  "password": "admin123",
  "role": "admin"
}
```

Anda bisa menggunakan:
- Postman
- cURL
- Thunder Client (VS Code extension)
- Atau tools API testing lainnya

**cURL Example**:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "admin123",
    "role": "admin"
  }'
```

## 🔑 Login to Admin Dashboard

1. Buka `http://localhost:3000/login`
2. Gunakan credentials yang Anda buat:
   - Email: `admin@example.com`
   - Password: `admin123`

## 📁 Project Structure

```
portfolio-fullstack/
├── server/                 # Backend Express
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Auth & upload middleware
│   ├── uploads/           # Uploaded files
│   ├── server.js          # Main server file
│   └── package.json
│
└── client/                # Frontend React
    ├── src/
    │   ├── components/    # React components
    │   ├── pages/         # Page components
    │   ├── context/       # Auth context
    │   ├── services/      # API services
    │   ├── assets/        # CSS files
    │   └── App.jsx
    ├── index.html
    └── package.json
```

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create project (admin only)
- `PUT /api/projects/:id` - Update project (admin only)
- `DELETE /api/projects/:id` - Delete project (admin only)

### Skills
- `GET /api/skills` - Get all skills
- `GET /api/skills/:id` - Get single skill
- `POST /api/skills` - Create skill (admin only)
- `PUT /api/skills/:id` - Update skill (admin only)
- `DELETE /api/skills/:id` - Delete skill (admin only)

### Testimonials
- `GET /api/testimonials` - Get all testimonials
- `POST /api/testimonials` - Create testimonial (admin only)
- `PUT /api/testimonials/:id` - Update testimonial (admin only)
- `DELETE /api/testimonials/:id` - Delete testimonial (admin only)

### Profile
- `GET /api/profile` - Get profile
- `POST /api/profile` - Create/Update profile (admin only)

## 🎨 Tech Stack

### Frontend
- React 18
- Vite
- React Router DOM
- Axios
- React Icons
- React Toastify

### Backend
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing
- Multer for file uploads
- CORS

## 📝 Usage Guide

### Adding a Project
1. Login to admin dashboard
2. Navigate to "Projects" menu
3. Click "Add Project" button
4. Fill in the form:
   - Title
   - Category (Web Development, Web Design, Applications, Mobile App)
   - Description
   - Technologies (comma-separated)
   - Project URL (optional)
   - GitHub URL (optional)
   - Image (required)
   - Featured checkbox
5. Click "Save"

### Adding a Skill
1. Navigate to "Skills" menu
2. Click "Add Skill" button
3. Fill in the form:
   - Name
   - Category (Frontend, Backend, Database, Tools, Other)
   - Level (0-100)
   - Icon (emoji atau icon name)
   - Description
   - Order (untuk sorting)
4. Click "Save"

### Managing Profile
1. Navigate to "Profile" menu
2. Update your information:
   - Basic info (name, title, email, phone, etc.)
   - Bio
   - Avatar
   - Social media links
3. Click "Save Profile"

## 🔒 Security Notes

- **PRODUCTION**: Ganti `JWT_SECRET` dengan string random yang kuat
- Jangan commit file `.env` ke repository
- Gunakan HTTPS di production
- Set strong password untuk admin user
- Regular update dependencies untuk security patches

## 🐛 Troubleshooting

### MongoDB Connection Error
- Pastikan MongoDB sudah running
- Cek `MONGODB_URI` di file `.env`
- Untuk MongoDB Atlas, pastikan IP whitelist sudah diatur

### Port Already in Use
- Ganti PORT di `.env` (backend) atau `vite.config.js` (frontend)
- Atau kill process yang menggunakan port tersebut

### Image Upload Error
- Pastikan folder `server/uploads` ada
- Cek permission folder uploads
- Max file size: 5MB

## 📞 Support

Jika ada pertanyaan atau issue, silakan buat issue di repository atau hubungi developer.

## 📄 License

MIT License - feel free to use this project for your portfolio!

---

**Happy Coding! 🚀**
