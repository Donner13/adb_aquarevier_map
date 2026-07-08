# AquaRevier Editor Backend

This directory contains a self-contained, containerizable version of the map editor backend.

## Environment Variables

The backend requires the following environment variables to function properly in production:

- `PORT` (default: 8000) - The port the server listens on.
- `GIT_PUSH_TOKEN` - A GitHub Personal Access Token (PAT) with repository write permissions. This token is used to push configuration and data changes directly to the `main` branch.
- `EDITOR_USER` / `EDITOR_PASSWORD` - HTTP Basic Auth credentials gating **every** request (the server also serves `contacts.geojson`, which contains real names, emails and phone numbers - it must never be reachable without login once public). If unset, falls back to a hardcoded local dev default (`florian` / `AquaRevier2026`) - always set both explicitly in Render.

## Render.com Setup

To host this backend on Render's free tier:

1. Log into your Render.com dashboard.
2. Go to "Blueprints" and create a new Blueprint instance, linking to this repository.
3. Render will parse `render.yaml` and create a Web Service named `aquarevier-editor-backend`.
4. The service requires the `GIT_PUSH_TOKEN`, `EDITOR_USER` and `EDITOR_PASSWORD` secrets. Go to the newly created Web Service settings in Render, find "Environment Variables", and set: `GIT_PUSH_TOKEN` (your GitHub PAT), `EDITOR_USER` and `EDITOR_PASSWORD` (a login for Florian - pick your own, do not keep the dev default).
5. Render will automatically build the Docker image and deploy the application.
6. Once deployed, Render will provide a public URL (e.g., `https://aquarevier-editor-backend.onrender.com`).
7. Open this URL and append `/internal.html` to access the editor permanently online. The browser will prompt for the `EDITOR_USER`/`EDITOR_PASSWORD` login before showing anything.
