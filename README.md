# Dynamic Product Catalog

A full-stack application with Express.js backend and Vue.js frontend.

## Prerequisites

- Node.js (version 21 - see `.nvmrc` in `/be`)
- npm
- nvm (recommended for Node version management)
- **SQLite3** - Must be installed on your system for the database to work

### Installing SQLite3

**macOS:**

```bash
brew install sqlite3
```

## Development Setup

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd be
   ```

2. Create environment configuration file:

   ```bash
   cat > .env << EOF
   NODE_ENV=development
   PORT=3000
   EOF
   ```

3. Use the correct Node.js version:

   ```bash
   nvm use
   ```

4. Install dependencies:

   ```bash
   npm install
   ```

5. Seed the database:

   ```bash
   npm run seed
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

The backend will be running on `http://localhost:3000`. Visit this URL to see "API is running" message.

### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:

   ```bash
   cd fe
   ```

2. Use the same Node.js version:

   ```bash
   nvm use 21
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be running on `http://localhost:5173` (or the next available port).

## Running the Application

1. Start the backend server first (from `/be` directory): `npm run dev`
2. Start the frontend server (from `/fe` directory): `npm run dev`
3. Open your browser to the frontend URL shown in the terminal
