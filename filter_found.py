import os

extensions = ('.png', '.jpg', '.jpeg', '.svg', '.gif')
search_paths = [
    "C:\\Users\\user\\Downloads",
    "C:\\Users\\user\\Desktop",
    "C:\\Users\\user\\.gemini\\antigravity-ide\\scratch",
    "G:\\Meine Ablage\\Antigravity"
]

keywords = ['fiw', 'isa', 'iww', 'wver', 'schoellershammer', 'smurfit', 'tillmann', 'rlv', 'eschweiler', 'aquarevier']

found = []
for path in search_paths:
    if os.path.exists(path):
        for root, dirs, files in os.walk(path):
            if any(x in root for x in ['node_modules', '.git', 'Archive', 'backups']):
                continue
            for file in files:
                if file.lower().endswith(extensions):
                    file_lower = file.lower()
                    if any(kw in file_lower for kw in keywords):
                        found.append(os.path.join(root, file))

print(f"Filtered image matches ({len(found)}):")
for f in found:
    print("-", f)
