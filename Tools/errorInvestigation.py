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


gsData = pd.read_csv("DownloadedUserData/phase1trial1/EpochViews.csv", sep=',')
print gsData.loc[:,'phase']=='practice'
pracData = gsData.loc[gsData.loc[:,'phase']=='practice',:]
fileData = pracData.loc[:,'filename']
print fileData.value_counts()