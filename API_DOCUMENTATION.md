# TaskFlow AI API Documentation

Base URL:

```text
http://localhost:5001/api
```

For production, replace the base URL with the deployed API URL.

## Authentication

Authentication uses a JWT stored in an HTTP-only cookie.

For browser requests, the frontend uses credentials so the authentication cookie is sent automatically.

Protected endpoints require an authenticated user.

---

# 1. Authentication API

## Register

```http
POST /auth/register
```

Creates a new user account.

### Request Body

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123"
}
```

### Success

```http
201 Created
```

Example:

```json
{
  "statusCode": 201,
  "data": {
    "user": {
      "_id": "USER_ID",
      "name": "John Doe",
      "email": "john@example.com"
    }
  },
  "message": "User registered successfully",
  "success": true
}
```

---

## Login

```http
POST /auth/login
```

Authenticates an existing user and sets the authentication cookie.

### Request Body

```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

### Success

```http
200 OK
```

The response includes the authenticated user.

---

## Get Current User

```http
GET /auth/me
```

**Authentication:** Required

Returns the currently authenticated user.

### Success

```http
200 OK
```

The frontend reads the user from:

```js
response.data.data
```

---

## Logout

```http
POST /auth/logout
```

**Authentication:** Required

Logs out the current user and clears the authentication cookie.

---

# 2. Project API

All project endpoints require authentication.

## Create Project

```http
POST /projects
```

### Request Body

```json
{
  "name": "Website Redesign",
  "description": "Redesign the company website",
  "workspace": "WORKSPACE_ID",
  "status": "active",
  "priority": "high"
}
```

The exact allowed values for status/priority are enforced by backend validation.

---

## Get Projects

```http
GET /projects
```

Returns projects accessible to the authenticated user.

### Query Parameters

```text
?page=1&limit=20
```

Additional filtering/search parameters may be supplied according to the project controller/service implementation.

---

## Get Project

```http
GET /projects/:id
```

Returns one project.

Example:

```http
GET /projects/PROJECT_ID
```

---

## Update Project

```http
PATCH /projects/:id
```

### Request Body

Send the fields that need to be updated.

Example:

```json
{
  "name": "Updated Website Redesign",
  "description": "Updated project description",
  "priority": "medium"
}
```

---

## Delete Project

```http
DELETE /projects/:id
```

Deletes a project when the authenticated user has permission.

---

# 3. Task API

All task endpoints require authentication.

## Create Task

```http
POST /tasks
```

### Request Body

Example:

```json
{
  "title": "Create landing page",
  "description": "Build the responsive landing page",
  "project": "PROJECT_ID",
  "workspace": "WORKSPACE_ID",
  "assignedTo": "USER_ID",
  "status": "todo",
  "priority": "high",
  "dueDate": "2026-10-01",
  "tags": ["frontend", "website"]
}
```

---

## Get Tasks

```http
GET /tasks
```

### Query Parameters

Example:

```text
?page=1&limit=20
```

Tasks can also be filtered using the supported task query parameters, including project/status/priority and related filtering implemented by the backend.

---

## Get Task

```http
GET /tasks/:id
```

Example:

```http
GET /tasks/TASK_ID
```

---

## Update Task

```http
PATCH /tasks/:id
```

### Request Body

Example:

```json
{
  "title": "Updated landing page task",
  "priority": "medium",
  "dueDate": "2026-10-05",
  "tags": ["frontend"]
}
```

---

## Delete Task

```http
DELETE /tasks/:id
```

Deletes the task if the user has permission.

---

## Assign Task

```http
PATCH /tasks/:id/assign
```

### Request Body

```json
{
  "assignedTo": "USER_ID"
}
```

---

## Update Task Status

```http
PATCH /tasks/:id/status
```

### Request Body

```json
{
  "status": "in-progress"
}
```

Supported task statuses:

```text
todo
in-progress
in-review
completed
```

---

# 4. Task Attachment API

## Delete Task Attachment

```http
DELETE /tasks/:taskId/attachments/:attachmentId
```

Removes an attachment from a task.

---

# 5. Upload API

## Upload Multiple Files

```http
POST /uploads/multiple
```

**Authentication:** Required

**Content-Type:**

