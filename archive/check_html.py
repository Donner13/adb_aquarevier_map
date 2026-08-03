import html.parser
import sys

with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

# Check for unclosed tags or syntax errors in index.html
class SimpleHTMLParser(html.parser.HTMLParser):
    def handle_error(self, message):
        print("HTML Error:", message)
        sys.exit(1)

parser = SimpleHTMLParser()
try:
    parser.feed(content)
    print("HTML syntax is valid.")
except Exception as e:
    print("HTML Parse Error:", e)
    sys.exit(1)
