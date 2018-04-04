import numpy as np

import pymongo
from pymongo import MongoClient
import pylab
import os
import sys

import tensorflow as tf

def distance_matrix(X,Z):

	N2 = tf.shape(Z, name='n2')[0]

	X_expanded = tf.tile(X,[1,N2])

	Z_flattened = tf.reshape(Z,[-1])

	diff = X_expanded - Z_flattened

	diff_split = tf.split(1,Z.shape[0], diff, name='split')
	diff_squared = tf.square(diff_split)

	diff_sum = tf.reduce_sum(diff_squared,axis=2)
	diff_sum_t = tf.transpose(diff_sum)

	sess = tf.InteractiveSession()
	result = sess.run([ diff_sum_t])	
	return result[0]
	#print("distance matrix is " + str(diff_tf_split))

	return diff_tf_split

def find_knn(distance_matrix, k):

	#pass in 1-d array of distances
	a = tf.convert_to_tensor(distance_matrix * (-1))
	b = tf.nn.top_k(a, k)
	res = sess.run([a,b])

	#print("top k are " + str(res[1].values * (-1)) + " indices are " + str(res[1].indices))
	return res[1].indices

def generate_data():
	random_person = np.array([0.5]*27)
	
	names = ['animal care', 'art/craft', 'entertainment', 'eventplanning', 'otherlanguages', 
	'tutoring', 'itsupport', 'marketing',  'photo/video', 'photo/video editing', 'generalcomputer', 'housekeeping',
	'carpentry', 'welding', 'sports', 'fitness', 'public speaking', 'food preperation', 'yardwork', 
	'programming', 'law', 'accounting', 'finance', 'autocad', 'leadership', 'sales', 'medical']

	teen = [0.8, 0.8, 0.3, 0.5, 0.1,
					0.8, 0.7, 0.1, 0.1, 0.1, 0.8, 0.6,
					0.05, 0.05, 0.2, 0.2, 0.1, 0.3, 0.7,
					0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05]

	arts = [0.05, 0.99, 0.8, 0.2, 0.3, 
					0.2, 0.05, 0.3,  0.8, 0.8, 0.2, 0.05,
					0.3, 0.1, 0.1, 0.1, 0.1, 0.1, 0.05, 
					0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05]

	fitness = [0.05, 0.05, 0.05, 0.05, 0.05, 
						0.2, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05,
						0.05, 0.05, 0.95, 0.95, 0.05, 0.3, 0.6, 
						0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.2]

	business = [0.05, 0.05, 0.05, 0.05, 0.5, 
							0.05, 0.05, 0.9,  0.2, 0.2, 0.05, 0.05,
							0.05, 0.05, 0.05, 0.05, 0.8, 0.05, 0.05, 
							0.05, 0.8, 0.9, 0.9, 0.05, 0.8, 0.9, 0.05]

	medstudent = [0.4, 0.05, 0.05, 0.05, 0.05, 
								0.05, 0.05, 0.05,  0.05, 0.05, 0.6, 0.05,
								0.05, 0.05, 0.05, 0.4, 0.05, 0.05, 0.05, 
								0.05, 0.05, 0.05, 0.05, 0.05, 0.7, 0.05, 0.95]

	senior = [0.05, 0.1, 0.05, 0.2, 0.6, 
						0.6, 0.05, 0.05,  0.01, 0.05, 0.05, 0.1,
						0.05, 0.05, 0.05, 0.05, 0.4, 0.7, 0.2, 
						0.1, 0.3, 0.2, 0.4, 0.2, 0.7, 0.5, 0.2]

	geek = [0.2, 0.2, .1, 0.05, 0.05, 
					0.4, 0.5, 0.3,  0.55, 0.5, 0.2, 0.05,
					0.05, 0.1, 0.2, 0.1, 0.2, 0.1, 0.05, 
					0.8, 0.1, 0.2, 0.1, 0.1, 0.1, 0.1, 0.1]

	foodie = [0.1, 0.3, 0.46, 0.45, 0.45, 
						0.2, 0.1, 0.35, 0.2,0.2, 0.7, 0.3,
						0.2, 0.2, 0.4, 0.4, 0.1, 0.8, 0.2, 
						0.3, 0.1, 0.1, 0.1, 0.1, 0.2, 0.1, 0.1]


	trudeau = [0.4, 0.3, 0.65, 0.75, 0.8, 
	0.3, 0.2, 0.5,  0.1, 0.2, 0.5, 0.05,
	 0.3, 0.2, 0.5, 0.6, 0.8, 0.3, 0.05, 
	0.05, 0.6, 0.1, 0.1, 0.1, 0.6, 0.2, 0.1]


	# print ("==============================")
	# print ("Generating probability for teen")
	# for i in range(27):
	# 		print (str(names[i]) + ' = ' + str(norm_list[i]))
	# print ("==============================")

	people_groups = [teen,arts,fitness, business, medstudent, senior, geek, foodie, trudeau, [0.5]*27]

	generated_people = []

	for person_type in people_groups:

		rand_list = np.random.random_sample((27,))
		bool_list = (person_type > rand_list).astype(float)
		norm_list = bool_list/np.add.reduce(bool_list)
		generated_people.append(norm_list)


		pylab.figure(1)
		x = range(27)
		pylab.xticks(x, names)
		pylab.plot(x,norm_list,"g")

		#pylab.show()

	return np.array(generated_people)

