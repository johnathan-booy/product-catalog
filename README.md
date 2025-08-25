# Dynamic Product Catalog

A simple web application that allows users to search and filter product items based on their input.

## Architecture

The application is built as a monolith with a clear separation between frontend and backend:

- **Backend (Express.js)**: API server that handles product data storage and retrieval using SQLite database with full-text search capabilities
- **Frontend (Vue.js)**: Single-page application providing a search interface with real-time filtering and product display
- **Database**: SQLite with full-text search indexing for efficient product queries

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

2. Use the correct Node.js version:

   ```bash
   nvm use
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

## API Endpoints

The backend provides three main API endpoints for managing and searching products:

### 1. Get All Products
Retrieve all products from the catalog.

```bash
curl http://localhost:3000/products
```

### 2. Search Products
Search for products using a query string. The search uses full-text search capabilities.

```bash
# Basic search
curl "http://localhost:3000/products/search?q=laptop"

# Search with spaces (URL encoded)
curl "http://localhost:3000/products/search?q=gaming%20mouse"
```

**Parameters:**
- `q` (required): Search query string (max 100 characters)

### 3. Generate Products
Generate new sample products for testing and development.

```bash
# Generate 1000 products (default)
curl -X POST http://localhost:3000/products/generate

# Generate specific number of products
curl -X POST http://localhost:3000/products/generate \
  -H "Content-Type: application/json" \
  -d '{"count": 500}'
```

**Request Body:**
- `count` (optional): Number of products to generate (default: 1000)

## Testing

The backend includes unit and integration tests covering controllers, services, and security.

```bash
cd be
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
```

## Future Improvements

### Database & Data Management

- Migrate from SQLite to PostgreSQL for production scalability
- Implement proper database migrations using a tool like Knex
- Normalize the database schema (for example separate `categories` and `brands` tables)
- Implement caching layer for frequently searched products

### API & Backend

- Add API versioning for better maintainability
- Protect the POST endpoint for product generation with authentication
- Implement request validation middleware
- Add more granular error responses and logging

### Frontend & User Experience

- Flesh out the wireframe design into a polished UI
- Implement loading states, empty states, and better responsive design
- Add search filters (category, price range), sorting, and advanced search
- Enhance error handling with user-friendly messages

### Development & Operations

- Share TypeScript types between frontend and backend
- Expand test coverage for edge cases and integration scenarios
- Add Docker configuration and CI/CD pipeline
- Deploy to a cloud provider (e.g., Heroku, AWS)
- Implement proper environment configuration management
