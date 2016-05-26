__author__ = 'ben'
import os
import boto.mturk.connection

sandbox_host = 'mechanicalturk.sandbox.amazonaws.com'
real_host = 'mechanicalturk.amazonaws.com'
mturk = boto.mturk.connection.MTurkConnection(
    aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
    aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    host=sandbox_host,
    debug=1  # debug = 2 prints out all requests.
)

print boto.Version  # 2.29.1
print mturk.get_account_balance()  # [$10,000.00]

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

qualData= mturk.get_all_qualifications_for_qual_type(phasesQualID['sandbox']['practice'])
workers = []
for worker in qualData:
    workers.append(worker.SubjectId)

for workerID in workers:
    mturk.revoke_qualification(workerID,phasesQualID['sandbox']['practice'],reason='Granted in error')
