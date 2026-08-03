import os

for f in ['filter_logic.js']:
    if os.path.exists(f):
        with open(f, 'r') as file:
            content = file.read()

        content = content.replace("btn.classList.add('active');", "btn.classList.add('active'); btn.classList.remove('inactive'); btn.setAttribute('aria-pressed', 'true');")
        content = content.replace("btn.classList.remove('active');", "btn.classList.remove('active'); btn.classList.add('inactive'); btn.setAttribute('aria-pressed', 'false');")

        with open(f, 'w') as file:
            file.write(content)
