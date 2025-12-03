import os

# Define replacements mapping
replacements = {
    "BLOCK4.2_": "BLOCK04.2_",
    "BLOCK4.3_": "BLOCK04.3_",
    "BLOCK4.4_": "BLOCK04.4_",
    "BLOCK5.8_": "BLOCK05.8_",
    "BLOCK6.1_": "BLOCK06.1_",
    "BLOCK6.2_": "BLOCK06.2_",
    "BLOCK6.3_": "BLOCK06.3_",
    "BLOCK7_": "BLOCK07.0_",
    "BLOCK8_READINESS": "BLOCK08.0_READINESS",
    "BLOCK8_TRANSITION": "BLOCK08.0_TRANSITION",
    "BLOCK8.7_": "BLOCK08.7_",
    "BLOCK8.8_": "BLOCK08.8_",
    "BLOCK9.0_": "BLOCK09.0_",
    "BLOCK9.1_": "BLOCK09.1_",
    "BLOCK9.2_": "BLOCK09.2_",
    "BLOCK9.3_": "BLOCK09.3_",
    "BLOCK9.4_": "BLOCK09.4_",
    "BLOCK9.5_": "BLOCK09.5_",
    "BLOCK9.6_": "BLOCK09.6_",
    "BLOCK9.7_": "BLOCK09.7_",
    "BLOCK9.8_": "BLOCK09.8_",
    "BLOCK9.9_": "BLOCK09.9_",
    "BLOCK_C_": "BLOCK10.10_",
    "BLOCK5_FINAL_DELIVERY_REPORT": "BLOCK05.8_FINAL_DELIVERY_REPORT",
    "B120_ROADMAP_STAGE_VIII": "BLOCK12.0_ROADMAP_STAGE_VIII",
    "B131_ANNUAL_REPORT_TEMPLATE": "BLOCK13.1_ANNUAL_REPORT_TEMPLATE",
    "B132_SYMPOSIUM_BLUEPRINT": "BLOCK13.2_SYMPOSIUM_BLUEPRINT",
    "BLOCK10.1.1": "BLOCK10.11",
    "BLOCK10.6.1": "BLOCK10.12",
    "BLOCK12.2.1": "BLOCK12.3",
    "docs/governance/BLOCK_C_AUTONOMOUS_OPS.md": "docs/governance/BLOCK10.10_AUTONOMOUS_OPS.md"
}

def update_file_content(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        new_content = content
        for old, new in replacements.items():
            new_content = new_content.replace(old, new)
        
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated references in {filepath}")
            
    except Exception as e:
        print(f"Error processing {filepath}: {e}")

def main():
    # Walk through all files in the current directory and subdirectories
    for root, dirs, files in os.walk("."):
        # Skip .git directory and node_modules
        if ".git" in dirs:
            dirs.remove(".git")
        if "node_modules" in dirs:
            dirs.remove("node_modules")
            
        for file in files:
            if file.endswith(".md"):
                filepath = os.path.join(root, file)
                update_file_content(filepath)

if __name__ == "__main__":
    main()

