import re

with open('internal.html', 'r') as f:
    text = f.read()

text = text.replace('<button class="embed-modal-close" id="embed-close-btn">&times;</button>', '<button class="embed-modal-close" id="embed-close-btn" aria-label="Schließen">&times;</button>')

with open('internal.html', 'w') as f:
    f.write(text)
