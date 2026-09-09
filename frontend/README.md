# AI README Generator

This project is a web application that generates a `README.md` file for a GitHub repository using the Groq API. You provide a link to a GitHub repository, and the application analyzes its structure and metadata to create a comprehensive README file.

## Features

- **AI-Powered Content:** Uses a Groq-hosted Llama model to generate high-quality, relevant content.
- **GitHub Integration:** Fetches repository details, file structure, and `package.json` content directly from the GitHub API.
- **Easy to Use:** Simple interface requiring only a GitHub repository URL.
- **Modern Tech Stack:** Built with React, JavaScript, and Vite for a fast and reliable development experience.

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You need to have [Node.js](https://nodejs.org/) (version 18 or newer recommended) and npm installed on your computer.

### Installation & Setup

1.  **Clone the repository (or download the files):**

    ```sh
    git clone https://github.com/Adhith-M/ai-readme-generator.git
    cd ai-readme-generator
    ```

2.  **Install NPM packages:**

    ```sh
    npm install
    ```

3.  **Set up your environment variables:**
    Configure the backend with a Groq API key.

    Copy `.env.example` to `.env.local` and add your server-side credentials:

    ```env
    GROQ_API_KEY="YOUR_GROQ_API_KEY_HERE"
    GITHUB_TOKEN="YOUR_GITHUB_TOKEN_HERE"
    PORT=3001
    ```

    Replace the placeholder values with your actual credentials. These values are used only by the backend and are never bundled into the frontend.

### Running the Application

Once the installation is complete and your API key is set, you can run the development server:

```sh
npm run dev
```

In a second terminal, start the backend:

```sh
npm run server
```

This will start the Vite development server. Open your web browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`).

## How It Works

1.  **Input:** The user enters a public GitHub repository URL.
2.  **Frontend API call:** The React app sends the repository URL to the backend at `/api/generate-readme`.
3.  **Backend services:** The backend calls GitHub, analyzes the repository, and sends a detailed prompt to Groq.
4.  **Output:** The Groq-hosted Llama model returns a complete, well-structured `README.md` in Markdown format, which the frontend displays.
