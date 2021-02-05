import os
import json
import base64


known = json.load(open('known.json'))
langs = {}
for each in known:
    # print(each)
    link = each["icon"]
    # print(link)
    langs[each['name']] = link.split("/")[-1].replace(".svg", "").replace(".png", "")

langs["css"] = "css"
langs["html"] = "html"
langs["h++"] = "h++"
langs["h"] = "h"

for key, value in langs.items():
    if value == "deno-no-transparent":
        langs[key] = "deno"

for key, value in langs.items():
    matches = [f for f in os.listdir("langs") if f.startswith(value)]
    if len(matches) == 0:
        print(f"{value} is missing")

json.dump(langs, open("langs.json", "w"))
