# Shift-Management-App
Effortlessly create, manage, and track employee schedules with our intuitive Shift Management App. Simplify workforce coordination by building balanced schedules in minutes, while empowering employees to easily swap shifts and manage their availability. Streamline communication, reduce admin work, and boost team productivity and flexibility.

## Features
- Create, edit, and delete employee shifts
- Employee self-service: swap shifts, set availability
- Real-time schedule updates
- Admin dashboard for managing teams
- Notifications for shift changes
- Modern, responsive UI (Vue 3 + Vite)
- RESTful API backend (Node.js/Express)
- Automated testing (Jest, Playwright, Vitest)

## Project Structure
```
Shift-Management-App/
├── backend/         # Node.js/Express API
│   ├── routes/      # API endpoints
│   ├── services/    # Business logic and data access
│   ├── __tests__/   # Backend tests (Jest)
│   └── __mocks__/   # Mock data/services for testing
├── frontend/        # Vue 3 app
│   ├── src/         # Vue components, views, stores, assets
│   ├── e2e/         # End-to-end tests (Playwright)
│   └── public/      # Static assets
└── README.md
```

## Getting Started
### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Install Dependencies
```sh
# Install backend dependencies
cd backend && npm install
# Install frontend dependencies
cd frontend && npm install
```

### Run the App
```sh
# Start backend API
npm run start:backend
# In a new terminal, start frontend
npm run start:frontend
```

### Run Tests
```sh
# Backend tests
npm run test:backend
# Frontend unit tests
npm run test:frontend-unit
# Frontend e2e tests
npm run test:frontend-e2e
```

## Technologies Used
- Frontend: Vue 3, Vite, TypeScript, Pinia, Playwright, Vitest
- Backend: Node.js, Express, Jest

## Contributing
1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## License
MIT
