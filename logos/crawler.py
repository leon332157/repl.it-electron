import json
import base64
import requests

ses = requests.Session()
ses.headers.update({
    "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:64.0) Gecko/20100101 Firefox/64.0 "
})
known = ses.get('https://eval.repl.it/languages').json()

for each in known:
    #print(each)
    link = each["icon"]
    link = "https://repl.it" + link if link.startswith("/") else link

    content = ses.get(f"{link}").content
    # print(content)
    try:
        with open(f'logos-raw/{link.split("/")[-1].replace("?", "")}', "wb") as f:
            f.write(content)
    except OSError as e:
        print(e)
with open('known.json', 'w') as f:
    json.dump(known, f)
