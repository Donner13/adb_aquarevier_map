import os

extensions = ('.png', '.jpg', '.jpeg', '.svg', '.gif')
keywords = ['wver', 'schoellershammer', 'smurfit', 'tillmann', 'rlv', 'eschweiler', 'fiw', 'isa', 'iww', 'logo']

found_files = []

# Search G:\Meine Ablage\Antigravity
drive_path = "G:\\Meine Ablage\\Antigravity"
if os.path.exists(drive_path):
    print("Searching Google Drive path...")
    for root, dirs, files in os.walk(drive_path):
        # Skip some folders to avoid slow walks
        if any(x in root for x in ['.git', 'node_modules', 'Archive']):
            continue
        for file in files:
            if file.lower().endswith(extensions):
                file_lower = file.lower()
                if any(kw in file_lower for kw in keywords):
                    found_files.append(os.path.join(root, file))
else:
    print("Google Drive path not found.")

# Search current directory
print("Searching current workspace...")
for root, dirs, files in os.walk('.'):
    for file in files:
        if file.lower().endswith(extensions):
            file_lower = file.lower()
            if any(kw in file_lower for kw in keywords):
                found_files.append(os.path.abspath(os.path.join(root, file)))

print("\nFound image files:")
for f in found_files[:50]:
    print("-", f)
