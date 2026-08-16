import re

def get_ids(filename):
    with open(filename, 'r') as f:
        content = f.read()
    ids = re.findall(r'id=["\']([^"\']+)["\']', content)
    return set(ids)

index = get_ids('index.html')
internal = get_ids('internal.html')

diff = index - internal
print("Missing in internal.html:", diff)
