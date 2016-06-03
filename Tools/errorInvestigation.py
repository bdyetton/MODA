__author__ = 'ben'
from pprint import pprint
import os
import json
import pandas as pd
from os import walk
import os
import csv


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
path = '/media/ben/Data1/Users/Ben/Google Drive/MODA/DownloadUserData/'
phaseSet = 'phase1trial6'


data_out = pd.DataFrame(columns={'workerId', 'myHits', 'mturkHits', 'missing','qual','new','old','new_prac'})
#workerData = pd.read_csv("DownloadedUserData/" + phaseSet + "/WorkerData.csv", sep=',')
#workerIdsTurk = workerData.loc[:,['Worker ID','Number of HITs approved or rejected - Lifetime', 'CURRENT-MODASleepScoring_PracticeCompleted']].copy()
#workerIdsTurk.rename(columns={'Worker ID': 'workerId', 'Number of HITs approved or rejected - Lifetime': 'Hits','CURRENT-MODASleepScoring_PracticeCompleted':'pracQual'}, inplace=True)

workerData = pd.read_csv(path + phaseSet + "/WorkerResultData.csv", sep=',')
workerIdsTurk = workerData.loc[:,['workerId','numHits']].copy()
workerIdsTurk.rename(columns={'numHits': 'Hits'}, inplace=True)

myData = pd.read_csv(path + phaseSet + "/EpochViews.csv", sep=',')
for workerId in workerIdsTurk["workerId"]:
    print "Worker {0}".format(workerId)
    # print "My Hits: {0}".format(int(myWorkerData[1]['allSets']))
    mturkHits = workerIdsTurk[workerIdsTurk["workerId"]==workerId]['Hits']
    #mTurkQual = workerIdsTurk[workerIdsTurk["workerId"]==workerId]['pracQual']
    mTurkQual = pd.DataFrame(['missing'])

    if mturkHits.empty:
        mturkHit = 0
    else:
        mturkHit = mturkHits.values[0]

    myDataHits = myData[myData["annotatorID"] == workerId]
    myHits = len(myDataHits.index)/10
    missing = mturkHit-myHits
    if missing:
        print "MISSING: {0}".format(missing)
    if workerId in data_out['workerId']:
        workerLoc = data_out['workerId'] == workerId
        data_out.loc[workerLoc, 'myHits'] += myHits
        data_out.loc[workerLoc, 'mturkHits'] += mturkHits
        data_out.loc[workerLoc, 'missing'] += missing
    else:
        ser = pd.Series([workerId,
                         myHits,
                         mturkHit,
                         missing,
                         mTurkQual.values,
                         os.path.isfile(path+ phaseSet + '/UserData_' + workerId),
                         os.path.isfile(path + phaseSet + '/UserData_practice_'+workerId),
                         os.path.isfile(path + phaseSet + '/UserData_phase1_'+workerId)],
                        index=['workerId', 'myHits', 'mturkHits', 'missing','qual','old','new','new_prac'])
        data_out = data_out.append(ser, ignore_index=True)

data_out.to_csv(path + phaseSet + "/MissingData.csv")
