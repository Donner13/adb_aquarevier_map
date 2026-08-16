with open('tests/ui-regression/popup-sanitizer.spec.js', 'r') as f:
    content = f.read()

content = content.replace("test.fail(true, 'Popup sanitization is currently missing');", "// test.fail(true, 'Popup sanitization is currently missing');")

with open('tests/ui-regression/popup-sanitizer.spec.js', 'w') as f:
    f.write(content)
