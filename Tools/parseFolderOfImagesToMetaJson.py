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
data['numBatches'] = 10
data['imgPerSet'] = 10
data['batchPerSet'] = 2
data['imgPerBatch'] = 5
for (dirpath, dirnames, filenames) in walk(mypath):
    break

for image in filenames:
    [e, b, u1, u2, u3, smp] = image.split('-')
    [smp, u4] = smp.split('.')

    batch = int(b[1:])-1
    if batch not in data:
        data[batch] = {}
        data[batch]['imgs'] = {}
        data[batch]['idx'] = 1
    idx = int(e[1:]) % numImgPerBatch
    if idx not in data[batch]:
        data[batch]['imgs'][idx] = {}
    data[batch]['imgs'][idx]['epoch'] = int(e[1:])
    data[batch]['imgs'][idx]['idx'] = idx
    data[batch]['imgs'][idx]['filename'] = image
    data[batch]['imgs'][idx]['start'] = int(smp[3:])
    data[batch]['imgs'][idx]['end'] = int(smp[3:]) + 25*1000
    data[batch]['imgs'][idx]['stage'] = 2
    data[batch]['imgs'][idx]['subID'] = u1 + '-' + u2 + '-' + u3
    data[batch]['imgs'][idx]['gsMarkers'] = []
    data[batch]['imgs'][idx]['markers'] = []
    data[batch]['imgs'][idx]['noMarkers'] = False
    data[batch]['imgs'][idx]['prac'] = False
    data[batch]['imgs'][idx]['id'] = 'phase1_prac'

with open('../app/Assets/metaData.json', 'wb') as fp:
    pprint(data)
    json.dump(data, fp)
fp.close()
