import os
import cairosvg


os.chdir("logos-raw")

for file in os.listdir("."):
    if file.endswith("svg"):
        name = file.split(".svg")[0]
        print(name)
        cairosvg.svg2png(
            url=name + ".svg",
            write_to=name + ".png",
            parent_height=1024,
            parent_width=1024,
            dpi=1000,
            unsafe=True,
        )
        os.remove(file)
