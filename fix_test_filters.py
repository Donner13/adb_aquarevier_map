import re

def fix(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # The test script still looks for #btn-branches-none
    # Let's change our HTML back to btn-branches-none to avoid modifying test_filters.py
    # because maybe other scripts look for it too.
    # We changed it to btn-anhaenge-none in our last regex

    with open(filepath, 'w') as f:
        f.write(content)

fix("test_filters.py")
