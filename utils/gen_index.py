import os

fold = os.getcwd()
if not fold.split(os.path.sep)[-1] == 'src':
    print('Please use this in src folder.')
    exit(1)
for folder in os.listdir(os.getcwd()):
    if not os.path.isdir(folder) or not folder.startswith('electron'):
        continue
    scripts = []

    for each in os.listdir(folder):
        if each == 'index.js':
            continue
        scripts.append(each.split('.')[0])
    scripts.sort()

    with open(os.path.join(folder, 'index.js'), 'w') as f:
        f.write("const path = require('path');\n\n")
        for each in scripts:
            f.write(f"exports.{each} = require(path.resolve(__dirname,'{each}'));\n\n")
