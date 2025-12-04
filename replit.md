# Lumina AI E-Commerce Platform

## Overview

Lumina is an AI-powered e-commerce platform that leverages Google's Gemini AI to analyze product images and generate intelligent product listings. The platform features a modern web interface for browsing products, managing shopping carts, and processing orders, along with an admin panel for AI-assisted product management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built using React with TypeScript and follows a modern component-based architecture:

- **Framework**: React 18 with TypeScript for type safety
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: 
  - TanStack React Query for server state management and caching
  - React Context API for cart state (CartProvider with localStorage persistence)
  - next-themes for theme management (dark/light mode support)
- **UI Components**: Radix UI primitives with shadcn/ui component library (New York style variant)
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **Build Tool**: Vite for fast development and optimized production builds

**Design Decisions**:
- Chose Wouter over React Router for minimal bundle size
- TanStack Query provides automatic caching, background refetching, and optimistic updates
- Shopping cart persists to localStorage to maintain state across sessions
- Radix UI ensures accessibility out of the box
- CSS variables enable seamless theme switching between light and dark modes

### Backend Architecture

The backend follows a traditional Express.js server architecture with TypeScript:

- **Framework**: Express.js with TypeScript
- **File Structure**: Modular separation of concerns
  - `server/routes.ts`: API endpoint definitions
  - `server/storage.ts`: Database abstraction layer (IStorage interface)
  - `server/gemini.ts`: AI integration for product analysis
  - `server/db.ts`: Database connection and configuration
- **API Design**: RESTful endpoints for products, orders, and AI analysis
- **File Upload**: Multer middleware for handling product image uploads (5MB limit)
- **Authentication**: Session-based authentication system
  - express-session for session management
  - memorystore for session storage
  - Password hashing using Node.js crypto scrypt with salt
  - requireAuth and requireAdmin middleware for route protection
- **Frontend Auth**: 
  - AuthProvider context for global auth state
  - useAuth hook for authentication operations
  - Protected routes with automatic redirects

**Design Decisions**:
- Storage layer abstraction (IStorage interface) allows for easier testing and potential database swapping
- Separate AI module isolates Google Gemini integration for maintainability
- Async/await pattern throughout for cleaner async code
- Express middleware chain for logging and request processing

### Data Storage

The application uses PostgreSQL with Drizzle ORM:

- **Database**: PostgreSQL via Neon Database serverless
- **ORM**: Drizzle ORM for type-safe database queries
- **Schema Definition**: Shared schema in `shared/schema.ts` for both client and server type safety
- **Tables**:
  - `users`: User authentication and authorization (id, username, password, isAdmin)
  - `products`: Product catalog with AI analysis data (id, title, price, description, imageUrl, category, tags, aiAnalysis)
  - `orders`: Order records (customerName, customerPhone, customerAddress, status, totalAmount)
  - `orderItems`: Line items for orders (orderId, productId, quantity, priceAtPurchase)
- **Validation**: Zod schemas generated from Drizzle tables for runtime validation

**Design Decisions**:
- Neon Database provides serverless PostgreSQL with WebSocket support for low-latency connections
- Drizzle chosen over Prisma for lighter footprint and better TypeScript integration
- Schema sharing between client/server eliminates type drift
- JSON columns for flexible AI analysis data storage
- UUID for user IDs, serial integers for other primary keys

### AI Integration

Google Gemini AI integration for intelligent product analysis:

- **Provider**: Google Generative AI (@google/genai)
- **Model**: gemini-2.5-flash for fast, cost-effective analysis
- **Capabilities**:
  - Image analysis to extract product information
  - Automatic title, category, and price prediction
  - Sentiment analysis
  - Keyword extraction
  - Market prediction
- **Response Format**: Structured JSON with schema validation
- **Language**: Uzbek language for product descriptions and analysis

**Design Decisions**:
- Gemini 2.5 Flash chosen for balance of speed and accuracy
- Structured JSON output ensures consistent, parseable responses
- System prompts in Uzbek align with target market
- File-based image input allows analysis of uploaded product images

### Build System

Production build process optimized for Replit deployment:

