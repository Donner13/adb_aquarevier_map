FROM python:3.11-slim

RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# We copy the editor backend into its directory
COPY editor_backend /app/editor_backend
# The server operates on the parent directory, so we should copy the whole repo or expect it to be mounted.
# Since it's Render, Render will clone the whole repo into the working directory.
# We will assume Render context is the root of the repo.
# So WORKDIR is /app, Render clones repo into /app, we can just run `python editor_backend/server.py`.

CMD ["python", "editor_backend/server.py"]
