export const generateReadme = async (repoUrl) => {
    const response = await fetch('/api/generate-readme', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ repoUrl })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.error || 'The backend could not generate the README.');
    }

    return data.readme;
};
