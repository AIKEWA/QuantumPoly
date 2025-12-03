import os

FOOTER = """
---

**Version:** 1.0
**Last Reviewed:** 2025-11-25
**Reviewed By:** EWA
"""

def append_footer(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if footer already exists (checking a unique part of it)
        if "**Reviewed By:** EWA" in content and "**Last Reviewed:** 2025-11-25" in content:
            print(f"Footer already present in {filepath}")
            return

        # Ensure we start on a new line if the file doesn't end with one
        if not content.endswith('\n'):
            content += '\n'
            
        with open(filepath, 'a', encoding='utf-8') as f:
            f.write(FOOTER)
        print(f"Appended footer to {filepath}")
            
    except Exception as e:
        print(f"Error processing {filepath}: {e}")

def main():
    # Walk through all files in the current directory (root only as per "BLOCK*.md" usually implies root for these reports, 
    # but the plan said "Scan the root directory (/) recursively... Extract block identifiers... Append metadata footer to every block file")
    # I will stick to the root directory for BLOCK*.md files as per the file list I saw earlier.
    # Actually, all BLOCK*.md files seem to be in the root. 
    
    files = [f for f in os.listdir('.') if os.path.isfile(f) and f.startswith('BLOCK') and f.endswith('.md')]
    
    for file in files:
        filepath = os.path.join('.', file)
        append_footer(filepath)
        
    # Also check if there are BLOCK files in subdirectories?
    # The `list_dir` output showed they are mostly in root. 
    # But let's look for any BLOCK*.md recursively just in case.
    for root, dirs, files in os.walk("."):
        if ".git" in dirs:
            dirs.remove(".git")
        if "node_modules" in dirs:
            dirs.remove("node_modules")
            
        for file in files:
            if file.startswith("BLOCK") and file.endswith(".md"):
                # Avoid processing the same file twice if I iterate root separately (which I did above).
                # But os.walk includes root. So I should just use os.walk.
                filepath = os.path.join(root, file)
                # I'll just use the logic here.
                append_footer(filepath)

if __name__ == "__main__":
    main()

