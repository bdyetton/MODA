# -*- coding: utf-8 -*-
__author__ = 'ben'
import os
import boto.mturk.connection
from boto.mturk.qualification import LocaleRequirement, Qualifications, Requirement



hosts={
    'sandbox':'mechanicalturk.sandbox.amazonaws.com',
    'real':'mechanicalturk.amazonaws.com'
}

qualIds = {
    'real':'3874R5DF6Q5C7TEUP9O1NNJXLRMPJ6',
    'sandbox':'3OFCXZK7I1YMQQ45Q5LPJ2OOHCHK93'
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
print 'Posting to ' + host
#url = "https://fierce-inlet-44115.herokuapp.com/"
url = "https://shrouded-plains-8041.herokuapp.com/"
title = "Find patterns in sleeping brainwaves (Training HIT)"
description = "Find patterns in recordings of the sleeping brain! Help science understand sleep and its memory benefits. " \
              "This is a training hit which will grant you a qualification to complete more HITs"
keywords = ["sleep", "scoring","spindles","spindle","brainwaves", "MODA", "psych", "annotation"]
frame_height = 800  # the height of the iframe holding the external hit
amount = .23
num2Pracpost = 5

questionform = boto.mturk.question.ExternalQuestion(url, frame_height)
quals = Qualifications()

if host != 'sandbox':
    quals.add(Requirement('00000000000000000040', 'GreaterThanOrEqualTo', '100')) #'Worker_​NumberHITsApproved'

quals.add(Requirement('000000000000000000L0', 'GreaterThanOrEqualTo', '95')) #'Worker_​PercentHITsApproved'
quals.add(Requirement(qualIds[host], 'DoesNotExist'))

#quals.add(LocaleRequirement('In', ['US','IN'])) #locale
#quals.add(LocaleRequirement('EqualTo', 'IN')) #locale

for i in range(0, num2Pracpost):
    create_hit_result = mturk.create_hit(
        title=title,
        description=description,
        keywords=keywords,
        question=questionform,
        reward=boto.mturk.price.Price(amount=0.13),
        qualifications=quals,
        response_groups=('Minimal', 'HITDetail'),  # I don't know what response groups are
    )
    print create_hit_result

print 'Posted '+ str(i+1) + ' Prac HITS'

url = "https://shrouded-plains-8041.herokuapp.com/"
title = "Find patterns in sleeping brainwaves"
description = "Find patterns in recordings of the sleeping brain! Help science understand sleep and its memory benefits"
keywords = ["sleep", "scoring","spindles","spindle","brainwaves", "MODA", "psych", "annotation"]
frame_height = 600  # the height of the iframe holding the external hit
num2Realpost = num2Pracpost

questionform = boto.mturk.question.ExternalQuestion(url, frame_height)
quals = Qualifications()

if host != 'sandbox':
    quals.add(Requirement('00000000000000000040', 'GreaterThanOrEqualTo', '100')) #'Worker_​NumberHITsApproved'

quals.add(Requirement('000000000000000000L0', 'GreaterThanOrEqualTo', '95')) #'Worker_​PercentHITsApproved'
quals.add(Requirement(qualIds[host], 'Exists'))

#quals.add(LocaleRequirement('In', ['US','IN'])) #locale
#quals.add(LocaleRequirement('EqualTo', 'IN')) #locale

for i in range(0, num2Realpost):
    create_hit_result = mturk.create_hit(
        title=title,
        description=description,
        keywords=keywords,
        question=questionform,
        reward=boto.mturk.price.Price(amount=0.13),
        qualifications=quals,
        response_groups=('Minimal', 'HITDetail'),  # I don't know what response groups are
    )
    print create_hit_result

print 'Posted '+ str(i+1) + ' Real HITS'


