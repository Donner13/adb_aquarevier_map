with open("index.html", "r") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "svg" in line and "http" in line and "w3.org" in line and "xmlns" in line:
        pass # print(f"{i+1}: {line.strip()}")