```text
multipart/form-data
```

### Form Field

```text
files
```

Up to 5 files can be uploaded in one request.

The backend validates supported file types and file size before uploading them to Cloudinary.

---

## Upload Single File

```http
POST /uploads/single
```

**Content-Type:**

```text
multipart/form-data
```

### Form Field

```text
file
```

---

## Delete Uploaded File

```http
DELETE /uploads/single
```

Used to delete an uploaded Cloudinary file according to the backend upload controller's expected request data.

---

# 6. Comment API

## Get Task Comments

```http
GET /comments/task/:taskId
```

Returns comments for a task.

---

## Create Comment

```http
POST /comments
```

### Request Body

Example:

```json
{
  "task": "TASK_ID",
  "content": "The frontend implementation is ready for review."
}
```

---

## Update Comment

```http
PATCH /comments/:id
```

### Request Body

```json
{
  "content": "Updated comment"
}
```

A user can edit their own comment.

---

## Delete Comment

```http
DELETE /comments/:id
```

A user can delete their own comment when permitted by the backend.

---

# 7. Workspace API

All workspace endpoints require authentication.

## Get Workspaces

```http
GET /workspaces
```

Returns workspaces accessible to the authenticated user.

---

## Get Workspace

```http
GET /workspaces/:id
```

Returns workspace information and its members.

---

## Create Workspace

If workspace creation is enabled by the current backend routes, use:

```http
POST /workspaces
```

Example body:

```json
{
  "name": "Product Team",
  "description": "Workspace for the product team"
}
```

> Verify the exact workspace creation route against the deployed backend route file before publishing this endpoint as an available public API.

---

## Add Workspace Member

Use the workspace member-management endpoint implemented by the backend.

The current frontend workflow accepts a MongoDB user ID for adding a member because the application does not currently depend on a separate user-search endpoint.

---

## Change Member Role

Workspace administrators/owners can change a member's role according to backend authorization rules.

Supported workspace roles:

```text
owner
admin
manager
member
```

---

## Remove Workspace Member

Workspace owners/admins can remove members according to backend authorization rules.

---

# 8. User/Profile API

All user endpoints require authentication.

## Get Profile

```http
GET /users/profile
```

Returns the authenticated user's profile.

---

## Update Profile

```http
PATCH /users/profile
```

### Request Body

Example:

