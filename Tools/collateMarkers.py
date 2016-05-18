__author__ = 'ben'
import json
from pprint import pprint
import os
import math
import csv
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
sampleRate = 256
user = 'katherineduggan'
with open('UserData_'+user) as userData:
    with open(user+'.csv', 'wb') as csvfile:
        csvWriter = csv.writer(csvfile)
        data = json.load(userData)
        userData.close()
        csvWriter.writerow(['img_name','folder','markerType','img_start_seconds','img_end_seconds','marker_loc_secs','marker_loc_samples','marker_relToImg'])
        for batch in data['batches']:
            for img in batch['imgs']:
                for markerType in img['markers']:
                    for marker in img['markers'][markerType]:
                        samples = int(round((img['start']+marker['xSecs'])*sampleRate))
                        print [img['name'],img['folder'],markerType,img['start'],img['end'],marker['xSecs'], samples, marker['relToImg']['x']]
                        csvWriter.writerow([img['name'],img['folder'],markerType,img['start'],img['end'],marker['xSecs'], samples, marker['relToImg']['x']])
csvfile.close()