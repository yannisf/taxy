# Taxy Backend Dockerfile
# Multi-stage build using uv for Python dependency management

FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim AS builder

WORKDIR /app

# Copy dependency files
COPY pyproject.toml .
COPY .python-version .

# Install dependencies
RUN uv sync --frozen --no-dev

# Copy application code
COPY main.py .

# Runtime stage
FROM python:3.12-slim-bookworm

WORKDIR /app

# Copy virtual environment from builder
COPY --from=builder /app/.venv /app/.venv

# Copy application code
COPY --from=builder /app/main.py .

# Create data directory for blob storage
RUN mkdir -p /app/data

# Expose port
EXPOSE 5000

# Set environment variables
ENV PATH="/app/.venv/bin:$PATH"
ENV PYTHONUNBUFFERED=1

# Run the application
CMD ["python", "main.py"]
