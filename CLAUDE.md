# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Image Studio is a Next.js application for browsing and filtering AI-generated images. It features a masonry grid layout with filtering capabilities by category and styles.

## Development Commands

- **Development server**: `npm run dev` (uses Turbopack for faster builds)
- **Build**: `npm run build --turbopack`
- **Start production**: `npm start`
- **Lint**: `npm run lint`

## Architecture

### UI Components Structure
- **Components**: Located in `src/components/`
  - `ui/`: Reusable UI primitives (Button, Dropdown, Tabs, cn utility)
  - `gallery/`: Gallery-specific components (MasonryGrid, ImageCard, FiltersBar, ImageSkeleton)

### Data Management
- **Static data**: `src/data/` contains image data and filter definitions
- **Image data structure**: Defined in `src/data/images.ts` with ImageItem type including id, src, alt, category, styles, and optional tags

### Styling
- **TailwindCSS v4** with custom theme extensions
- **Custom CSS variables**: `--blue-5` (brandBlue), `--lime-3` (brandLime)
- **Global styles**: `src/app/globals.css`
- **Responsive grid**: 2-4 columns based on screen size

### Application Structure
- **App Router**: Uses Next.js 15 app directory structure
- **Main page**: `src/app/page.tsx` implements filtering logic with loading states
- **Layout**: Spanish locale (`lang="es"`) with custom container classes

### Key Features
- Real-time filtering by category, styles, and search query
- Loading skeleton states during filter changes (600ms simulation)
- Responsive masonry grid layout
- Radix UI components for accessibility

### Technologies
- **Next.js 15** with React 19
- **TypeScript** for type safety
- **Radix UI** for accessible components
- **Lucide React** for icons
- **class-variance-authority** and **clsx** for conditional styling