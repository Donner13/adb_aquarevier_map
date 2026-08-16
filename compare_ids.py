import re

def get_ids(filename):
    with open(filename, 'r') as f:
        content = f.read()
    # Find all id="..." or id='...'
    ids = re.findall(r'id=["\']([^"\']+)["\']', content)
    return set(ids)

index_ids = get_ids('index.html')
internal_ids = get_ids('internal.html')

print("IDs in index.html but not in internal.html:")
for x in sorted(index_ids - internal_ids):
    print(x)

print("\nIDs in internal.html but not in index.html:")
for x in sorted(internal_ids - index_ids):
    print(x)
