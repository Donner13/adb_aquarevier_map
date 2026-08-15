import re
from html.parser import HTMLParser

class MyParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.classes = []
    def handle_starttag(self, tag, attrs):
        for attr in attrs:
            if attr[0] == 'id':
                self.ids.append(attr[1])
            elif attr[0] == 'class':
                self.classes.append(attr[1])

with open("index.html") as f:
    p1 = MyParser()
    p1.feed(f.read())

with open("internal.html") as f:
    p2 = MyParser()
    p2.feed(f.read())

print("IDs in index.html but not in internal.html:")
for i in set(p1.ids) - set(p2.ids):
    print(i)

print("\nIDs in internal.html but not in index.html:")
for i in set(p2.ids) - set(p1.ids):
    print(i)
