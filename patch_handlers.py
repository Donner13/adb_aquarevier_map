with open('js/layers-loader.js', 'r', encoding='utf-8') as f:
    content = f.read()

target = ".replace(/&#039;/g, \"\\\\'\")"
replacement = ".replace(/\\\\\\\\/g, \"\\\\\\\\\\\\\\\\\").replace(/&#039;/g, \"\\\\'\")"

# Wait, `escapeHtml` escapes &, <, >, ", '. It does not escape backslash.
# We need backslash escaping so user input like `\'` does not become `\\'` after our replace, causing syntax error.
# So we must replace `\` with `\\` BEFORE handling quotes.

new_content = content.replace(target, r'.replace(/\\/g, "\\\\").replace(/&#039;/g, "\\\'")')

with open('js/layers-loader.js', 'w', encoding='utf-8') as f:
    f.write(new_content)
