from fastapi import APIRouter, UploadFile, File, HTTPException
import shutil
import unidecode
from pathlib import Path
from datetime import datetime
import uuid
import os

router = APIRouter()

STORAGE_DIR = Path(os.getenv("IMAGESICS_STORAGE_DIR", "./storage")).resolve()
UPLOADS_DIR = STORAGE_DIR / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/")
async def upload_file(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")
        
    # Sanitize filename
    clean_name = unidecode.unidecode(file.filename)
    clean_name = clean_name.replace(" ", "_")
    
    # Create unique ID
    file_id = str(uuid.uuid4())
    ext = Path(clean_name).suffix
    
    # Filename on disk: id_filename.ext
    save_name = f"{file_id}_{clean_name}"
    save_path = UPLOADS_DIR / save_name
    
    try:
        with save_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save file: {str(e)}")
        
    return {
        "id": file_id,
        "filename": clean_name,
        "path": str(save_path), # Internal path
        "url": f"/storage/uploads/{save_name}", # Public URL
        "uploaded_at": datetime.now().isoformat()
    }
