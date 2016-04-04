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

url = "https://shrouded-plains-8041.herokuapp.com/"
title = "Testing, do not accept hit"
description = "Testing, do not accept hit, you will not be paid"
keywords = ["cats", "dogs", "rabbits"]
frame_height = 800  # the height of the iframe holding the external hit
amount = .01

questionform = boto.mturk.question.ExternalQuestion(url, frame_height)

create_hit_result = mturk.create_hit(
    title=title,
    description=description,
    keywords=keywords,
    question=questionform,
    reward=boto.mturk.price.Price(amount=amount),
    response_groups=('Minimal', 'HITDetail'),  # I don't know what response groups are
)

print create_hit_result
