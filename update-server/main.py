import base64
import io
import json
import logging
import os
import platform
import threading
import time
import traceback
from datetime import datetime

import dotenv
import flask
import json_store_client
import jsonpickle
import requests
from pytz import utc, timezone


def customTime(*args):
    utc_dt = utc.localize(datetime.utcnow())
    my_tz = timezone("US/Eastern")
    converted = utc_dt.astimezone(my_tz)
    return converted.timetuple()


logging.Formatter.converter = customTime
dotenv.load_dotenv()

TOKEN = os.getenv('TOKEN')
JSON_STORE_TOKEN = os.getenv('JSON_STORE_TOKEN')
client = json_store_client.Client(JSON_STORE_TOKEN)
if platform != 'darwin':
    os.chdir('/')
    logging.basicConfig(
        filename='home/runner/log.txt',
        filemode='a',
        level=logging.INFO,
        format="%(asctime)s %(message)s")
changelog = client.retrieve('change_log')
files = jsonpickle.decode(client.retrieve('files'))
app = flask.Flask(__name__, root_path=os.getcwd())


@app.route('/')
def index():
    return '\n'.join(os.listdir('home/runner/'))


@app.route('/log.txt/')
@app.route('/log')
def log():
    try:
        return flask.send_file('home/runner/log.txt')
    except OSError as e:
        return str(e)


@app.route('/changelog')
def show_change_log():
    return str(changelog)


@app.route('/updates/')
def updates():
    return str(files.keys())


@app.route('/release', methods=['POST'])
def add_release():
    token = flask.request.args.get('token', None)
    version = flask.request.args.get('version', None)
    if not token == TOKEN or not version:
        return flask.abort(403)
    change_log = flask.request.args.get('change_log', None)
    changelog[version] = base64.urlsafe_b64decode(change_log).decode('utf8')
    client.save(changelog, json.dumps(changelog))
    f = flask.request.files['file']
    files[version] = jsonpickle.encode(io.BytesIO(f.stream))
    try:
        client.save('files', json.dumps(files))
    except json_store_client.JsonstoreError:
        return traceback.format_exc()
    return 'Success'


@app.route('/clear_log')
@app.route('/refresh_log')
def clear_log():
    token = flask.request.args.get('token', None)
    if not token == TOKEN:
        return flask.abort(403)
    open(os.getcwd() + 'home/runner/log.txt', 'w').close()
    return 'Success'


@app.route('/download/<version>')
def download(version):
    try:
        return flask.send_file(files[version])
    except KeyError:
        return flask.abort(404)


@app.route('/remove_update/<version>')
def delete_release(version):
    token = flask.request.args.get('token', None)
    if not token == TOKEN:
        return flask.abort(403)
    try:
        files.pop(version)
        client.save('files', files)
    except KeyError:
        return flask.abort(404)
    return 'Success remove ' + version


@app.route('/check/', methods=['POST', "GET"])
def give_update():
    updates_list = []
    for each in files.keys():
        updates_list.append(each)
    updates_list.sort(key=int)
    latest = ".".join(list(updates_list[-1]))
    client_version = flask.request.get_data().decode(
        'utf8').replace('current=', '').replace('.', '')
    if client_version < updates_list[-1]:
        try:
            return json.dumps(
                {"last": f'{latest}', "source": f"https://replit-electron-updater.leon332157.repl.co/download/{latest}",
                 "change_log": json.load(client.get('change_log'))[latest]})
        except KeyError:
            return json.dumps(
                {"last": f'{latest}', "source": f"https://replit-electron-updater.leon332157.repl.co/download/{latest}"})
    else:
        return json.dumps({"last": f'{latest}', "source": False})


@app.route('/ping_google/')
def google():
    return 'Google'


@app.route('/ping/')
def ping():
    return 'ping'


@app.route('/favicon.ico')
def favicon():
    return flask.send_file(os.getcwd() + 'home/runner/logo.png')


def ping_myself():
    while True:
        requests.get(
            'https://replit-electron-updater.leon332157.repl.co/ping/')
        time.sleep(300)


thread = threading.Thread(target=ping_myself)
thread.start()
app.run(host='0.0.0.0', port=3430)
