import re

def compress_svg_str(svg_str):
    with open("temp.svg", "w") as f:
        f.write(svg_str)

    import subprocess
    subprocess.run(["svgo", "temp.svg"])

    with open("temp.svg", "r") as f:
        return f.read().strip()

print(compress_svg_str('<svg xmlns="http://www.w3.org/2000/svg" width="292.4" height="292.4"><path fill="#f3f4f6" d="M287,197.3L159.3,69.7c-4.7-4.7-12.3-4.7-17,0L5.4,197.3c-4.7,4.7-4.7,12.3,0,17l19.7,19.7c4.7,4.7,12.3,4.7,17,0l108.6-108.6l108.6,108.6c4.7,4.7,12.3,4.7,17,0l19.7-19.7C291.7,209.6,291.7,202,287,197.3z"/></svg>'))
