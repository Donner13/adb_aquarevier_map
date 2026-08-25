with open('index.html', 'r') as f:
    content = f.read()

# Replace the first arrow
old_arrow1 = "data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23f3f4f6%22%20d%3D%22M287%2C197.3L159.3%2C69.7c-4.7-4.7-12.3-4.7-17%2C0L5.4%2C197.3c-4.7%2C4.7-4.7%2C12.3%2C0%2C17l19.7%2C19.7c4.7%2C4.7%2C12.3%2C4.7%2C17%2C0l108.6-108.6l108.6%2C108.6c4.7%2C4.7%2C12.3%2C4.7%2C17%2C0l19.7-19.7C291.7%2C209.6%2C291.7%2C202%2C287%2C197.3z%22%2F%3E%3C%2Fsvg%3E"
new_arrow1 = "data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23f3f4f6%22%20d%3D%22M287%20197.3%20159.3%2069.7c-4.7-4.7-12.3-4.7-17%200L5.4%20197.3c-4.7%204.7-4.7%2012.3%200%2017L25.1%20234c4.7%204.7%2012.3%204.7%2017%200l108.6-108.6L259.3%20234c4.7%204.7%2012.3%204.7%2017%200l19.7-19.7c-4.3-4.7-4.3-12.3-9-17%22/%3E%3C/svg%3E"
content = content.replace(old_arrow1, new_arrow1)

# Replace the second arrow
old_arrow2 = "data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%230f172a%22%20d%3D%22M287%2C197.3L159.3%2C69.7c-4.7-4.7-12.3-4.7-17%2C0L5.4%2C197.3c-4.7%2C4.7-4.7%2C12.3%2C0%2C17l19.7%2C19.7c4.7%2C4.7%2C12.3%2C4.7%2C17%2C0l108.6-108.6l108.6%2C108.6c4.7%2C4.7%2C12.3%2C4.7%2C17%2C0l19.7-19.7C291.7%2C209.6%2C291.7%2C202%2C287%2C197.3z%22%2F%3E%3C%2Fsvg%3E"
new_arrow2 = "data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%230f172a%22%20d%3D%22M287%20197.3%20159.3%2069.7c-4.7-4.7-12.3-4.7-17%200L5.4%20197.3c-4.7%204.7-4.7%2012.3%200%2017L25.1%20234c4.7%204.7%2012.3%204.7%2017%200l108.6-108.6L259.3%20234c4.7%204.7%2012.3%204.7%2017%200l19.7-19.7c-4.3-4.7-4.3-12.3-9-17%22/%3E%3C/svg%3E"
content = content.replace(old_arrow2, new_arrow2)

with open('index.html', 'w') as f:
    f.write(content)