#initialize tensorflow
sess = tf.InteractiveSession()
init = tf.initialize_all_variables()
sess.run(init)

#connect with mongodb
#client = MongoClient('mongodb://user:user-password@ds251588.mlab.com:51588/volunteer-cloud')
#db = client

connection = pymongo.MongoClient('ds251588.mlab.com', 51588)
db = connection['volunteer-cloud']
db.authenticate('user', 'user-password')

#get all the people 

db_users = db.users.find({'subscriber_model':{'$eq': True}, 'interests':{'$exists': True}})

people_interests = []	
people_usernames = []	
for document in db_users:
		print(document)
		document_interests = document['interests']

		interest = [0.0]*27
		for index in document_interests:

			int_index = int(index) -1
			#print("int index is " + str(int_index))

			interest[int_index] = 1.0

		interest = interest/np.add.reduce(interest)
		people_usernames.append(document['username'])
		people_interests.append(interest)

np_people_interests = np.array(people_interests)
#print("people interests are " + str(np_people_interests))

#get all the events that have interests
#db_events = db.events.find({"interests": {"$exists": "true"}})
db_events = db.events.find({'subscriber_model':{'$eq': True}, 'interests':{'$exists': True}, 'status':{'$eq':'active'}})

print("==============================================================================="+
	"===================================================================================================="+"====================")

interests = []		
for document in db_events:
		print(document)
		document_interests = document['interests']

		interest = [0.0]*27
		for index in document_interests:

			int_index = int(index) -1
			#print("int index is " + str(int_index))

			interest[int_index] = 1.0

		interests.append(interest)
np_interests = np.array(interests)
#print("numpy interests are " + str(np_interests))
#print(np_interests.shape)
		
#sample_people = generate_data()
#print(sample_people.shape)

people_event_dist = distance_matrix(np_people_interests, np_interests)


top_people_array = find_knn(people_event_dist.T,11)

# people_group_names = ['teen','arts','fitness', 'business', 'medstudent', 'senior', 'geek', 'foodie', 'trudeau', 'random']


# top_people_list = []
# for row in range(top_people_array.shape[0]):
# 	temp = []
# 	for col in range(top_people_array.shape[1]):
# 		temp.append(people_group_names[top_people_array[row,col]])
# 	top_people_list.append(temp)

# print("top people are: " + str(top_people_array))

print("top people are: " + str(top_people_array))

print("usernames are " + str(people_usernames))

result_array = []

index = 0

for document in db.events.find({'subscriber_model':{'$eq': True}, 'interests':{'$exists': True}, 'status':{'$eq':'active'}}):
	temp = {}
	top_people = top_people_array[index]
	top_people_wname = []

	for i in top_people:
		top_people_wname.append(people_usernames[i])

	temp['names'] = top_people_wname
	print("event_id is " + str(document['_id']))
	temp['event_id'] = str(document['_id'])
	result_array.append(temp)
	index = index + 1

print("==============================================================================="+
	"===================================================================================================="+"====================")
print("final result is " + str(result_array))

mlstage1 = db.ml_stage1

for i in result_array:
	mlstage1.insert(i)



#print("bool_list for random guy is " + str(medstudent))
