import os

extensions = ('.png', '.jpg', '.jpeg', '.svg', '.gif')
search_paths = [
    "C:\\Users\\user\\Downloads",
    "C:\\Users\\user\\Desktop",
    "C:\\Users\\user\\Documents",
    "C:\\Users\\user\\.gemini\\antigravity-ide\\scratch"
]

found = []
for path in search_paths:
    if os.path.exists(path):
        print(f"Searching {path}...")
        for root, dirs, files in os.walk(path):
            if any(x in root for x in ['node_modules', '.git']):
                continue
            for file in files:
                if file.lower().endswith(extensions):
                    found.append(os.path.join(root, file))

print(f"\nFound {len(found)} image files:")
for f in found[:100]:
    print("-", f)
