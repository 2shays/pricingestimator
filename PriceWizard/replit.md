# Pricing Analysis Platform

## Overview

This is a full-stack web application that provides AI-powered pricing analysis for companies and their products. The platform leverages multiple AI personas to analyze pricing strategies from different perspectives (Market Analyst, Value Engineer, Quantitative Analyst, and Head of Pricing) to deliver comprehensive pricing recommendations.

The application features a React frontend built with TypeScript and shadcn/ui components, an Express.js backend with PostgreSQL database integration via Drizzle ORM, and AI analysis capabilities powered by Google's Gemini API.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript in SPA mode
- **Build Tool**: Vite for development and production builds
- **UI Library**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with structured error handling
- **Middleware**: Custom logging middleware for API request tracking
- **Development Server**: Vite middleware integration for hot reloading

### Database Architecture
- **Database**: PostgreSQL with Neon serverless driver
- **ORM**: Drizzle ORM with type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema synchronization
- **Connection**: Connection pooling via @neondatabase/serverless

### Data Models
The application uses four main entities:
- **Users**: Basic user management with role-based access
- **Companies**: Company profiles with industry and size metadata
- **Pricing Tiers**: Product tiers with features and target market data
- **Pricing Analyses**: Analysis results with AI-generated recommendations and confidence scores

### AI Analysis System
- **Multi-Persona Analysis**: Four specialized AI personas provide different analytical perspectives
- **Sequential Processing**: Analyses run in sequence, with final synthesis by Head of Pricing persona
- **Confidence Scoring**: Each analysis includes confidence metrics for reliability assessment
- **Result Storage**: Complete analysis results stored as JSONB for flexible querying

### Authentication & Session Management
- **Session Storage**: PostgreSQL-based session management via connect-pg-simple
- **User Context**: Stateless user identification for analysis tracking

## External Dependencies

### AI Services
- **Google Gemini API**: Primary AI service for multi-persona pricing analysis via @google/genai
- **API Integration**: Structured prompts and response parsing for consistent analysis output

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with WebSocket connections
- **Connection Management**: Pooled connections with automatic scaling

### UI Component Libraries
- **Radix UI**: Comprehensive set of headless UI primitives for accessibility
- **Lucide React**: Icon library for consistent iconography
- **shadcn/ui**: Pre-built component system with customizable design tokens

### Development Tools
- **TypeScript**: Full type safety across frontend, backend, and shared schemas
- **Drizzle Kit**: Database schema management and migration tools
- **ESBuild**: Production bundling for backend services
- **PostCSS**: CSS processing with Tailwind CSS integration

### Hosting & Deployment
- **Replit Integration**: Development environment with runtime error overlay
- **Static Asset Serving**: Vite-based asset compilation and serving
- **Environment Configuration**: Environment-based configuration for development and production