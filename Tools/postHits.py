# -*- coding: utf-8 -*-
__author__ = 'ben'
import os
import boto.mturk.connection
from boto.mturk.qualification import LocaleRequirement, Qualifications, Requirement


sandbox_host = 'mechanicalturk.sandbox.amazonaws.com'
real_host = 'mechanicalturk.amazonaws.com'
sandbox_qaul = '3OFCXZK7I1YMQQ45Q5LPJ2OOHCHK93'
real_qual = '3874R5DF6Q5C7TEUP9O1NNJXLRMPJ6'
mturk = boto.mturk.connection.MTurkConnection(
    aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
    aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    host=sandbox_host,
    debug=1  # debug = 2 prints out all requests.
)

print boto.Version  # 2.29.1
print mturk.get_account_balance()  # [$10,000.00]

#url = "https://fierce-inlet-44115.herokuapp.com/"
url = "https://shrouded-plains-8041.herokuapp.com/"
title = "Find patterns in sleeping brainwaves"
description = "Find patterns in recordings of the sleeping brain! Help science understand sleep and its memory benefits"
keywords = ["sleep", "scoring","spindles","spindle","brainwaves", "MODA", "psych", "annotation"]
frame_height = 600  # the height of the iframe holding the external hit
amount = .13
num2post = 50

questionform = boto.mturk.question.ExternalQuestion(url, frame_height)
quals = Qualifications()

#quals.add(Requirement('00000000000000000040', 'GreaterThanOrEqualTo', '100')) #'Worker_​NumberHITsApproved'
quals.add(Requirement('000000000000000000L0', 'GreaterThanOrEqualTo', '95')) #'Worker_​PercentHITsApproved'
#quals.add(LocaleRequirement('In', ['US','IN'])) #locale
#quals.add(LocaleRequirement('EqualTo', 'IN')) #locale
quals.add(Requirement(sandbox_qaul, 'DoesNotExist'))

for i in range(0, num2post):
    create_hit_result = mturk.create_hit(
        title=title,
        description=description,
        keywords=keywords,
        question=questionform,
        reward=boto.mturk.price.Price(amount=amount),
        qualifications=quals,
        response_groups=('Minimal', 'HITDetail'),  # I don't know what response groups are
    )
    print create_hit_result
print 'Posted '+ str(i+1) + ' HITS'


