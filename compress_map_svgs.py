with open('index.html', 'r') as f:
    content = f.read()

def compress_svg_str(svg_str):
    with open("temp.svg", "w") as f:
        f.write(svg_str)

    import subprocess
    subprocess.run(["svgo", "temp.svg"])

    with open("temp.svg", "r") as f:
        return f.read().strip()

# Look for: <svg width="${sizeX}" height="${sizeY}" style="position: absolute; left: 0; top: 0; pointer-events: none; overflow: visible;">
# It only contains line, circle, polygon
# We can just let it be, but wait, those are not static svgs. They have template literals. So SVGO will fail or mess them up if we pass it directly.
