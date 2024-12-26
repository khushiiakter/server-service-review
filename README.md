
# Service Review System

## Purpose
Service Review System is a full-stack application designed to provide users with a platform for exploring, reviewing, and sharing feedback on various services. It aims to empower users with trusted information and insights to make informed decisions.

## Live URL
[Live Demo](https://assignment-11-eb26e.web.app/)

## Key Features
- **Service Management**:
  - Add, update, and delete services.
  - View detailed service descriptions, pricing, and user reviews.

- **User Reviews**:
  - Add reviews for specific services.
  - View aggregated user reviews, including ratings, text feedback, and reviewer details.
  - Edit or delete your reviews.

- **Authentication**:
  - Secure user authentication with Firebase.
  - Personalized dashboard for logged-in users.

- **Responsive Design**:
  - Fully optimized for all devices, ensuring a seamless experience across desktops, tablets, and mobile devices.

- **Advanced Features**:
  - JWT-based secure access for private routes.
  - Search and filtering functionality for services.
  - Dynamic rating and review system.
  - **Real-time Counters**: Use of **React CountUp** for dynamically displaying important metrics like total reviews or services.

- **Backend**:
  - CRUD operations for services and reviews.
  - MongoDB for storing user, service, and review data.

## Technologies Used
### Frontend
- **React.js**
- **Tailwind CSS** with DaisyUI
- **React Router** for dynamic routing
- **React Simple Star Rating** for rating functionality
- **React CountUp** for data visualization (e.g., real-time counters for services, reviews, etc.)
- **Framer Motion** for animations

### Backend
- **Node.js** with **Express.js**
- **MongoDB** for the database
- **JWT** for secure authentication
- **dotenv** for environment variables

### Deployment
- **Frontend**: Hosted on Vercel
- **Backend**: Hosted on Vercel (or any other hosting service)

### Other npm Packages
- **react-hot-toast** for notifications
- **axios** for API calls
- **moment.js** for date formatting


