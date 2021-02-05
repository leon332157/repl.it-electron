from PIL import Image
import os

os.chdir("langs")

for file in os.listdir("."):
    if file.endswith("png"):
        im = Image.open(file)
        if im.size[0] < 512 or im.size[1] < 512:
            print(file)
            resized = im.resize((512, 512), resample=Image.LANCZOS)
            resized.save(file)
            # resized.save(file.strip('.png')+'rezised.png')
