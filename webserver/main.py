"""
Taxy Backend Server

A minimal HTTP backend that serves the UI and provides a filesystem-based KV store.
- Serves UI from /
- PUT /api/<uuid> - Save blob with revision management (max 1MB, keep last 2 revisions)
- GET /api/<uuid> - Retrieve latest blob
- GET /api/<uuid>/previous - Retrieve previous revision
- Single-threaded (no concurrency)
"""

import os
import glob
from datetime import datetime
from pathlib import Path
from flask import Flask, request, send_from_directory, jsonify, abort

app = Flask(__name__, static_folder='../dist', static_url_path='')

# Configuration
DATA_DIR = Path('data')
MAX_FILE_SIZE = 1 * 1024 * 1024  # 1MB
MAX_REVISIONS = 2

# Ensure data directory exists
DATA_DIR.mkdir(exist_ok=True)


def get_revision_files(uuid: str) -> list[Path]:
    """Get all revision files for a given UUID, sorted by timestamp (newest first)."""
    pattern = f"{uuid}_*.blob"
    files = list(DATA_DIR.glob(pattern))
    # Sort by modification time, newest first
    files.sort(key=lambda f: f.stat().st_mtime, reverse=True)
    return files


def cleanup_old_revisions(uuid: str) -> None:
    """Keep only the last MAX_REVISIONS files, delete older ones."""
    files = get_revision_files(uuid)
    if len(files) > MAX_REVISIONS:
        for old_file in files[MAX_REVISIONS:]:
            old_file.unlink()


def generate_filename(uuid: str) -> str:
    """Generate filename with UUID and timestamp."""
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    return f"{uuid}_{timestamp}.blob"


@app.route('/')
def serve_ui():
    """Serve the UI application."""
    return send_from_directory(app.static_folder, 'index.html')


@app.route('/<path:path>')
def serve_static(path):
    """Serve static files from the UI build."""
    try:
        return send_from_directory(app.static_folder, path)
    except:
        # If file not found, serve index.html for client-side routing
        return send_from_directory(app.static_folder, 'index.html')


@app.route('/api/<uuid>', methods=['PUT'])
def put_blob(uuid: str):
    """
    Save a blob with revision management.

    - Validates file size (max 1MB)
    - Creates timestamped revision
    - Keeps only last 2 revisions
    """
    # Validate UUID format (basic check)
    if not uuid or len(uuid) < 1:
        return jsonify({'error': 'Invalid UUID'}), 400

    # Get blob data
    blob_data = request.get_data()

    # Validate file size
    if len(blob_data) > MAX_FILE_SIZE:
        return jsonify({'error': f'File too large. Maximum size is {MAX_FILE_SIZE / (1024 * 1024)}MB'}), 413

    # Generate filename and save
    filename = generate_filename(uuid)
    filepath = DATA_DIR / filename

    try:
        filepath.write_bytes(blob_data)

        # Cleanup old revisions
        cleanup_old_revisions(uuid)

        return jsonify({
            'message': 'Blob saved successfully',
            'uuid': uuid,
            'size': len(blob_data),
            'revision': filename
        }), 201
    except Exception as e:
        return jsonify({'error': f'Failed to save blob: {str(e)}'}), 500


@app.route('/api/<uuid>', methods=['GET'])
def get_blob(uuid: str):
    """Retrieve the latest blob for a given UUID."""
    files = get_revision_files(uuid)

    if not files:
        return jsonify({'error': 'Blob not found'}), 404

    # Return the latest (first in sorted list)
    latest_file = files[0]

    try:
        blob_data = latest_file.read_bytes()
        return blob_data, 200, {'Content-Type': 'application/octet-stream'}
    except Exception as e:
        return jsonify({'error': f'Failed to read blob: {str(e)}'}), 500


@app.route('/api/<uuid>/previous', methods=['GET'])
def get_previous_blob(uuid: str):
    """Retrieve the previous revision blob for a given UUID."""
    files = get_revision_files(uuid)

    if len(files) < 2:
        return jsonify({'error': 'Previous revision not found'}), 404

    # Return the second item (previous revision)
    previous_file = files[1]

    try:
        blob_data = previous_file.read_bytes()
        return blob_data, 200, {'Content-Type': 'application/octet-stream'}
    except Exception as e:
        return jsonify({'error': f'Failed to read blob: {str(e)}'}), 500


if __name__ == '__main__':
    # Run single-threaded (threaded=False) to prevent concurrency
    app.run(host='0.0.0.0', port=5000, threaded=False, debug=True)
