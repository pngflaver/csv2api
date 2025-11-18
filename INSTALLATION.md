
# Installation Guide

This project is a standard React application built with Vite. To get it running locally, you'll need Node.js and npm (or a compatible package manager like Yarn or pnpm) installed on your machine.

## Step 1: Set up the Project

First, ensure you have all the project files in a single directory.

## Step 2: Install Dependencies

Open your terminal, navigate to the project's root directory, and run the following command to install the necessary packages defined in `package.json`:

```bash
npm install
```

This command will download and install React, TypeScript, Tailwind CSS, Recharts, and other required libraries into your `node_modules` folder.

## Step 3: Configure Environment Variables

This application uses an environment variable for the mock API key. Although it's a mock key and not a real secret, it's good practice to use environment variables.

Create a file named `.env` in the root of your project and add the following line:

```
VITE_API_KEY=your-secret-api-key
```
*Note: In a real application, ensure `.env` is listed in your `.gitignore` file to prevent committing secrets.*

For the purpose of this simulation, the `API_KEY` is not used for Gemini but is part of the mock API server functionality.

## Step 4: Run the Development Server

Once the dependencies are installed, you can start the local development server with this command:

```bash
npm run dev
```

This will start the Vite development server, and you should see output in your terminal indicating the server is running, typically on `http://localhost:5173`.

Open your web browser and navigate to the provided URL to see the application live. The server supports Hot Module Replacement (HMR), so any changes you make to the source code will be reflected in the browser almost instantly without a full page reload.

## Building for Production

When you are ready to deploy the application, you can create an optimized production build:

```bash
npm run build
```

This command will compile and bundle your code into a `dist` directory. You can then serve the contents of this directory with any static file server.
