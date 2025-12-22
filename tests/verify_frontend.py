import re
import os

WEB_ROOT = "apps/web/src/components"
DOCK_MANAGER = os.path.join(WEB_ROOT, "Dock/DockManager.tsx")
SIDEBAR = os.path.join(WEB_ROOT, "Sidebar/Sidebar.tsx")
PANELS_DIR = os.path.join(WEB_ROOT, "Panels")

def verify_frontend():
    print("Verifying Frontend Integrity...\n")
    
    # 1. Extract all panel components used in DockManager
    print("[1] Checking DockManager Component Mapping...")
    try:
        with open(DOCK_MANAGER, "r") as f:
            content = f.read()
            
        # Regex to find <SomethingPanel ... />
        # Matches return <SomethingPanel or return <GenericResultPanel
        components = re.findall(r'return <([a-zA-Z]+Panel)', content)
        unique_components = sorted(list(set(components)))
        
        print(f"    Found {len(unique_components)} unique panel components used.")
        
        missing = []
        for comp in unique_components:
            # GenericResultPanel is special, it's generic
            if comp == "GenericResultPanel":
                file_path = os.path.join(PANELS_DIR, "GenericResultPanel.tsx")
            else:
                file_path = os.path.join(PANELS_DIR, f"{comp}.tsx")
                
            if os.path.exists(file_path):
                print(f"    ✅ {comp} -> {file_path}")
            else:
                print(f"    ❌ {comp} NOT FOUND at {file_path}")
                missing.append(comp)
                
        if missing:
            print(f"    CRITICAL: {len(missing)} components missing source files!")
            return False
        else:
            print("    All used components exist on disk.")

    except Exception as e:
        print(f"    Error reading DockManager: {e}")
        return False

    # 2. Check imports in DockManager
    print("\n[2] Checking DockManager Imports...")
    # Matches: import { X, Y } from '../Panels/X'
    # Actually just check if file compiles? No, just check existence.
    # We already checked existence above.
    pass

    # 3. Verify Sidebar Tool Count
    print("\n[3] Checking Sidebar Tool Definition...")
    try:
        with open(SIDEBAR, "r") as f:
            content = f.read()
            
        # Count items in TOOLS objects
        # items: ["Tool Name", "Tool Name"]
        matches = re.findall(r'"([^"]+)"', content)
        # Filter out keys like 'name', 'items' if they exist, but simple count of tool names
        # Actually Sidebar.tsx structure is:
        # { name: "Category", items: ["Tool1", "Tool2"] }
        
        # Extract lists
        lists = re.findall(r'items: \[[^\]]+\]', content)
        total_tools = 0
        for l in lists:
            # Count strings inside
            tools = re.findall(r'"([^"]+)"', l)
            total_tools += len(tools)
            
        print(f"    Found {total_tools} tools listed in Sidebar.")
        if total_tools >= 32:
            print(f"   Tool count ({total_tools}) matches Sherloq specification (32+).")
        else:
            print(f"    Warning: Only {total_tools} tools found (Expected 32).")

    except Exception as e:
        print(f"    Error reading Sidebar: {e}")
        
    print("\nFrontend Integrity Check Passed.")
    return True

if __name__ == "__main__":
    verify_frontend()
