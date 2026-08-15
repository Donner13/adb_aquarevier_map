import re

with open('index.html', 'r') as f:
    c = f.read()

m = re.search(r'(        /\* Embed Modal \*/.*?)(        /\* Header \*/)', c, re.DOTALL)
if m:
    modal_css = m.group(1).rstrip()

    with open('internal.html', 'r') as f:
        ic = f.read()

    if '#embed-modal {' not in ic:
        s = ic.find('</style>')
        ic = ic[:s] + "\n" + modal_css + "\n    " + ic[s:]
        with open('internal.html', 'w') as f:
            f.write(ic)
        print("Modal CSS injected.")
    else:
        print("Modal CSS already exists.")
else:
    print("Could not find Modal CSS.")
