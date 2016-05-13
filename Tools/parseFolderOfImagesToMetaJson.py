__author__ = 'ben'
from pprint import pprint
import os
import json
from os import walk
cwd = os.path.dirname(os.path.realpath(__file__))
sampleRate = 256
data = {}
imgConfig = {
    'secs': 25,
    'sampleRate': 256,
    'margins': {
        'left': 70.0,
        'top': 7,
        'bottom': 45,
        'right': 9},
    'img': {
        'h': 90,
        'w': 900.0
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

secPerPx = imgConfig['secs'] / float(imgConfig['img']['w'])

mypath = '../build/img/low_dpi'
numImgPerBatch = 5
data['meta'] = {'numBatchs':10}
for (dirpath, dirnames, filenames) in walk(mypath):
    break

for image in filenames:
    [e, b, u1, u2, u3, smp] = image.split('-')
    [smp, u4] = smp.split('.')

    batch = int(b[1:])
    if batch not in data:
        data[batch] = {}
        data[batch]['imgs'] = {}
        data[batch]['idx'] = 0
    idx = int(e[1:]) % numImgPerBatch
    if idx not in data[batch]:
        data[batch]['imgs'][idx] = {}
    data[batch]['imgs'][idx]['epoch'] = int(e[1:])
    data[batch]['imgs'][idx]['idx'] = int(e[1:]) % numImgPerBatch
    data[batch]['imgs'][idx]['filename'] = image
    data[batch]['imgs'][idx]['start'] = int(smp[3:])
    data[batch]['imgs'][idx]['end'] = int(smp[3:]) + 25*1000
    data[batch]['imgs'][idx]['stage'] = 2
    data[batch]['imgs'][idx]['gsMarkers'] = []
    data[batch]['imgs'][idx]['markers'] = []
    data[batch]['imgs'][idx]['noMarkers'] = False
    data[batch]['imgs'][idx]['prac'] = False
    data[batch]['imgs'][idx]['id'] = 'phase1_prac'


    # for marker in row[headers.index('GSMarker'):]:
    #     print(marker[1:-1])
    #     if len(marker) > 0:
    #         mParts = marker[1:-1].split(',')
    #         gsMarker = {}
    #         print mParts[1].split(':')[1]
    #         gsMarker['type'] = 'box'
    #         gsMarker['xSecs'] = float(mParts[0].split(':')[1])/1000
    #         gsMarker['wSecs'] = (float(mParts[1].split(':')[1]) - float(mParts[0].split(':')[1]))/1000
    #         gsMarker['x'] = ((1/secPerPx)*gsMarker['xSecs'])+(imgConfig['margins']['left'])
    #         gsMarker['w'] = (1/secPerPx)*gsMarker['wSecs']
    #         gsMarker['conf'] = mParts[2].split(':')[1]
    #         gsMarker['deleted'] = 'false'
    #         gsMarker['markerIndex'] = mIdx
    #         mIdx += 1
    #         gsMarker['gs'] = 'true'
    #         data[image]['gsMarkers'].append(gsMarker)

with open('../app/Assets/metaData.json', 'wb') as fp:
    pprint(data)
    json.dump(data, fp)
fp.close()
