with open("server.py", "r") as f:
    content = f.read()

content = content.replace("self.send_header('Vary', 'Origin')", "self.send_header('Vary', 'Origin')\n")

with open("server.py", "w") as f:
    f.write(content)
