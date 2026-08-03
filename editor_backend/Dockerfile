FROM python:3.11-slim

RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY editor_backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# We mount or copy the entire repository because the backend serves static files from the root
# and updates files in the root.
COPY . .

# Setting the working directory to editor_backend for uvicorn
WORKDIR /app/editor_backend

# Use shell form so environment variables like $PORT are expanded.
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
