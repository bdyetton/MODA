__author__ = 'ben'
import os
import boto.mturk.connection

sandbox_host = 'mechanicalturk.sandbox.amazonaws.com'
real_host = 'mechanicalturk.amazonaws.com'
print os.environ['AWS_SECRET_ACCESS_KEY']
print os.environ['AWS_ACCESS_KEY_ID']
mturk = boto.mturk.connection.MTurkConnection(
    aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
    aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    host=sandbox_host,
    debug=1  # debug = 2 prints out all requests.
)

print boto.Version  # 2.29.1
print mturk.get_account_balance()  # [$10,000.00]
titleToRemove = 'hi'

allHits = mturk.get_all_hits()
for hit in allHits:
    print hit.Title
    if hit.Titile == titleToRemove:
        mturk.disable_hit(hit.HITId)

