__author__ = 'ben'
import os
import boto.mturk.connection

hosts={
    'sandbox':'mechanicalturk.sandbox.amazonaws.com',
    'real':'mechanicalturk.amazonaws.com'
}

host = os.environ['MODA_MTURK_HOST'];

mturk = boto.mturk.connection.MTurkConnection(
    aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
    aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    host=hosts[host],
    debug=1  # debug = 2 prints out all requests.
)

print boto.Version  # 2.29.1
print mturk.get_account_balance()  # [$10,000.00]
titleToRemove = 'Find patterns in sleeping brainwaves'
otherTitleToRemove = 'Find patterns in sleeping brainwaves (Training HIT)'

allHits = mturk.get_all_hits()
for hit in allHits:
    if hit.Title == titleToRemove or otherTitleToRemove:
        print 'deleting'
        mturk.disable_hit(hit.HITId)

