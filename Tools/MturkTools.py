__author__ = 'ben'
import os
from os import walk
import boto.mturk.connection
from boto.s3.connection import S3Connection
import csv
import yaml
import pandas as pd
from pprint import pprint

sandbox_host = 'mechanicalturk.sandbox.amazonaws.com'
real_host = 'mechanicalturk.amazonaws.com'


class MturkTools:
    """Tools for mturk"""

    def __init__(self):
        self.phase = 'phase1trial1'
        self.mturk = boto.mturk.connection.MTurkConnection(
            aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
            aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
            host=real_host,
            debug=1  # debug = 2 prints out all requests.
        )
        print "Welcome to mturk tools, your balance is:"
        print self.mturk.get_account_balance()  # [$10,000.00]

    def get_all_user_data(self):
        if not os.path.exists('DownloadedUserData/'+self.phase):
            os.makedirs('DownloadedUserData/'+self.phase)

        s3 = S3Connection(os.environ['AWS_ACCESS_KEY_ID'], os.environ['AWS_SECRET_ACCESS_KEY'])
        bucket = s3.get_bucket('moss-assets')
        bucket_list = bucket.list()
        for l in bucket_list:
            keyString = str(l.key)
            l.get_contents_to_filename('DownloadedUserData/'+self.phase + '/' +keyString)
        print "%i user data files downloaded" % len(bucket_list)

    def parse_aws_to_csv(self):
        mypath = 'DownloadedUserData/'+self.phase + '/'

        for (dirpath, dirnames, filenames) in walk(mypath):
            break

        with open(mypath+'EventLocations.csv', 'wb') as eventLocCsvFile:
            event_loc_csv_writer = csv.writer(eventLocCsvFile)
            event_loc_csv_writer.writerow(['filename',
                                           'phase',
                                           'subID',
                                           'epochNum',
                                           'blockNum',
                                           'annotatorID',
                                           'MODA_batchNum',
                                           'annotatorEventIndex',
                                           'startPercent',
                                           'durationPercent',
                                           'startSecs',
                                           'durationSecs',
                                           'scoreConfidence',
                                           'TimeWindowFirstShown',
                                           'TimeMarkerCreated',
                                           'TimeMarkerLastModified',
                                           'turkHitId',
                                           'turkAssignmentId'])
            with open(mypath+'EpochViews.csv', 'wb') as epochCsvFile:
                epoch_csv_writer = csv.writer(epochCsvFile)
                epoch_csv_writer.writerow(['filename', 'epochNum', 'blockNum', 'annotatorID','hitId','assignmentId'])

                with open(mypath+'TurkStats.csv', 'wb') as turkStatsFile:
                    turk_stats_writer = csv.writer(turkStatsFile)
                    turk_stats_writer.writerow(['annotatorID','pracHits','phase1Hits'])
                    for userFile in filenames:  # collate markers, and collate batches
                        if userFile.find('.csv') > 0:
                            continue
                        with open(mypath + '/' + userFile) as userFileHandle:
                            dataExists = False
                            if userFile == "UserData_preview":
                                continue
                            user_data = yaml.safe_load(userFileHandle)
                            print "working on user %s" % user_data['userName']
                            turk_stats_writer.writerow([user_data['userName'],
                                                        user_data['setsCompleted']['practice'],
                                                        user_data['setsCompleted']['phase1']])
                            for phase in user_data['batches']:
                                batch_comp = user_data['setsCompleted'][phase]
                                print "   HITS completed in {0}: {1}".format(phase, batch_comp)

                                for batch in user_data['batches'][phase]:
                                    if batch == 'batchMeta':
                                        continue
                                    for img in user_data['batches'][phase][batch]['imgs']:
                                        dataExists = True
                                        img_data = user_data['batches'][phase][batch]['imgs'][img]
                                        if len(img_data['markers']) > 0 or img_data['noMarkers'] == 'true':
                                            if user_data['userType'] == 'mturker':
                                                assignment_id = img_data['mturkInfo']['assignmentId']
                                                hit_id = img_data['mturkInfo']['hitId']
                                            else:
                                                hit_id = None
                                                assignment_id = None
                                            epoch_csv_writer.writerow([img_data['filename'],
                                                                       img_data['epoch'],
                                                                       img_data['batch'],
                                                                       user_data['userName'],
                                                                       hit_id,
                                                                       assignment_id])
                                            for marker in img_data['markers']:
                                                if marker['gs'] == 'true' or marker['deleted'] == 'true':
                                                    continue
                                                event_loc_csv_writer.writerow([img_data['filename'],
                                                                               phase,
                                                                               img_data['subID'],
                                                                               img_data['epoch'],
                                                                               img_data['batch'],
                                                                               user_data['userName'],
                                                                               batch,
                                                                               marker['markerIndex'],
                                                                               marker['xP'],
                                                                               marker['wP'],
                                                                               marker['xSecs'],
                                                                               marker['wSecs'],
                                                                               marker['conf'],
                                                                               marker['imgFirstShown'],
                                                                               marker['markerCreated'],
                                                                               marker['timeStamp'],
                                                                               hit_id,
                                                                               assignment_id])
                            if not dataExists:
                                print "ERROR, %s has a file but did not complete any images. " % user_data['userName']

            epochCsvFile.close()
            eventLocCsvFile.close()
            turkStatsFile.close()

    def get_all_reviewable_hits(self):
        page_size = 50
        hits = self.mturk.get_reviewable_hits(page_size=page_size)
        print "Total results to fetch %s " % hits.TotalNumResults
        print "Request hits page %i" % 1
        total_pages = float(hits.TotalNumResults)/page_size
        int_total = int(total_pages)
        if total_pages - int_total > 0:
            total_pages = int_total+1
        else:
            total_pages = int_total
        pn = 1
        while pn < total_pages:
            pn += 1
            print "Request hits page %i" % pn
            temp_hits = self.mturk.get_reviewable_hits(page_size=page_size,page_number=pn)
            hits.extend(temp_hits)
        return hits

    def approve_hits(self):
        reviewable_hits = self.get_all_reviewable_hits()

        for hit in reviewable_hits:
            assignments = self.mturk.get_assignments(hit.HITId)
            for assignment in assignments:
                print "Worker %s" % assignment.WorkerId
                try:
                    self.mturk.approve_assignment(assignment.AssignmentId)
                except:
                    print "already approved"
                print "--------------------"
            self.mturk.disable_hit(hit.HITId)

tt = MturkTools()
tt.parse_aws_to_csv()






