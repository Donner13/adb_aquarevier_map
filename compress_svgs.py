import subprocess
import os

for filename in os.listdir("logos"):
    if filename.endswith(".svg"):
        filepath = os.path.join("logos", filename)
        # We can use svgo if available
        pass
