# AquaRevier Editor Backend

This directory contains the FastAPI backend for the AquaRevier editor (`internal.html`).
It replaces the local `server.py` and provides a permanent, version-controlled backend instance that can be hosted on a cloud provider like Render.com.

## Endpoints

- `POST /api/contacts`: Accepts a GeoJSON payload, saves it to `contacts.geojson`, regenerates `contacts_anonymized.geojson`, and encrypts the file into `contacts.enc`.
- `POST /api/deploy`: Commits the modified files and pushes them to the `main` branch of the GitHub repository.

## Deployment on Render.com

This backend is designed to be deployed using the provided `render.yaml` Blueprint.

### Setup Instructions

1. Connect your Render account to this GitHub repository.
2. Render will automatically detect the `render.yaml` Blueprint and prompt you to deploy.
3. Once deployed, the service will require a `GIT_PUSH_TOKEN` to be able to push to the repository.

### Configuring the `GIT_PUSH_TOKEN`

The backend needs a Personal Access Token (PAT) with `repo` scope to push changes back to GitHub.
This token MUST NOT be hardcoded in the codebase.

1. Go to your GitHub account settings -> Developer settings -> Personal access tokens.
2. Generate a new token with `repo` access.
3. In the Render dashboard, go to your deployed web service -> Environment.
4. Add a new secret with the key `GIT_PUSH_TOKEN` and paste your generated token as the value.
5. Save the changes.

### Accessing the Editor

Once deployed, the backend will serve the `internal.html` file at the root URL of your Render service.
For example, if your Render service URL is `https://aquarevier-editor.onrender.com`, you can access the editor at:
`https://aquarevier-editor.onrender.com/internal.html`

The public map can also be accessed at the root URL: `https://aquarevier-editor.onrender.com/`

## Local Development

You can still use the local fallback `server.py` or run this FastAPI backend locally:

```bash
cd editor_backend
pip install -r requirements.txt
uvicorn main:app --reload
```
