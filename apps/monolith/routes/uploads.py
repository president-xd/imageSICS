import os
import uuid
from pathlib import Path
from flask import Blueprint, request, jsonify, current_app

uploads_bp = Blueprint('uploads', __name__)

@uploads_bp.route('/', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file:
        filename = file.filename
        # Generate safe unique filename
        unique_filename = f"{uuid.uuid4()}_{filename}"
        
        # Use config path
        # Assuming app.config['UPLOADS_FOLDER'] is set or relative path
        uploads_dir = os.path.join(os.getcwd(), 'storage', 'uploads')
        os.makedirs(uploads_dir, exist_ok=True)
        
        save_path = os.path.join(uploads_dir, unique_filename)
        file.save(save_path)

        return jsonify({
            "id": unique_filename,
            "filename": filename,
            "url": f"/storage/uploads/{unique_filename}",
            "path": f"/storage/uploads/{unique_filename}" # Keeping relative for frontend use
        })
    
    return jsonify({"error": "Upload failed"}), 500
