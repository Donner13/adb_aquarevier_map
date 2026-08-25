with open('index.html', 'r') as f:
    content = f.read()

# Let's count SVG elements in logoHtml strings.
print("Count of <svg in index.html:", content.count('<svg'))
