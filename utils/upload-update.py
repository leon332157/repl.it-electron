import io
import json
import logging
import os
import zipfile

import dotenv
import jsonpickle
import pymongo

dotenv.load_dotenv('update-server/.env')
TOKEN = os.getenv('TOKEN')
logging.basicConfig(level=logging.INFO)
client = pymongo.MongoClient(
    f'mongodb+srv://leon332157:{os.getenv("PASSWORD")}@electron-updater-ysgtf.azure.mongodb.net/test?retryWrites=true')
print('Connected')
db = client['main']
main = db['main']

print('Input change log:')
lines = []
while True:
    try:
        line = input()
    except EOFError:
        break
    lines.append(line)
print(lines)
change_log = '\n'.join(lines)
version = json.load(open('src/package.json'))['version']
update = zipfile.ZipFile(f'pre-dist/{version}.zip', 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9)
update.write('pre-dist/repl.it-win32-ia32/resources/app.asar', arcname='app.asar')
update.close()

file = io.BytesIO(open(f'pre-dist/{version}.zip', 'rb').read())
print('Deleted Count:', main.delete_many({'version': version}).deleted_count)
main.insert_one({'version': version, 'change_log': change_log, 'file': jsonpickle.encode(file)})
# # os.remove(f'pre-distribute/{version}.zip')