- **Build Script**: Custom TypeScript build script (`script/build.ts`)
- **Client Build**: Vite bundles React app with code splitting and optimization
- **Server Build**: esbuild bundles Node.js server into single file
- **Bundle Strategy**: 
  - Allowlist specific dependencies for bundling to reduce cold start times
  - External dependencies loaded from node_modules
- **Output**: 
  - Client assets to `dist/public`
  - Server bundle to `dist/index.cjs`

**Design Decisions**:
- esbuild for server bundling provides fast compilation
- Bundling critical dependencies reduces file system calls during cold starts
- Single CJS output file simplifies deployment
- Static file serving from built client assets

## External Dependencies

### Third-Party Services

- **Neon Database**: Serverless PostgreSQL database with WebSocket support
  - Connection via `@neondatabase/serverless` package
  - WebSocket constructor replaced with `ws` package for Node.js compatibility
- **Google Gemini AI**: AI model for product image analysis
  - API key required via `GEMINI_API_KEY` environment variable
  - Structured output with JSON schema validation

### Key Libraries

- **UI Framework**: 
  - React 18 with TypeScript
  - @radix-ui components for accessible primitives
  - next-themes for theme management
- **Data Layer**:
  - drizzle-orm for database queries
  - drizzle-zod for schema validation
  - @tanstack/react-query for API state management
- **Server**:
  - express for HTTP server
  - multer for file uploads
  - ws for WebSocket support
- **Build Tools**:
  - vite for frontend bundling
  - esbuild for backend bundling
  - tsx for TypeScript execution in development
- **Styling**:
  - tailwindcss for utility-first CSS
  - class-variance-authority for component variants
  - framer-motion for animations

### Development Tools

- **Replit Plugins**:
  - @replit/vite-plugin-cartographer (dev only)
  - @replit/vite-plugin-dev-banner (dev only)
  - @replit/vite-plugin-runtime-error-modal for error overlay
- **Custom Plugins**:
  - vite-plugin-meta-images for OpenGraph image updates

## Recent Changes (December 2025)

### Authentication & Admin Panel Security
- Implemented session-based admin authentication system
- Created frontend AuthProvider and useAuth hook
- Added login page with login/register tabs
- Updated layout component with user authentication status display
- Protected admin routes require admin privileges
- Created 403 Forbidden page for unauthorized access

### Enhanced Product Pages
- Created dedicated product detail page (`/product/:id`) with:
  - Multi-image slider with gallery thumbnails
  - YouTube video embed support
  - Technical specifications table
  - AI analysis display
  - Related products section
  - Flash sale countdown timer
  - Stock status indicator
  - Brand and tags display

### Flash Sales Feature
- Created dedicated Flash Sales page (`/flash-sales`) with:
  - Animated countdown timers
  - Special promotional UI with gradients
  - Flash sale product cards with discount badges
  - Savings calculator display

### Enhanced Admin Product Form
- Multi-image gallery upload support (up to 10 images)
- YouTube video URL field
- Short description (200-300 chars) for marketing
- Full SEO-rich description field
- Brand field
- Stock/inventory tracking
- Dynamic specifications builder (key-value pairs)

### Navigation & Layout
- Added Flash Sale link to main navigation with flame icon
- Updated mobile menu with Flash Sale link
- Product cards now link to detailed product pages

### Telegram Integration Enhancements
- Richer Telegram posts with:
  - Brand information
  - Short description
  - Stock status
  - Video links
  - Better formatting with icons

### API Endpoints
- GET /api/products/:id - Product details
- GET /api/products/:id/related - Related products
- GET /api/categories - Category list
- GET /api/brands - Brand list
- POST /api/products - Multi-image upload support
- PATCH /api/products/:id - Gallery update support

### Schema Extensions
- shortDescription: 200-300 character product summary
- fullDescription: Long SEO-rich product description
- gallery: Array of additional product images
- videoUrl: YouTube video URL
- stock: Inventory count
- brand: Product brand name
- specs: Technical specifications (JSON)
- flashSaleMarketingText: AI-generated flash sale text

### Price Formatting (Uzbek Som)
- All prices are displayed in Uzbek Som format (e.g., "15 990 000 so'm")
- formatPrice utility function in `client/src/lib/utils.ts` handles formatting
- Used across all pages: home, product details, flash sales, checkout, admin panel
- Prices in database are stored as integers representing Som values