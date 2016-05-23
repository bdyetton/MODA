__author__ = 'ben'
from pprint import pprint
import os
import json
import yaml
import csv
from os import walk

currentPhase = 'BenTesting/'
mypath = 'DownloadedUserData/'+currentPhase
numImgPerBatch = 5
imgData = {}

for (dirpath, dirnames, filenames) in walk(mypath):
    break


with open(mypath+'EventLocations.csv', 'wb') as eventLocCsvFile:
    eventLocCsvWriter = csv.writer(eventLocCsvFile)
    eventLocCsvWriter.writerow(['epochNum', 'blockNum', 'annotatorID', 'annotatorEventIndex', 'startPercent', 'durationPercent', 'startSecs', 'durationSecs', 'scoreConfidence'])
    with open(mypath+'EpochViews.csv', 'wb') as epochCsvFile:
        epochCsvWriter = csv.writer(epochCsvFile)
        epochCsvWriter.writerow(['filename','epochNum','blockNum','annotatorID'])
        for userFile in filenames: #colate markers, and collate batches
            with open(mypath + '/' + userFile) as userFileHandle:
                userData = yaml.safe_load(userFileHandle)
                for batch in userData['batches']:
                    if batch == 'batchMeta':
                        continue
                    for img in userData['batches'][batch]['imgs']:
                        imgData = userData['batches'][batch]['imgs'][img]
                        epochCsvWriter.writerow([imgData['filename'],imgData['epoch'],batch,userData['userName']])
                        for marker in imgData['markers']:
                            print marker
                            if marker['gs'] == 'true' or marker['deleted'] == 'true':
                                continue
                            eventLocCsvWriter.writerow([imgData['epoch'],batch,userData['userName'], marker['markerIndex'], marker['xP'], marker['wP'],marker['xSecs'], marker['wSecs'], marker['conf']])

epochCsvFile.close()
eventLocCsvFile.close()

# with open('../app/Assets/metaData.json', 'wb') as fp:
#     pprint(data)
#     json.dump(data, fp)
# fp.close()


