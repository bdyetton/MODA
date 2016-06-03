# -*- coding: utf-8 -*-

__author__ = 'ben'
import os
from os import walk
import boto.mturk.connection
from boto.s3.connection import S3Connection
from boto.mturk.qualification import LocaleRequirement, Qualifications, Requirement
import datetime
import csv
import yaml
import sys
import math
import pandas as pd
from pprint import pprint

sandbox_host = 'mechanicalturk.sandbox.amazonaws.com'
real_host = 'mechanicalturk.amazonaws.com'

host = os.environ['MODA_MTURK_HOST']

hosts={
    'sandbox':'mechanicalturk.sandbox.amazonaws.com',
    'real':'mechanicalturk.amazonaws.com'
}

phasesQualID = {
    'sandbox': {
      'practice': '3LJ6LLBDMBQTWUTLG75O5EUQMZM6A6',
      'phase1': '3OFCXZK7I1YMQQ45Q5LPJ2OOHCHK93'
    },
    'real': {
      'practice': '3EOSKS3N0DQYQTMKNK1E0HHQOWRVU1',
      'phase1': '3874R5DF6Q5C7TEUP9O1NNJXLRMPJ6'
    }
  }

myWorkerID = {
    'sandbox': 'A2SI2XQA7HPR8V',
    'real': 'A2SI2XQA7HPR8V'
}

testingQual = '35NJKTSSL0Z7GHLPTM145UTQ6PFZXY'


