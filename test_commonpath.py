import os
def is_safe_path(basedir, path, follow_symlinks=True):
    # resolves symbolic links
    if follow_symlinks:
        matchpath = os.path.realpath(path)
    else:
        matchpath = os.path.abspath(path)
    return basedir == os.path.commonpath((basedir, matchpath))

basedir = os.path.realpath(os.getcwd())
safe = is_safe_path(basedir, os.path.join(basedir, "etc", "passwd"))
print("Safe inside:", safe)
safe = is_safe_path(basedir, "/etc/passwd")
print("Safe outside:", safe)
