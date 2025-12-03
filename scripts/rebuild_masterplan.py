import os
import re

def get_block_files():
    files = [f for f in os.listdir('.') if os.path.isfile(f) and f.startswith('BLOCK') and f.endswith('.md')]
    # Parse version numbers for sorting
    # BLOCKxx.x or BLOCKxx.xx
    parsed_files = []
    for f in files:
        match = re.match(r'BLOCK(\d+)\.(\d+)', f)
        if match:
            major = int(match.group(1))
            minor = int(match.group(2))
            parsed_files.append((major, minor, f))
        else:
            # Handle cases like BLOCK07.0 (captured above) or potentially others if pattern varies
            # If strictly BLOCKxx.x, the above regex works.
            # Let's be more robust.
            pass
    
    # Sort by major then minor
    parsed_files.sort()
    return parsed_files

def generate_masterplan_content(files):
    content = [
        "# 📖 MASTERPLAN.md",
        "**Project:** QuantumPoly website",
        "**Owner:** Aykut Aydin (A.I.K)",
        "**Advisor:** Prof. Dr. Esta Willy Armstrong (EWA)",
        "**Last Synced:** 2025-11-26",
        "---",
        "## 🌌 Vision",
        "The QuantumPoly website is more than just a landing page: it is a **showcase for technological excellence** and a **testing ground for AI-supported development**.",
        "Our mission: **Clean code, clear architecture, i18n-ready, accessible, SEO-optimized, secure and transparent.**",
        "---",
        "## 🛠 Project Blocks & Documentation Index",
        ""
    ]
    
    current_major = -1
    
    for major, minor, filename in files:
        if major != current_major:
            content.append("---")
            content.append(f"### **Block Family {major:02d}**")
            current_major = major
            
        # Format the line: - [filename](./filename)
        content.append(f"- [{filename}](./{filename})")
        
    content.append("---")
    content.append("## 📌 Definition of Done")
    content.append("* Clean structure, consistent configurations, no duplicates.")
    content.append("* Modular, tested, i18n-capable components.")
    content.append("* Newsletter flow (frontend + backend) working.")
    content.append("* Compliance pages available, accessible.")
    content.append("* SEO/A11y/Perf ≥ 90 in Lighthouse.")
    content.append("* CI/CD running (preview + staging + prod).")
    content.append("* Documentation: hygiene, i18n, policies, SEO/Perf, CI/CD.")
    content.append("---")
    
    return "\n".join(content)

def main():
    files = get_block_files()
    new_content = generate_masterplan_content(files)
    
    with open('MASTERPLAN.md', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("MASTERPLAN.md rebuilt successfully.")

if __name__ == "__main__":
    main()

