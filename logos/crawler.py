# import json
# from bs4 import BeautifulSoup as bs
import requests
import json
import base64

STRING = open('langs.txt','rb').read()
known = json.loads(base64.b64decode(STRING))

for each in known:
    print(each)
    link = known[each]['icon']
    if link.startswith('/'):
        link = 'https://repl.it'+link
    content = requests.get(f'{link}', headers={
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:64.0) Gecko/20100101 Firefox/64.0 '}).content
    #print(content)
    with open(f'logos-raw/{link.split("/")[-1].replace("?", "")}', 'wb') as f:
        f.write(content)
