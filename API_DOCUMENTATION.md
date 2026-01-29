# 📚 API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

### Register User
**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "username": "admin",
  "email": "admin@example.com",
  "password": "admin123",
  "role": "admin"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65abc123...",
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

### Login
**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65abc123...",
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

### Get Current User
**Endpoint:** `GET /auth/me`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "id": "65abc123...",
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

---

## Projects

### Get All Projects
**Endpoint:** `GET /projects`

**Query Parameters:**
- `category` (optional): Filter by category
- `featured` (optional): Filter featured projects (true/false)

**Response:**
```json
[
  {
    "_id": "65abc123...",
    "title": "E-Commerce Website",
    "category": "web development",
    "image": "/uploads/project-123456.jpg",
    "description": "Full-stack e-commerce platform",
    "technologies": ["React", "Node.js", "MongoDB"],
    "projectUrl": "https://example.com",
    "githubUrl": "https://github.com/user/project",
    "featured": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

### Get Single Project
**Endpoint:** `GET /projects/:id`

**Response:**
```json
{
  "_id": "65abc123...",
  "title": "E-Commerce Website",
  "category": "web development",
  "image": "/uploads/project-123456.jpg",
  "description": "Full-stack e-commerce platform",
  "technologies": ["React", "Node.js", "MongoDB"],
  "projectUrl": "https://example.com",
  "githubUrl": "https://github.com/user/project",
  "featured": true,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### Create Project (Admin Only)
**Endpoint:** `POST /projects`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `title` (required): string
- `category` (required): string
- `description` (required): string
- `technologies`: string (comma-separated)
- `projectUrl`: string
- `githubUrl`: string
- `featured`: boolean
- `image` (required): file

**Response:**
```json
{
  "message": "Project created successfully",
  "project": {
    "_id": "65abc123...",
    "title": "E-Commerce Website",
    ...
  }
}
```

### Update Project (Admin Only)
**Endpoint:** `PUT /projects/:id`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:** (same as create, but image is optional)

**Response:**
```json
{
  "message": "Project updated successfully",
  "project": {
    "_id": "65abc123...",
    ...
  }
}
```

### Delete Project (Admin Only)
**Endpoint:** `DELETE /projects/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Project deleted successfully"
}
```

---

## Skills

### Get All Skills
**Endpoint:** `GET /skills`

**Query Parameters:**
- `category` (optional): Filter by category

**Response:**
```json
[
  {
    "_id": "65abc123...",
    "name": "React",
    "category": "frontend",
    "level": 90,
    "icon": "⚛️",
    "description": "Building modern web applications",
    "order": 1,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]
```

### Get Single Skill
**Endpoint:** `GET /skills/:id`

**Response:** (same structure as array item above)

### Create Skill (Admin Only)
**Endpoint:** `POST /skills`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "React",
  "category": "frontend",
  "level": 90,
  "icon": "⚛️",
  "description": "Building modern web applications",
  "order": 1
}
```

**Response:**
```json
{
  "message": "Skill created successfully",
  "skill": {
    "_id": "65abc123...",
    ...
  }
}
```

### Update Skill (Admin Only)
**Endpoint:** `PUT /skills/:id`

**Headers:** (same as create)

**Request Body:** (same as create)

**Response:**
```json
{
  "message": "Skill updated successfully",
  "skill": {
    "_id": "65abc123...",
    ...
  }
}
```

### Delete Skill (Admin Only)
**Endpoint:** `DELETE /skills/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Skill deleted successfully"
}
```

---

## Testimonials

### Get All Testimonials
**Endpoint:** `GET /testimonials`

**Query Parameters:**
- `featured` (optional): Filter featured testimonials (true/false)

**Response:**
```json
[
  {
    "_id": "65abc123...",
    "name": "John Doe",
    "avatar": "/uploads/avatar-123456.jpg",
    "position": "CEO at Company",
    "testimonial": "Excellent work! Highly recommended.",
    "rating": 5,
    "featured": true,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]
```

### Create Testimonial (Admin Only)
**Endpoint:** `POST /testimonials`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `name` (required): string
- `position` (required): string
- `testimonial` (required): string
- `rating`: number (1-5)
- `featured`: boolean
- `avatar` (required): file

**Response:**
```json
{
  "message": "Testimonial created successfully",
  "testimonial": {
    "_id": "65abc123...",
    ...
  }
}
```

### Update Testimonial (Admin Only)
**Endpoint:** `PUT /testimonials/:id`

**Headers:** (same as create)

**Form Data:** (same as create, but avatar is optional)

**Response:**
```json
{
  "message": "Testimonial updated successfully",
  "testimonial": {
    "_id": "65abc123...",
    ...
  }
}
```

### Delete Testimonial (Admin Only)
**Endpoint:** `DELETE /testimonials/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Testimonial deleted successfully"
}
```

---

## Profile

### Get Profile
**Endpoint:** `GET /profile`

**Response:**
```json
{
  "_id": "65abc123...",
  "name": "John Doe",
  "title": "Full-Stack Developer",
  "avatar": "/uploads/avatar-123456.jpg",
  "email": "john@example.com",
  "phone": "+1234567890",
  "birthday": "January 1, 1990",
  "location": "New York, USA",
  "bio": "Passionate developer with 5+ years experience",
  "social": {
    "linkedin": "https://linkedin.com/in/johndoe",
    "github": "https://github.com/johndoe",
    "twitter": "https://twitter.com/johndoe",
    "instagram": "https://instagram.com/johndoe"
  },
  "resumeUrl": "https://example.com/resume.pdf",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### Create/Update Profile (Admin Only)
**Endpoint:** `POST /profile`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `name` (required): string
- `title` (required): string
- `email` (required): string
- `phone`: string
- `birthday`: string
- `location`: string
- `bio`: string
- `linkedin`: string
- `github`: string
- `twitter`: string
- `instagram`: string
- `resumeUrl`: string
- `avatar`: file (optional if updating)

**Response:**
```json
{
  "message": "Profile updated successfully",
  "profile": {
    "_id": "65abc123...",
    ...
  }
}
```

---

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request
```json
{
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "message": "No authentication token, access denied"
}
```

### 403 Forbidden
```json
{
  "message": "Access denied. Admin only."
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Error message",
  "error": "Error details"
}
```

---

## Testing with cURL

### Example: Create Project
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "title=My Project" \
  -F "category=web development" \
  -F "description=This is my project" \
  -F "technologies=React,Node.js" \
  -F "featured=true" \
  -F "image=@/path/to/image.jpg"
```

### Example: Get All Projects
```bash
curl http://localhost:5000/api/projects
```

### Example: Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

---

## Rate Limiting

No rate limiting currently implemented. Consider adding in production.

## CORS

CORS is enabled for all origins in development. Configure appropriately for production.

## File Upload Limits

- Max file size: 5MB
- Allowed file types: .jpg, .jpeg, .png, .gif, .webp
