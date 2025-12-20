import os
from pathlib import Path

# Base paths
THIRD_PARTY_DIR = os.environ.get("IMAGESICS_THIRD_PARTY_DIR", str(Path.cwd() / "third_party"))

def get_tool_path(tool_name: str) -> str:
    """Get absolute path to a third party tool."""
    base = Path(THIRD_PARTY_DIR)
    
    if tool_name == "exiftool":
        # Check platform in future, for now standard linux structure as provided
        return str(base / "pyexiftool/exiftool/linux/exiftool")
        
    if tool_name == "butteraugli":
        return str(base / "butteraugli/linux/butteraugli")
        
    if tool_name == "ssimulacra":
        return str(base / "ssimulacra/linux/ssimulacra")
        
    if tool_name == "trufor":
        return str(base / "trufor") # It's a python script folder usually?
        
    return str(base / tool_name)

def get_exiftool_path() -> str:
    return get_tool_path("exiftool")
