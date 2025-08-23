# AI README Generator

This project is a web application that generates a `README.md` file for a GitHub repository using the Google Gemini API. You provide a link to a GitHub repository, and the application analyzes its structure and metadata to create a comprehensive README file.

## Features

-   **AI-Powered Content:** Uses Google's Gemini model to generate high-quality, relevant content.
-   **GitHub Integration:** Fetches repository details, file structure, and `package.json` content directly from the GitHub API.
-   **Easy to Use:** Simple interface requiring only a GitHub repository URL.
-   **Modern Tech Stack:** Built with React, TypeScript, and Vite for a fast and reliable development experience.

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You need to have [Node.js](https://nodejs.org/) (version 18 or newer recommended) and npm installed on your computer.

### Installation & Setup

1.  **Clone the repository (or download the files):**
    ```sh
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install NPM packages:**
    ```sh
    npm install
    ```

3.  **Set up your environment variables:**
    Create a new file named `.env` in the root of your project directory. You need to add your Google Gemini API key to this file.

    ```env
    # .env
    API_KEY="YOUR_GEMINI_API_KEY_HERE"
    ```
    Replace `"YOUR_GEMINI_API_KEY_HERE"` with your actual key.

### Running the Application

Once the installation is complete and your API key is set, you can run the development server:

```sh
npm run dev
```

This will start the Vite development server. Open your web browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`).

## How It Works

1.  **Input:** The user enters a public GitHub repository URL.
2.  **GitHub Service:** The app calls the GitHub API to fetch repository metadata (name, description, language), the list of files in the root directory, and the content of `package.json` if it exists.
3.  **Gemini Service:** This data is compiled into a detailed prompt. The prompt is sent to the Google Gemini API.
4.  **Output:** The Gemini model returns a complete, well-structured `README.md` in Markdown format, which is then displayed to the user.