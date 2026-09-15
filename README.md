# TaskFlow AI

TaskFlow AI is a full-stack team operations and project management SaaS application built for practical team collaboration and productivity.

It combines project management, task tracking, team collaboration, notifications, activity history, file attachments, and AI-powered productivity tools in one application.

## Tech Stack

### Frontend
- React
- React Router
- Tailwind CSS
- Axios
- JavaScript

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT authentication using HTTP-only cookies
- Joi validation
- Multer for file uploads
- Cloudinary for file storage
- Groq API for AI features

## Main Features

### Authentication
- User registration
- User login
- User logout
- Current-user authentication
- Protected routes
- HTTP-only JWT authentication

### Dashboard
- Project overview
- Task statistics
- Productivity information
- Recent activity
- Notifications

### Projects
- Create projects
- View projects
- Search/filter projects
- View project details
- Update projects
- Delete projects
- Project members
- Project task statistics

### Tasks
- Create tasks
- View tasks
- Update tasks
- Delete tasks
- Assign tasks
- Change task status
- Set priority
- Set due dates
- Add tags
- Search and filter tasks
- Task details
- Task attachments

### Collaboration
- Team/workspace management
- Add workspace members
- Change member roles
- Remove members
- Task comments
- Edit/delete own comments
- Activity history
- Notifications

### File Uploads
- Upload multiple task attachments
- Delete task attachments
- Upload profile avatars
- Cloudinary storage
- File type and size validation

### AI Assistant
TaskFlow AI includes five AI productivity tools:

1. Generate Task
2. Generate Task Description
3. Summarize Project
4. Convert Meeting Notes into Tasks
5. Ask Project Assistant

AI requests are handled by the backend through the Groq API.

## Project Structure

```text
TaskFlow-AI/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── validations/
│   │   ├── utils/
│   │   └── app.js
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── .env
│   └── package.json
│
├── README.md
└── API_DOCUMENTATION.md
```

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd TaskFlow-AI
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Install frontend dependencies

```bash
cd ../frontend
npm install
```

## Environment Variables

### Backend

Create:

```text
backend/.env
```

Example:

```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

GROQ_API_KEY=your_groq_api_key

CLIENT_URL=http://localhost:5173
```

Use the exact variable names expected by your backend configuration if they differ.

Never commit `.env` files or API keys to Git.

### Frontend

Create:

```text
frontend/.env
```

Example:

```env
VITE_API_URL=http://localhost:5001/api
```

## Running the Application

### Start backend

```bash
cd backend
npm run dev
```

The backend runs on:

```text
http://localhost:5001
```

### Start frontend

Open another terminal:

```bash
cd frontend
npm run dev
```

The frontend normally runs on:

```text
http://localhost:5173
```

## Authentication

TaskFlow AI uses JWT authentication stored in an HTTP-only cookie.

The frontend does not store the JWT in localStorage.

Authentication flow:

```text
Register/Login
      ↓
Backend creates JWT
      ↓
JWT stored in HTTP-only cookie
      ↓
Protected API requests
      ↓
Backend validates JWT
      ↓
Authenticated user available through req.user
```

## Authorization

TaskFlow AI uses role-based permissions where required.

Workspace roles:

- Owner
- Admin
- Manager
- Member

Permissions are enforced by backend services and controllers rather than relying only on frontend restrictions.

## API

The backend API is available under:

```text
/api
```

For the complete endpoint reference, see:

```text
API_DOCUMENTATION.md
```

## API Response Format

Successful responses generally follow the application's `ApiResponse` structure.

Example:

```json
{
  "statusCode": 200,
  "data": {},
  "message": "Request successful",
  "success": true
}
```

Error responses use the application's centralized error-handling structure.

Example:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "success": false
}
```

## Frontend Pages

Public pages:

- `/login`
- `/signup`
- `/guide`

Protected pages include:

- `/dashboard`
- `/projects`
- `/projects/:id`
- `/tasks`
- `/tasks/:id`
- `/team`
- `/activity`
- `/notifications`
- `/ai`
- `/settings`

## Security

The project includes several production-oriented security practices:

- HTTP-only authentication cookies
- Protected API routes
- Backend authorization
- Request validation
- Centralized error handling
- Rate limiting
- Password hashing
- File type validation
- File size limits
- Environment variables for secrets
- Backend ownership/membership checks

## File Uploads

Task attachments are uploaded through:

```text
POST /api/uploads/multiple
```

The backend uses Multer for multipart form handling and Cloudinary for cloud storage.

Task attachment uploads support a limited set of file types and a maximum of 5 files per upload request.

Profile avatars are uploaded through:

```text
PATCH /api/users/avatar
```

## AI Architecture

AI requests are intentionally routed through the backend.

```text
React
  ↓
Express API
  ↓
AI Service
  ↓
Groq API
  ↓
AI response
  ↓
Express API
  ↓
React
```

This keeps the Groq API key on the server instead of exposing it to the browser.

## Production Considerations

Before deploying the application, verify:

- Production MongoDB connection
- Production frontend URL
- Secure cookie configuration
- HTTPS
- Production environment variables
- Cloudinary configuration
- Groq API configuration
- CORS configuration
- Rate limits
- Production build
- Error logging
- API testing
- Responsive UI
- Database indexes
- README/API documentation

## Project Goal

TaskFlow AI is designed as a practical full-stack portfolio project demonstrating:

- REST API development
- Authentication and authorization
- MongoDB/Mongoose
- React application architecture
- CRUD operations
- Form handling and validation
- File uploads
- Cloud storage
- Team collaboration
- Notifications
- Activity tracking
- AI API integration
- Production-oriented error handling and security

## Author

Built as a full-stack development and interview-preparation project.

## License

Add your preferred license here, such as MIT.