class MturkTools:
    """Tools for mturk"""

    def __init__(self):
        self.phase = 'phase1trial6'
        self.path = '/media/ben/Data1/Users/Ben/Google Drive/MODA/DownloadUserData/'
        if not os.path.exists(self.path+self.phase):
            os.makedirs(self.path+self.phase)
        self.url = "https://shrouded-plains-8041.herokuapp.com/"
        self.mturk = boto.mturk.connection.MTurkConnection(
            aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
            aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
            host=hosts[host],
            debug=1  # debug = 2 prints out all requests.
        )
        self.titles_to_remove = ['Find patterns in sleeping brainwaves',
                                 'Find patterns in sleeping brainwaves (Training HIT)']
        print "Welcome to mturk tools, your balance is:"
        accountBal = self.mturk.get_account_balance()  # [$10,000.00]
        print accountBal
        if self.phase=='sandbox' and accountBal[0] != '10,000.00':
            print 'Error, your meant to be in sandbox but you are not!'
            sys.exit()

    def get_all_user_data_from_aws(self):
        s3 = S3Connection(os.environ['AWS_ACCESS_KEY_ID'], os.environ['AWS_SECRET_ACCESS_KEY'])
        bucket = s3.get_bucket('moss-assets')
        bucket_list = bucket.list()
        i=0
        for l in bucket_list:
            i += 1
            key_string = str(l.key)
            if key_string.find('UserData') != -1:
                l.get_contents_to_filename(self.path+self.phase + '/' +key_string)
        print "%i user data files downloaded" % i

    def parse_aws_to_csv(self):
        mypath = self.path+self.phase + '/'

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
                epoch_csv_writer.writerow(['filename', 'epochNum', 'blockNum', 'phase', 'annotatorID','hitId','assignmentId'])
                for userFile in filenames:  # collate markers, and collate batches
                    try:
                        if not (userFile.find('UserData') > -1):
                            continue
                        with open(mypath + '/' + userFile) as userFileHandle:
                            if userFile == "UserData_preview":
                                continue
                            user_data = yaml.safe_load(userFileHandle)
                            try:
                                if 'userName' not in user_data:
                                    print userFile
                                    continue
                                print "working on user %s" % user_data['userName']
                                dataExists = False
                            except:
                                print userFile
                            for phase in user_data['batches']:
                                batch_comp = user_data['setsCompleted'][phase]
                                print "   HITS completed in {0}: {1}".format(phase, batch_comp)
                                for batch in user_data['batches'][phase]:
                                    if batch == 'batchMeta':
                                        continue
                                    for img in user_data['batches'][phase][batch]['imgs']:
                                        img_data = user_data['batches'][phase][batch]['imgs'][img]
                                        if len(img_data['markers']) > 0 or img_data['noMarkers'] == 'true' or ('mturkInfo' in img_data):
                                            dataExists = True
                                            if user_data['userType'] == 'mturker':
                                                assignment_id = img_data['mturkInfo']['assignmentId']
                                                hit_id = img_data['mturkInfo']['hitId']
                                            else:
                                                hit_id = None
                                                assignment_id = None
                                            epoch_csv_writer.writerow([img_data['filename'],
                                                                       img_data['epoch'],
                                                                       img_data['batch'],phase,
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
                    except:
                        print "Massive Error somewhere with {0}".format(user_data['userName'])
                    userFileHandle.close()
        epochCsvFile.close()
        eventLocCsvFile.close()

    def save_mturk_data(self):
        hits = self.get_all_reviewable_hits()
        try:
            workerResultData = pd.read_csv(self.path+self.phase + "/WorkerResultData.csv", sep=',')
        except:
            workerResultData = pd.DataFrame(columns={'workerId', 'viewedImgs', 'numViewed', 'numHits', 'browser'})
        for hit in hits:
            assignments = self.mturk.get_assignments(hit.HITId)
            for assignment in assignments:
                print "Answers of the worker %s" % assignment.WorkerId
                for answer in assignment.answers:
                    for idx, ans in enumerate(answer):
                        if idx == 2:
                            for viewedImg in ans.fields:
                                browser = viewedImg
                                print browser
                        elif idx == 3:
                            for viewedImg in ans.fields:
                                print viewedImg
                                viewedImg = viewedImg.split(',')
                                if len(viewedImg)<1 or viewedImg==None:
                                    print "Missing DATA for {0}".format(assignment.WorkerId)
                                    print viewedImg
                                    continue
                                if assignment.WorkerId not in workerResultData['workerId'].values:
                                    ser = pd.Series([assignment.WorkerId, viewedImg, len(viewedImg), 1, browser], index=['workerId','viewedImgs','numViewed','numHits','browser'])
                                    workerResultData = workerResultData.append(ser, ignore_index=True)
                                else:
                                    currentData = workerResultData.loc[workerResultData['workerId']==assignment.WorkerId, 'viewedImgs']
                                    currentNumViewed = workerResultData.loc[workerResultData['workerId']==assignment.WorkerId, 'numViewed']
                                    currentNumHits = workerResultData.loc[workerResultData['workerId']==assignment.WorkerId, 'numHits']
                                    if not set(viewedImg).issubset(currentData.values[0]):
                                        currentDataValue = currentData.values[0]
                                        if isinstance(currentDataValue, basestring):
                                            currentDataValue = currentDataValue.split(',')
                                        workerLoc = workerResultData['workerId']==assignment.WorkerId
                                        currentDataValue.extend(viewedImg)
                                        workerResultData.loc[workerLoc, 'viewedImgs'] = [currentDataValue]
                                        workerResultData.loc[workerLoc, 'numViewed'] = currentNumViewed+len(viewedImg)
                                        workerResultData.loc[workerLoc, 'numHits'] = currentNumHits+1
        workerResultData.to_csv(self.path+self.phase + "/WorkerResultData.csv")


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

    def get_all_hits(self):
        return self.mturk.get_all_hits()

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

    def disable_all_hits(self):
        allHits = self.mturk.get_all_hits()
        for hit in allHits:
            if hit.Title in self.titles_to_remove:
                print 'deleting'
                self.mturk.disable_hit(hit.HITId)

    def dispose_reviewed_hits(self):
        allHits = self.mturk.get_all_hits()
        for hit in allHits:
            if hit.Title in self.titles_to_remove:
                print 'disposing'
                self.mturk.dispose_hit(hit.HITId)

    def expire_remaining_hits(self):
        allHits = self.mturk.get_all_hits()
        for hit in allHits:
            if hit.Title in self.titles_to_remove:
                print 'expiring {0}'.format(hit.Title)
                self.mturk.expire_hit(hit.HITId)

    def remove_qualifications(self, phase_type, workers_to_remove='me'):
        if workers_to_remove != 'me':
            qual_data= self.mturk.get_all_qualifications_for_qual_type(phasesQualID[host][phase_type])
            workers = []
            for worker in qual_data:
                workers.append(worker.SubjectId)
        else:
            workers = [myWorkerID[host]]

        for workerID in workers:
            try:
                self.mturk.revoke_qualification(workerID, phasesQualID[host][phase_type], reason='Granted in error')
            except:
                print 'worker %s does not have qual' % workerID

    def post_prac_hits(self, num_hits, amount, testing=False):
        title = "Find patterns in sleeping brainwaves (Training HIT)"
        description = "This is a training hit which will grant you a qualification to complete more HITs." \
                      "Expected HIT completion time is 12mins (because you have to read instructions etc)," \
                      " BUT future HITs will be shorter!!!" \
                      "Your job is to find patterns in recordings of the sleeping brain! Help science understand " \
                      "sleep and its memory benefits. \n" \
                      "This project is run by the MODA team at University of California, Riverside." \
                      "If you would like to find out more about this project please visit our Open Science Project" \
                      "at https://osf.io/8bma7/ or consider backing our project on " \
                      "Experiment: https://experiment.com/projects/crowdsourcing-the-analysis-of-sleep-can-the-public-be-sleep-scientists"
        keywords = ["sleep", "scoring","spindles","spindle","brainwaves", "MODA", "psych", "annotation"]
        frame_height = 800  # the height of the iframe holding the external hit
        questionform = boto.mturk.question.ExternalQuestion(self.url + '?currentPhase=practice', frame_height)
        quals = Qualifications()
        quals.add(Requirement('000000000000000000L0', 'GreaterThanOrEqualTo', '95')) #'Worker_​PercentHITsApproved'
        quals.add(Requirement(phasesQualID[host]['practice'], 'DoesNotExist'))
        quals.add(Requirement(phasesQualID[host]['phase1'], 'DoesNotExist'))
        if host != 'sandbox':
            if testing:
                quals.add(Requirement(testingQual, 'Exists'))
            else:
                quals.add(Requirement('00000000000000000040', 'GreaterThanOrEqualTo', '100')) #'Worker_​NumberHITsApproved'
        i=0
        for i in range(1, num_hits+1):
            self.mturk.create_hit(
                title=title,
                description=description,
                keywords=keywords,
                question=questionform,
                reward=boto.mturk.price.Price(amount=amount),
                lifetime=datetime.timedelta(4),
                duration=datetime.timedelta(minutes=30),
                qualifications=quals,
                response_groups=('Minimal', 'HITDetail'),  # I don't know what response groups are
            )
        print 'Posted ' + str(i) + ' practice HITS @ $' + str(amount)

    def post_futher_hits(self, num_hits, amount, testing=False):
        url = "https://shrouded-plains-8041.herokuapp.com/"
        title = "Find patterns in sleeping brainwaves"
        description = "Expected HIT completion time is ~3 mins.\n\n" \
                      "Your job is to find patterns in recordings of the sleeping brain! Help science understand " \
                      "sleep and its memory benefits. \n" \
                      "This project is run by the MODA team at University of California, Riverside." \
                      "If you would like to find out more about this project please visit our Open Science Project" \
                      "at https://osf.io/8bma7/ or consider backing our project on " \
                      "Experiment: https://experiment.com/projects/crowdsourcing-the-analysis-of-sleep-can-the-public-be-sleep-scientists"
        keywords = ["sleep", "scoring", "spindles", "spindle", "brainwaves", "MODA", "psych", "annotation"]
        frame_height = 800  # the height of the iframe holding the external hit
        questionform = boto.mturk.question.ExternalQuestion(url + '?currentPhase=phase1', frame_height)
        quals = Qualifications()
        quals.add(Requirement('000000000000000000L0', 'GreaterThanOrEqualTo', '95')) #'Worker_​PercentHITsApproved'
        quals.add(Requirement(phasesQualID[host]['practice'], 'Exists'))
        quals.add(Requirement(phasesQualID[host]['phase1'], 'DoesNotExist'))
        if host != 'sandbox':
            if testing:
                quals.add(Requirement(testingQual, 'Exists'))
            else:
                quals.add(Requirement('00000000000000000040', 'GreaterThanOrEqualTo', '100')) #'Worker_​NumberHITsApproved'

        # quals.add(LocaleRequirement('In', ['US','IN'])) #locale
        # quals.add(LocaleRequirement('EqualTo', 'IN')) #locale
        i = 0
        for i in range(1, num_hits+1):
            create_hit_result = self.mturk.create_hit(
                title=title,
                description=description,
                keywords=keywords,
                question=questionform,
                reward=boto.mturk.price.Price(amount=amount),
                lifetime=datetime.timedelta(4),
                duration=datetime.timedelta(minutes=30),
                qualifications=quals,
                response_groups=('Minimal', 'HITDetail'),  # I don't know what response groups are
            )
        print 'Posted ' + str(i) + ' further HITS @ $' + str(amount)

mtt = MturkTools()
#mtt.expire_remaining_hits()
#mtt.post_prac_hits(40, 0.20)
mtt.post_futher_hits(10, 0.20)

#mtt.save_mturk_data()
#mtt.get_all_user_data_from_aws()
#mtt.parse_aws_to_csv()
#
#mtt.approve_hits()

#mtt.remove_qualifications('practice')


# mtt.mturk.notify_workers('AR72L0JX4D03W',
#                          'Spindle Detection on MODA',
#                          'Hi There!,'
#                          'Thanks for completing spindle detection HITs. '
#                          'Unfortunately the data for you HITs is missing. '
#                          'This is most likely an error with the spindle detection program. '
#                          'Can you help me debug this by replying with your operating system, browser type and version'
#                          'and if you saw any strange behaviour in the spindle detection program.')






