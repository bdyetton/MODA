__author__ = 'ben'
from pprint import pprint
import os
import csv
import json
cwd = os.path.dirname(os.path.realpath(__file__))
sampleRate = 256
data = {}
imgConfig = {
    'secs': 30,
    'sampleRate': 256,
    'margins': {
        'left': 45,
        'top': 7,
        'bottom': 45,
        'right': 9},
    'img': {
        'h': 338,
        'w': 1148
    },
    'seg': {
        'w': 3,
        'h': None
    },
    'box': {
        'w': None,
        'h': None
    }
}

secPerPx = imgConfig['secs'] / float(imgConfig['img']['w']/ 1000)
mIdx = 0;
with open('metaData.csv', 'r') as csvfile:
    csvReader = csv.reader(csvfile)
    headers = csvReader.next()
    for row in csvReader:
        image = row[headers.index('image')]
        data[image] = {}
        data[image]['start'] = row[headers.index('StartMS')]
        data[image]['end'] = row[headers.index('StopMS')]
        data[image]['prac'] = row[headers.index('PracticeImage')]
        data[image]['noMarkers'] = row[headers.index('NoMarkers')]
        data[image]['stage'] = '2'
        data[image]['gsMarkers'] = [];
        for marker in row[headers.index('GSMarker'):]:
            print(marker[1:-1])
            if len(marker) > 0:
                mParts = marker[1:-1].split(',')
                gsMarker = {}
                print mParts[1].split(':')[1]
                gsMarker['type'] = 'box'
                gsMarker['xSecs'] = float(mParts[0].split(':')[1])
                gsMarker['wSecs'] = float(mParts[1].split(':')[1]) - gsMarker['xSecs']
                gsMarker['x'] = (1/secPerPx)*gsMarker['xSecs']
                gsMarker['w'] = (1/secPerPx)*gsMarker['wSecs']
                gsMarker['conf'] = mParts[2].split(':')[1]
                gsMarker['deleted'] = 'false'
                gsMarker['markerIndex'] = mIdx
                mIdx += 1
                gsMarker['gs'] = 'true'
                data[image]['gsMarkers'].append(gsMarker)

with open('../app/Assets/metaData.json', 'wb') as fp:
    pprint(data)
    json.dump(data, fp)
csvfile.close()
fp.close()
