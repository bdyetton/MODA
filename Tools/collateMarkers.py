__author__ = 'ben'
import json
from pprint import pprint
import os
import math
cwd = os.path.dirname(os.path.realpath(__file__))
sampleRate = 256
user = 'Ben'
with open(cwd+'/../server/Data/User/'+user+'.txt') as userData:
    data = json.load(userData)
    userData.close()
    for batch in data['batches']:
        for img in batch['imgs']:
            for markerType in img['markers']:
                for marker in img['markers'][markerType]:
                    print img['start']+marker['xSecs']
                    print int(round((img['start']+marker['xSecs'])*sampleRate))
