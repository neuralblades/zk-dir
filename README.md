# ZKBD - Zero Knowledge Bug Directory

A modern web application for tracking and sharing zero-knowledge proof vulnerabilities and bug reports.

![ZKBD Screenshot](https://i.postimg.cc/rsrr3rH1/zk-logo.png)

## Features

- 🔒 User authentication system
- 📝 Create, read, update, and delete bug reports
- 🏷️ Tag and categorize vulnerabilities
- 🔍 Advanced filtering and search capabilities
- 📊 Admin dashboard with analytics
- 📱 Responsive design for all devices
- 🔖 Bookmark important reports
- 🌓 Dark mode support

## Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and development server
- **Redux Toolkit** - State management
- **React Router** - Navigation and routing
- **Tailwind CSS** - Styling and UI components
- **Flowbite React** - UI component library
- **React Quill** - Rich text editor
- **Highlight.js** - Code syntax highlighting
- **Firebase Storage** - Image uploads

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcrypt** - Password hashing

## Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB instance

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/zkbd.git
cd zkbd
```

2. Install dependencies
```bash
npm install
cd client
npm install
cd ..
```

3. Create a `.env` file in the root directory with the following variables:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

4. Create a `.env` file in the client directory with:
```
VITE_FIREBASE_API_KEY=your_firebase_api_key
```

### Running the application

Development mode:
```bash
# Run backend and frontend concurrently
npm run dev
```

Production build:
```bash
npm run build
npm start
```

## Project Structure

```
zkbd/
├── api/               # Backend code
│   ├── controllers/   # Request handlers
│   ├── models/        # Database models
│   ├── routes/        # API routes
│   └── index.js       # Entry point
├── client/            # Frontend code
│   ├── public/        # Static assets
│   └── src/           # React components
│       ├── components/# Reusable components
│       ├── pages/     # Page components
│       ├── redux/     # Redux store and slices
│       └── App.jsx    # Main component
└── package.json       # Project configuration
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.