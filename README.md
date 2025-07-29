# NegotiationMaster

A comprehensive negotiation skills training web application where users practice scenarios with AI characters and receive detailed feedback to improve their negotiation abilities.

## Features

- **User Authentication**: Secure registration and login system
- **Skill Progression Dashboard**: Track progress across 3 key dimensions:
  - Claiming Value
  - Creating Value
  - Managing Relationships
- **7 Negotiation Scenarios**: Progressive difficulty levels for comprehensive training
- **Real-time AI Chat**: Interactive role-playing with intelligent AI characters
- **Deal Confirmation System**: Structured negotiation outcomes
- **AI-Generated Feedback**: Detailed scoring (1-100 scale) and improvement suggestions
- **User Leaderboard**: Compete and compare with other users

## Tech Stack

### Backend
- **Node.js** with **Express.js** framework
- **PostgreSQL** database with **Knex.js** ORM
- **JWT** authentication
- **Socket.io** for real-time communication
- **Winston** logging
- **Helmet** security middleware

### Frontend
- **React 18** with hooks and context
- **Material-UI** component library
- **React Router** for navigation
- **React Query** for server state management
- **Socket.io Client** for real-time features
- **Recharts** for data visualization

## Prerequisites

- Node.js (>= 18.0.0)
- PostgreSQL (>= 13.0)
- npm or yarn

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd NegotiationMaster
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

### 4. Database Setup

1. Create a PostgreSQL database:
```sql
CREATE DATABASE negotiation_master;
```

2. Copy environment variables:
```bash
cd ..
cp .env.example .env
```

3. Update `.env` with your database credentials and other configuration values.

4. Run database migrations:
```bash
cd backend
npm run migrate
```

5. (Optional) Seed the database with sample data:
```bash
npm run seed
```

## Development

### Start the backend server
```bash
cd backend
npm run dev
```
The backend will run on `http://localhost:5000`

### Start the frontend development server
```bash
cd frontend
npm start
```
The frontend will run on `http://localhost:3000`

## Production Deployment

### Backend
```bash
cd backend
npm install --production
npm run migrate
npm start
```

### Frontend
```bash
cd frontend
npm run build
# Serve the build folder with your preferred static file server
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

- **Database**: PostgreSQL connection details
- **JWT**: Secret keys for authentication
- **AI API**: OpenAI API key for AI characters
- **SMTP**: Email configuration (optional)
- **CORS**: Allowed origins for cross-origin requests

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/progress` - Get skill progression data

### Scenarios
- `GET /api/scenarios` - List all scenarios
- `GET /api/scenarios/:id` - Get specific scenario
- `POST /api/scenarios/:id/start` - Start a negotiation session

### Negotiations
- `GET /api/negotiations` - Get user's negotiations
- `POST /api/negotiations/:id/messages` - Send message in negotiation
- `POST /api/negotiations/:id/complete` - Complete negotiation

### Leaderboard
- `GET /api/leaderboard` - Get user rankings

## Testing

### Backend tests
```bash
cd backend
npm test
npm run test:watch
```

### Frontend tests
```bash
cd frontend
npm test
```

## Linting

### Backend
```bash
cd backend
npm run lint
npm run lint:fix
```

### Frontend
```bash
cd frontend
npm run lint
npm run lint:fix
```

## Project Structure

```
NegotiationMaster/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utility functions
│   │   └── server.js        # Entry point
│   ├── tests/               # Test files
│   └── package.json
├── frontend/
│   ├── public/              # Static files
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── hooks/           # Custom hooks
│   │   ├── context/         # React context
│   │   ├── utils/           # Utility functions
│   │   └── styles/          # CSS/styling
│   └── package.json
├── docs/                    # Documentation
├── .env.example             # Environment variables template
├── .gitignore
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## Security Considerations

- JWT tokens with short expiration times
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS configuration
- Helmet.js security headers
- Environment variable protection

## License

MIT License - see LICENSE file for details