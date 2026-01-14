# Task Management System

A full-stack task management application that allows users to create, update, delete, and track tasks with status and due dates. The project demonstrates modern backend and frontend development practices with clean API integration.

---

## Features

- Create, edit, and delete tasks  
- Task status tracking (Pending, In Progress, Completed)  
- Due date support  
- Search and filter tasks  
- Progress tracking based on completion  
- RESTful API with proper validation and error handling  

---

## Tech Stack

### Frontend
- React (Vite)
- JavaScript / TypeScript
- Tailwind CSS
- TanStack React Query

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- REST API
- Middleware for security, logging, and rate limiting

---

## Project Structure

task-manager/
├── backend/
│ ├── routes/
│ ├── controllers/
│ ├── models/
│ ├── middleware/
│ └── server.js
│
├── frontend/
│ ├── src/
│ │ ├── api/
│ │ ├── c---

## Setup Instructions

### Backend
```bash
cd backend
npm install
npm start

Backend runs on:
http://localhost:5051

Health check:

GET /health

### Frontend

cd frontend
npm install
npm run dev
Frontend runs on: 
http://localhost:5173


API Endpoints
| Method | Endpoint       | Description     |
| ------ | -------------- | --------------- |
| GET    | /api/tasks     | Fetch all tasks |
| POST   | /api/tasks     | Create a task   |
| PUT    | /api/tasks/:id | Update a task   |
| DELETE | /api/tasks/:id | Delete a task   |


Notes

node_modules and environment files are excluded via .gitignore
Backend and frontend are connected through a Vite proxy