```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

The exact fields and validation rules are controlled by the backend validation schema.

---

## Change Password

```http
PATCH /users/change-password
```

### Request Body

Example:

```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword123"
}
```

---

## Update Avatar

```http
PATCH /users/avatar
```

**Content-Type:**

```text
multipart/form-data
```

### Form Field

```text
avatar
```

Supported image formats and maximum file size are validated by the backend.

The uploaded image is stored using Cloudinary.

---

# 9. Activity API

## Get Activity

```http
GET /activity
```

**Authentication:** Required

Returns activity records available to the authenticated user.

### Pagination

Example:

```text
?page=1&limit=20
```

Activity records can include project/task actions such as:

```text
Created
Updated
Deleted
```

---

# 10. Notification API

All notification endpoints require authentication.

## Get Notifications

```http
GET /notifications
```

### Query Parameters

```text
?page=1&limit=20
```

Unread-only filtering:

```text
?unreadOnly=true
```

Example:

```http
GET /notifications?page=1&limit=20&unreadOnly=true
```

---

## Mark Notification as Read

```http
PATCH /notifications/:id/read
```

Marks one notification as read.

---

## Mark All Notifications as Read

```http
PATCH /notifications/read-all
```

Marks all available notifications as read.

---

## Delete Notification

```http
DELETE /notifications/:id
```

Deletes a notification.

---

# 11. AI API

AI endpoints require authentication.

AI requests are processed by the backend and forwarded to Groq.

The API key is never exposed to the React application.

## Generate Task

```http
POST /ai/generate-task
```

Generates a structured task from a user prompt.

### Request Body

Example:

```json
{
  "prompt": "Create a task for implementing user authentication"
}
```

### Expected AI Result

```json
{
  "title": "Implement User Authentication",
  "description": "Build secure user registration and login functionality.",
  "priority": "high",
  "status": "todo",
  "tags": ["authentication", "backend"]
}
```

---

## Generate Task Description

```http
POST /ai/generate-task-description
```

### Request Body

Example:

```json
{
  "title": "Build dashboard"
}
```

Returns an AI-generated task description.

---

## Summarize Project

```http
POST /ai/summarize-project
```

### Request Body

Provide the project information required by the current AI controller/service.

Example:

```json
{
  "projectId": "PROJECT_ID"
}
```

Returns an AI-generated project summary.

---

## Meeting Notes to Tasks

```http
POST /ai/meeting-notes-to-tasks
```

### Request Body

Example:

```json
{
  "notes": "John will build the login page. Sarah will test the API. Complete this by Friday."
}
```

Returns suggested tasks extracted from the meeting notes.

---

## Ask Project Assistant

```http
POST /ai/ask-project-assistant
```

### Request Body

Example:

```json
{
  "projectId": "PROJECT_ID",
  "question": "What should we focus on next?"
}
```

Returns an AI-generated answer based on the project context supplied by the backend.

---

# 12. Common HTTP Status Codes

| Status | Meaning |
|---|---|
| 200 | Request successful |
| 201 | Resource created |
| 400 | Bad request / validation error |
| 401 | Authentication required or invalid authentication |
| 403 | Forbidden / insufficient permission |
| 404 | Resource not found |
| 409 | Conflict |
| 429 | Too many requests |
| 500 | Internal server error |

---

# 13. Validation

Request validation is handled on the backend before controller logic runs.

Validation is used for important resources such as:

- Authentication
- Projects
- Tasks
- Comments
- Notifications
- User/profile operations
- Workspace-related IDs
- Task assignment/status updates
- Attachment operations

Invalid requests should return an appropriate client error rather than reaching the service layer with invalid data.

---

# 14. Authorization Model

The backend does not rely only on frontend UI restrictions.

Important permission checks include:

- Authentication status
- Workspace membership
- Project membership
- Project ownership/permissions
- Task access
- Task assignment permissions
- Comment ownership
- Workspace role
- Resource ownership

This prevents users from accessing resources simply by changing an ID in the request URL.

---

# 15. Example Frontend API Request

Axios is configured with the API base URL and credentials.

Example:

```js
import api from "../services/api";

const response = await api.get("/projects");

const projects = response.data.data;
```

For authenticated browser requests, the HTTP-only cookie is sent automatically.

---

# 16. Example Protected Request Flow

```text
React Component
      ↓
Axios
      ↓
HTTP Request + Cookie
      ↓
Express Router
      ↓
Authentication Middleware
      ↓
Validation Middleware
      ↓
Controller
      ↓
Service
      ↓
MongoDB
      ↓
ApiResponse
      ↓
React Component
```

For AI requests:

```text
React
  ↓
AI API route
  ↓
Authentication
  ↓
Validation
  ↓
AI Controller
  ↓
AI Service
  ↓
Groq
  ↓
AI Service
  ↓
Controller
  ↓
React
```

---

# 17. API Testing Checklist

Before deployment, test at least:

### Authentication
- Register
- Login
- `/auth/me`
- Logout
- Invalid credentials
- Duplicate email
- Unauthorized request

### Projects
- Create
- Read
- Update
- Delete
- Unauthorized project access

### Tasks
- Create
- Read
- Update
- Delete
- Assign
- Status update
- Filters
- Pagination
- Unauthorized task access

### Comments
- Create
- Read
- Update own comment
- Reject editing another user's comment
- Delete own comment

### Attachments
- Upload
- Multiple upload
- Invalid file type
- File-size limit
- Delete attachment

### Workspace
- Membership
- Role permissions
- Add member
- Change role
- Remove member

### Notifications
- List
- Unread filter
- Mark read
- Mark all read
- Delete

### AI
- Generate task
- Generate description
- Summarize project
- Meeting notes → tasks
- Project assistant
- Invalid AI request
- AI provider error/rate limit

---

# 18. Notes

This document describes the currently implemented TaskFlow AI API surface.

For exact request fields and allowed enum values, the backend validation schemas and route/controller implementations are the source of truth.

Do not publish API keys, JWT secrets, MongoDB credentials, Cloudinary secrets, or other private environment variables.
