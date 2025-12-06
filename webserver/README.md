# Taxy Backend Server

A minimal HTTP backend for Taxy that serves the UI and provides a filesystem-based key-value store with revision management.

## Features

- **UI Serving**: Serves the built React UI from `/`
- **Blob Storage**: Filesystem-based KV store with revision management
- **File Size Validation**: Rejects files larger than 1MB
- **Revision Management**: Keeps last 2 revisions per UUID
- **Single-Threaded**: No concurrency support (by design)

## API Endpoints

### PUT /api/\<uuid\>

Save a blob with automatic revision management.

**Request:**
- Method: `PUT`
- Content-Type: `application/octet-stream`
- Body: Binary blob data (max 1MB)

**Response:**
- `201 Created`: Blob saved successfully
  ```json
  {
    "message": "Blob saved successfully",
    "uuid": "abc123",
    "size": 12345,
    "revision": "abc123_20251206191530.blob"
  }
  ```
- `413 Payload Too Large`: File exceeds 1MB limit
- `400 Bad Request`: Invalid UUID
- `500 Internal Server Error`: Save operation failed

### GET /api/\<uuid\>

Retrieve the latest blob for a given UUID.

**Response:**
- `200 OK`: Returns blob as `application/octet-stream`
- `404 Not Found`: No blob found for UUID

### GET /api/\<uuid\>/previous

Retrieve the previous revision of a blob.

**Response:**
- `200 OK`: Returns previous blob as `application/octet-stream`
- `404 Not Found`: No previous revision exists

## Development

### Prerequisites

- Python 3.12+
- [uv](https://github.com/astral-sh/uv) package manager

### Local Development

```bash
# Install dependencies
uv sync

# Run the server
uv run python main.py
```

The server will start on `http://localhost:5000`

## Docker Deployment

### Build the Docker Image

```bash
# From the repository root
docker build -t taxy-backend ./webserver
```

### Run with Docker

```bash
# Run with mounted data directory
docker run -d \
  --name taxy-backend \
  -p 5000:5000 \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/dist:/app/dist:ro \
  taxy-backend
```

**Volumes:**
- `/app/data`: Persistent blob storage (read-write)
- `/app/dist`: UI build directory (read-only)

### Docker Compose Example

```yaml
version: '3.8'

services:
  taxy-backend:
    build: ./webserver
    ports:
      - "5000:5000"
    volumes:
      - ./webserver/data:/app/data
      - ./dist:/app/dist:ro
    restart: unless-stopped
```

## Storage Format

Blobs are stored in the `data/` directory with the following naming convention:

```
<uuid>_<timestamp>.blob
```

Example:
```
abc123def_20251206191530.blob
abc123def_20251206192045.blob
```

Only the 2 most recent revisions are kept per UUID.

## Configuration

Key constants in `main.py`:

- `MAX_FILE_SIZE`: 1MB (1 * 1024 * 1024 bytes)
- `MAX_REVISIONS`: 2
- `DATA_DIR`: `data/`
- `PORT`: 5000

## Limitations

- **No Concurrency**: Server runs single-threaded (`threaded=False`)
- **No Authentication**: API endpoints are unprotected
- **File Size Limit**: 1MB maximum per blob
- **Revision Limit**: Only 2 revisions kept per UUID
- **No Database**: Pure filesystem storage

## Notes

- The server expects the UI build in `../dist` directory (relative to `webserver/`)
- All non-API routes serve the UI to support client-side routing
- Blobs are stored as raw binary files with `.blob` extension
- Timestamps use `yyyyMMddHHmmss` format
