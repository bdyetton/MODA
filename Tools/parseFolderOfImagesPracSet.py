__author__ = 'ben'
from pprint import pprint
import os
import json
import pandas as pd
from os import walk
import os
import sys


data = {}

phase = 'practice'
easyPrac = [10,12,17,30,34]
hardPrac = [25,26,35,37,42]
mypath = '../build/img/' + phase + '/900'
prac = True
data['batchMeta'] = {
    'numBatches':2,
    'imgPerSet':10,
    'batchPerSet':2,
    'imgPerBatch':5,
    'subjects':0
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

print os.getcwd()

gsData = pd.read_csv(os.getcwd()+'/GoldStandardData/'+phase+'/GS.txt', sep='\t')
markerIndex = 0
data['easy'] = {'imgs':{0:{},1:{},2:{},3:{},4:{}}}
data['hard'] = {'imgs':{0:{},1:{},2:{},3:{},4:{}}}
hardIdx = -1
easyIdx = -1

for image in filenames:
    [e, b, u1, u2, u3, smp] = image.split('-')
    if int(e[1:]) in easyPrac:
        dif = 'easy'
        easyIdx += 1
        idx = easyIdx
    elif int(e[1:]) in hardPrac:
        dif = 'hard'
        hardIdx += 1
        idx = hardIdx
    else:
        print 'Extra File in prac: ' + image
        continue
    [smp, u4] = smp.split('.')
    subID = u1 + '-' + u2 + '-' + u3

    data[dif]['imgs'][idx]['idx'] = 0
    data[dif]['imgs'][idx]['loadedViews'] = 0
    data[dif]['imgs'][idx]['backNextViews'] = 0
    data[dif]['imgs'][idx]['epoch'] = int(e[1:])
    data[dif]['imgs'][idx]['batch'] = int(b[1:])
    data[dif]['imgs'][idx]['filename'] = image
    data[dif]['imgs'][idx]['start'] = int(smp[3:])
    data[dif]['imgs'][idx]['end'] = int(smp[3:]) + 25*1000
    data[dif]['imgs'][idx]['stage'] = 2
    data[dif]['imgs'][idx]['subID'] = u1 + '-' + u2 + '-' + u3

    data[dif]['imgs'][idx]['markers'] = []
    data[dif]['imgs'][idx]['noMarkers'] = False
    data[dif]['imgs'][idx]['prac'] = prac
    data[dif]['imgs'][idx]['phase'] = phase
    markers = []
    gsMarkerData = gsData.loc[gsData.filename.isin({image})];
    if gsMarkerData.empty:
        data[dif]['imgs'][idx]['gsMarkers'] = []
    else:
        for i in gsMarkerData.index:
            print gsMarkerData.ix[i]
            markers.append({
                'xP': gsMarkerData.ix[i].startPercent,
                'wP': gsMarkerData.ix[i].durationPercent,
                'xSecs': gsMarkerData.ix[i].startSecs,
                'wSecs': gsMarkerData.ix[i].durationSecs,
                'scoreConfidence': gsMarkerData.ix[i].scoreConfidence,
                'markerIndex': markerIndex
            })
            markerIndex += 1
        data[dif]['imgs'][idx]['gsMarkers'] = markers

batchIdx = 0
dataOut = {}
dataOut['batchMeta'] = data['batchMeta']
dataOut['0'] = data['easy']
dataOut['1'] = data['hard']

with open('../app/Assets/metaData' + phase + '.json', 'wb') as fp:
    pprint(data)
    pprint(dataOut)
    json.dump(dataOut, fp)
fp.close()
