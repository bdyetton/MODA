__author__ = 'ben'
from pprint import pprint
import os
import json
from os import walk


data = {}

mypath = '../build/img/training1/low_dpi'
data['batchMeta'] = {
    'numBatches':10,
    'imgPerSet':10,
    'batchPerSet':2,
    'imgPerBatch':5,
}

# mypath = '../build/img/training1/test'
# data['batchMeta'] = {
#     'numBatches':1,
#     'imgPerSet':5,
#     'batchPerSet':1,
#     'imgPerBatch':5,
# }

for (dirpath, dirnames, filenames) in walk(mypath):
    break

for image in filenames:
    [e, b, u1, u2, u3, smp] = image.split('-')
    [smp, u4] = smp.split('.')
    subID = u1 + '-' + u2 + '-' + u3
    if subID not in data:
        data[subID] = {}
        data[subID]['blockIdxs'] = {}
        data[subID]['blockIdx'] = 0

    if int(b[1:]) not in data[subID]['blockIdxs']: #map to block indexs from actual blocks
        data[subID]['blockIdxs'][int(b[1:])] = data[subID]['blockIdx']
        data[subID]['blockIdx'] += 1
        data[subID][data[subID]['blockIdxs'][int(b[1:])]] = {}
        data[subID][data[subID]['blockIdxs'][int(b[1:])]]['imgs'] = {}
        data[subID][data[subID]['blockIdxs'][int(b[1:])]]['idx'] = 0

    blcIdx = data[subID]['blockIdxs'][int(b[1:])]
    imgIdx = (int(e[1:])-1) % data['batchMeta']['imgPerBatch']
    if imgIdx not in data[subID][blcIdx]:
        data[subID][blcIdx]['imgs'][imgIdx] = {}

    data[subID][blcIdx]['imgs'][imgIdx]['epoch'] = int(e[1:])
    data[subID][blcIdx]['imgs'][imgIdx]['batch'] = int(b[1:])
    data[subID][blcIdx]['imgs'][imgIdx]['filename'] = image
    data[subID][blcIdx]['imgs'][imgIdx]['start'] = int(smp[3:])
    data[subID][blcIdx]['imgs'][imgIdx]['end'] = int(smp[3:]) + 25*1000
    data[subID][blcIdx]['imgs'][imgIdx]['stage'] = 2
    data[subID][blcIdx]['imgs'][imgIdx]['subID'] = u1 + '-' + u2 + '-' + u3
    data[subID][blcIdx]['imgs'][imgIdx]['gsMarkers'] = []
    data[subID][blcIdx]['imgs'][imgIdx]['markers'] = []
    data[subID][blcIdx]['imgs'][imgIdx]['noMarkers'] = False
    data[subID][blcIdx]['imgs'][imgIdx]['prac'] = False
    data[subID][blcIdx]['imgs'][imgIdx]['id'] = 'phase1_prac'

batchIdx = 0
dataOut = {}
for subID in data:
    if subID == 'batchMeta':
        dataOut['batchMeta'] = data['batchMeta']
        continue
    for batch in data[subID]:
        if batch == 'blockIdx' or batch == 'blockIdxs':
            continue
        dataOut[batchIdx] = data[subID][batch]
        batchIdx += 1


with open('../app/Assets/metaDataPhase1.json', 'wb') as fp:
    pprint(data)
    pprint(dataOut)
    json.dump(dataOut, fp)
fp.close()
