import re

def parse_html(filename):
    with open(filename, 'r') as f:
        content = f.read()

    # Find the dark-theme CSS block
    match = re.search(r'body\.dark-theme\s*\{([^}]+)\}', content)
    if match:
        block = match.group(1)
        # find variables inside
        for line in block.split('\n'):
            line = line.strip()
            if line.startswith('--'):
                print(line)

parse_html('index.html')
