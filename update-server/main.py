import json
import logging
import os
import platform
import threading
import time
from datetime import datetime

import dotenv
import flask
import jsonpickle
import pymongo
import requests
from pytz import utc, timezone
from werkzeug.wsgi import FileWrapper


def customTime(*args):
    utc_dt = utc.localize(datetime.utcnow())
    my_tz = timezone("US/Eastern")
    converted = utc_dt.astimezone(my_tz)
    return converted.timetuple()


logging.Formatter.converter = customTime
dotenv.load_dotenv()

TOKEN = os.getenv('TOKEN')

if platform != 'darwin':
    os.chdir('/')
    logging.basicConfig(
        filename='home/runner/log.txt',
        filemode='a',
        level=logging.INFO,
        format="%(asctime)s %(message)s")
app = flask.Flask(__name__, root_path=os.getcwd())
client = pymongo.MongoClient(
    f'mongodb+srv://leon332157:{os.getenv("PASSWORD")}@cluster0-ysgtf.mongodb.net/test?retryWrites=true&authSource=admin')
db = client['main']
main = db['main']


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
    change_log_list = []
    for each in list(main.find()):
        try:
            change_log_list.append({each['version']: each['change_log']})
        except KeyError:
            continue
    return str(change_log_list)


@app.route('/updates/')
def updates():
    updates_list = []
    for each in list(main.find()):
        try:
            updates_list.append(each['version'])
        except KeyError:
            continue
    return str(updates_list)


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
    download_dict = {}
    for each in list(main.find()):
        try:
            download_dict[each['version']] = jsonpickle.decode(each['file'])
        except KeyError:
            continue
    try:
        return flask.Response(FileWrapper(download_dict[version]), mimetype="application/zip")
    except KeyError:
        return flask.abort(404)


@app.route('/remove_update/<version>')
def delete_release(version):
    token = flask.request.args.get('token', None)
    if not token == TOKEN:
        return flask.abort(403)
    result = main.delete_one({'version': version})
    return str(result.raw_result) + str(result.deleted_count)


@app.route('/check/', methods=['POST', "GET"])
def give_update():
    updates_list = []
    for each in main.find():
        try:
            updates_list.append(each['version'].replace('.', ''))
        except KeyError:
            continue
    updates_list.sort(key=int)
    latest = ".".join(list(updates_list[-1]))
    client_version = flask.request.get_data().decode(
        'utf8').replace('current=', '').replace('.', '')
    change_logs = {}
    for each in list(main.find()):
        try:
            change_logs[each['version']] = each['change_log']
        except KeyError:
            continue
    if client_version < updates_list[-1]:
        try:
            return json.dumps(
                {"last": f'{latest}', "source": f"https://replit-electron-updater.leon332157.repl.co/download/{latest}",
                 "change_log": change_logs[latest]})
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
