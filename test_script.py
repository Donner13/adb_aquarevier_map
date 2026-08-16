import re

with open('index.html', 'r') as f:
    index = f.read()

with open('internal.html', 'r') as f:
    internal = f.read()

index_ids = set(re.findall(r'id=["\']([^"\']+)["\']', index))
internal_ids = set(re.findall(r'id=["\']([^"\']+)["\']', internal))

missing_in_internal = index_ids - internal_ids
print("Missing in internal.html:", missing_in_internal)

missing_in_index = internal_ids - index_ids
# print("Missing in index.html:", missing_in_index)
