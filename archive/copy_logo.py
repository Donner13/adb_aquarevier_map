import shutil
import os

src = r"C:\Users\user\.gemini\antigravity-ide\brain\5c421689-8724-4698-9972-44ff47bcc023\media__1783404162929.png"
dst = r"c:\Users\user\.gemini\antigravity-ide\scratch\contact_map\isa_iww_fiw.png"

if os.path.exists(src):
    shutil.copy(src, dst)
    print("SUCCESS: Copied logo crop to contact_map/isa_iww_fiw.png")
else:
    print("ERROR: Source file not found:", src)
