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


workerData = pd.read_csv("DownloadedUserData/phase1trial2/WorkerData.csv", sep=',')

workerIdsTurk = workerData.loc[:,['Worker ID','Number of HITs approved or rejected - Lifetime', 'CURRENT-MODASleepScoring_PracticeCompleted']].copy()
print workerIdsTurk
workerIdsTurk.rename(columns={'Worker ID': 'workerId', 'Number of HITs approved or rejected - Lifetime': 'Hits','CURRENT-MODASleepScoring_PracticeCompleted':'pracQual'}, inplace=True)
myData = pd.read_csv("DownloadedUserData/phase1trial2/TurkStats.csv", sep=',')
print myData['pracBatches']
print myData['phase1Batches']
myData['allSets'] = (myData['phase1Batches'])/2
with open('DownloadedUserData/phase1trial2/MissingData.csv', 'wb') as missing_data_file:
    missing_data_writer = csv.writer(missing_data_file)
    missing_data_writer.writerow(['workerId', 'myHits', 'turkHits', 'missing','new'])
    for myWorkerData in myData.iterrows():
        print "Worker {0}".format(myWorkerData[1]['annotatorID'])
        # print "My Hits: {0}".format(int(myWorkerData[1]['allSets']))
        mturkHits = workerIdsTurk[workerIdsTurk["workerId"]==myWorkerData[1]['annotatorID']]['Hits']
        qual = workerIdsTurk[workerIdsTurk["workerId"]==myWorkerData[1]['annotatorID']]['pracQual']
        print qual
        if mturkHits.empty:
            mturkHit = 0
        else:
            mturkHit = mturkHits.values[0]
        #print 'Mturk Hits {0}'.format(mturkHit)
        missing = mturkHit-int(myWorkerData[1]['allSets'])
        if missing:
            print "MISSING: {0}".format(mturkHit-myWorkerData[1]['allSets'])
        missing_data_writer.writerow([myWorkerData[1]['annotatorID'],
                                      myWorkerData[1]['allSets'], mturkHit, missing, qual.values])
missing_data_file.close()
    # print "Mturk Sets: {0}".format(workerIdsTurk.loc[[workerIdsTurk["workerId"]==myWorkerData[1]['annotatorID']],"Hits"])
    # print [workerIdsTurk["workerId"]==myWorkerData[1]['annotatorID']]
    # print myWorkerData[1]['annotatorID'], myWorkerData[1]['allSets']
#print myData[['annotatorID','allSets']]

#myData = pd.DataFrame([myData.loc[:,['annotatorID']], myData.loc[:,['pracBatches']] + myData.loc[:,['phase1Batches']]])
#pracData = gsData.loc[gsData.loc[:,'phase']=='practice',:]
# workerIdsMe = pracData.loc[:,'annotatorID'].copy()
# workerIdsMe = pd.Series(workerIdsMe.unique())
# workerIdsMe.sort()
# missingIDs = workerIdsTurk.isin(workerIdsMe)
# print missingIDs.value_counts()
# print workerIdsTurk.loc[~missingIDs]
# # fileData = pracData.loc[:,'filename']
# # print fileData.value_counts()