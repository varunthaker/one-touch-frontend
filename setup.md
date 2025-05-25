# Project Setup Guide

## Option 1: Local Setup

### Prerequisites
- Node.js 18.20 or higher
- npm (comes with Node.js)
- Git

### Step-by-Step Local Installation

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd one-touch-app
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

## Option 2: Docker Setup

### Prerequisites
- Docker
- Docker Compose
- Git

### Step-by-Step Docker Installation

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd one-touch-app
   ```

2. **Build and Start Docker Container**
   ```bash
   docker-compose up --build
   ```
   This command will:
   - Build the Docker image using Dockerfile.Frontend.Dev
   - Start the container
   - The application will be available at `http://localhost:5173`

3. **Stop Docker Container**
   ```bash
   docker-compose down
 ```

