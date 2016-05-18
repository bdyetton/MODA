__author__ = 'ben'
from pprint import pprint
import os
import json
from os import walk


data = {}

# mypath = '../build/img/low_dpi'
# data['batchMeta'] = {
#     'numBatches':10,
#     'imgPerSet':10,
#     'batchPerSet':2,
#     'imgPerBatch':5,
# }

mypath = '../build/img/test'
data['batchMeta'] = {
    'numBatches':1,
    'imgPerSet':5,
    'batchPerSet':1,
    'imgPerBatch':5,
}

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
    idx = int(e[1:]) % data['batchMeta']['imgPerBatch']
    if idx not in data[batch]:
        data[batch]['imgs'][idx] = {}
    data[batch]['imgs'][idx]['epoch'] = int(e[1:])
    data[batch]['imgs'][idx]['batch'] = int(b[1:])
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
