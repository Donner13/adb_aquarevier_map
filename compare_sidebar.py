from html.parser import HTMLParser

class MyHTMLParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.elements = []

    def handle_starttag(self, tag, attrs):
        attr_dict = dict(attrs)
        if 'id' in attr_dict:
            self.elements.append(f"<{tag} id='{attr_dict['id']}'>")
        if 'class' in attr_dict:
            self.elements.append(f"<{tag} class='{attr_dict['class']}'>")

def get_structure(filename):
    with open(filename, 'r') as f:
        content = f.read()
    parser = MyHTMLParser()
    parser.feed(content)
    return parser.elements

# Actually, I can just grep for certain keywords or visually inspect.
