import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchRepoData } from './services/github.js';
import { generateReadme } from './services/readmeGenerator.js';

const backendDirectory = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(backendDirectory, '.env.local') });
dotenv.config({ path: path.join(backendDirectory, '.env') });

const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.post('/api/generate-readme', async (req, res) => {
    const { repoUrl } = req.body || {};

    if (typeof repoUrl !== 'string' || !repoUrl.trim()) {
        return res.status(400).json({ error: 'A GitHub repository URL is required.' });
    }

    try {
        const repoData = await fetchRepoData(
            repoUrl.trim(),
            process.env.GITHUB_TOKEN
        );
        const readme = await generateReadme(repoData);
        return res.json({ readme });
    } catch (error) {
        console.error('README generation failed:', error);
        return res.status(500).json({
            error: error instanceof Error ? error.message : 'README generation failed.'
        });
    }
});

app.listen(port, () => {
    console.log(`Backend API listening on http://localhost:${port}`);
});
