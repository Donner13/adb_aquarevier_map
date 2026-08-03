import os

extensions = ('.png', '.jpg', '.jpeg', '.svg', '.gif')
images = []
for root, dirs, files in os.walk('.'):
    for file in files:
        if file.lower().endswith(extensions):
            images.append(os.path.join(root, file))

print("Found image files:")
for img in images:
    print("-", img)
