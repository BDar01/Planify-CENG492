import json
from flask import Flask, redirect, render_template, request, url_for, jsonify, session
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from sqlalchemy import inspect, func, and_
from config import db, app
from models import Events, HabitualEvents, Users
import random
import datetime
from datetime import timedelta
import scheduler as sc
import reschedule as rsc
import habit_scheduler as hs
from utils import authenticate
from googleapiclient.discovery import build
# import convertAudioToText as aud
from collections import Counter
import jwt, os
from txtraction import post_query
from utilities import convert_to_Event, print_events
import convertAudioToText as aud


@app.route("/home")
@app.route("/")
def home():
    current_date = datetime.datetime.now().replace(minute=0, second=0, microsecond=0)
    start_of_week = current_date - datetime.timedelta(days=current_date.weekday())
    end_of_week = start_of_week + datetime.timedelta(days=6)
    week_range = f"{start_of_week.strftime('%d')} - {end_of_week.strftime('%d %b %Y')}"
    active_hours = (8, 21)
    events = Events.query.all()
    json_events = [event.to_json() for event in events]
    return render_template("index.html", current_date=week_range, active_hours=active_hours, events=json.dumps(json_events))

@app.route('/getallevents', methods=['GET'])
@jwt_required()
def getallevents():
    current_user_id = get_jwt_identity()
    user = Users.query.filter_by(id=current_user_id).first()
    
    if user:
        user_data = user.to_json()
        events_data = [event.to_json() for event in user.events]
        response = {"user": user_data, "events": events_data}
        return jsonify(response), 200
    else:
        return jsonify({"message": "User not found"}), 404   

@app.route('/addEventChatbot', methods=['POST'])
@jwt_required()
def addEventChatbot():

    current_user_id = get_jwt_identity()
    print(f"current jwt : {current_user_id}")
    timedistrib = load_time_distr(current_user_id)

    data = request.json
    if 'textInput' in data:
        text_input = data['textInput']
        print(f" from backend {text_input}")
        if 'hello' in text_input.lower() or 'hi' in text_input.lower():
             response = {"response": "Hello, how can I help you?"}
        elif "good morning" in text_input.lower():
             response = {"response": "Good morning, how can I help you?"}
        elif "thank you" in text_input.lower() or "thanks" in text_input.lower():
             response = {"response": "Your welcome. Have a productive day!"}
        else:
            # response_struct = {'results': {'list_of_events': ['yoga'], 'event_time': None, 'end_time': None, 'event_dates': None, 'list_of_attendees': None}, 'stats': {'n_text_characters': 36, 'n_entities': 5, 'n_tokens_used': 472}}
            response_struct  = post_query(text_input)
            # response ={
            # "list_of_events": [
            #     "class10",
            # ],
            # "event_time": [
            #     "5:00 p.m.",
            # ],
            # "end_time": [
            #     "6:00 p.m."
            # ],
            # "event_dates": [
            #     "sunday",
                
            # ],
            # "list_of_attendees": [
            #     "John Doe"
            # ]
            #         }
            # scheduler_events = convert_to_Event(response.json())
            print(response_struct.json())
            scheduler_events = convert_to_Event(response_struct.json())
            print(f"post processing scheduler events")
            new_event_objects = []
            print_events(scheduler_events)
            for new_event in scheduler_events:
                    
                    name = new_event.name
                    duration = new_event.duration
                    energy = new_event.energy
                    priority = new_event.priority
                    deadline = new_event.deadline
                    fixed_start = new_event.fixed_start
                    fixed_end = new_event.fixed_end
                    event_type = new_event.event_type
                    dependency = new_event.dependency
                    flexible = new_event.flexible == 'True'

                    duration = int(duration) if duration != "" else None
                    energy = int(energy) if energy != "" else 3
                    priority = int(priority) if priority != "" else 3
                    deadline = datetime.datetime.strptime(deadline, "%Y-%m-%dT%H:%M:%S") if deadline else None
                    print(f"fixed_start: {fixed_start}")
                    fixed_start = datetime.datetime.strptime(fixed_start, "%Y-%m-%dT%H:%M:%S") if fixed_start else None
                    print(f"fixed_start: {fixed_start}")
                    fixed_end = datetime.datetime.strptime(fixed_end, "%Y-%m-%dT%H:%M:%S") if fixed_end else None
                    print(f"fixed_end: {fixed_end}")
                    new_event_obj = Events(
                        name=name,
                        duration=duration,
                        energy=1,
                        priority=1,
                        deadline=deadline,
                        fixed_start=fixed_start,
                        fixed_end=fixed_end,
                        event_type=event_type,
                        dependency=dependency,
                        flexible=flexible,
                        user_id=current_user_id
                    )
                    new_event_objects.append(new_event_obj)
            
            existing_events = Events.query.filter_by(user_id=current_user_id).all()
            all_events = existing_events + new_event_objects
            user = Users.query.get(current_user_id)
            active_hours_begin = user.active_hours_begin
            active_hours_end = user.active_hours_end
            balanced_schedule = user.balanced
            current_date = datetime.datetime.now()
            s_date = current_date.replace(hour=0, minute=0, second=0, microsecond=0)
            scheduled = sc.create_schedule(new_event=new_event_objects[0], existing_events=existing_events, starting_date=s_date, active_hours=(active_hours_begin, active_hours_end), balanced=balanced_schedule, timedistr=timedistrib)
            for e in new_event_objects:
                print(e)
                db.session.add(e)
            db.session.commit()
            response = {"response":f"{len(new_event_objects)} events successfully scheduled."}
    # # Add event to Google Calendar
    # credentials = authenticate()  # Assume a function to get Google credentials
    # service = build('calendar', 'v3', credentials=credentials)
    # event_data = {
    #     'summary': new_event.name,
    #     'start': {'dateTime': new_event.fixed_start.isoformat(), 'timeZone': 'UTC'},
    #     'end': {'dateTime': new_event.fixed_end.isoformat(), 'timeZone': 'UTC'}
    # }
    # service.events().insert(calendarId='primary', body=event_data).execute()

    # response = {response: 'is this the response you wanted'}
    return jsonify(response), 200
    # return jsonify(json_events), 200





@app.route('/incompleteEvents', methods=['GET'])
@jwt_required()
def get_incomplete_events():
    current_user_id = get_jwt_identity()
    user = Users.query.filter_by(id=current_user_id).first()
    
    if user:
        user_data = user.to_json()
        current_date = datetime.datetime.now()

        events_data = [event.to_json() for event in user.events if not event.completed and current_date>event.fixed_end]
        response = {"user": user_data, "events": events_data}
        return jsonify(response), 200
    else:
        return jsonify({"message": "User not found"}), 404   

@app.route('/userdata', methods=['POST'])
@jwt_required()
def userdata():
    try:
        current_user_id = get_jwt_identity()
        data = request.json
        start_date = data.get('startDate')
        end_date = data.get('endDate')

        if not start_date or not end_date:
            return jsonify({"message": "Start date and end date are required"}), 400

        start_date = datetime.datetime.strptime(start_date, '%Y-%m-%dT%H:%M:%S.%fZ')
        end_date = datetime.datetime.strptime(end_date, '%Y-%m-%dT%H:%M:%S.%fZ')
        user = Users.query.filter_by(id=current_user_id).first()

        if user:
            events = Events.query.filter(
                and_(
                    Events.user_id == user.id,
                    Events.fixed_start >= start_date,
                    Events.fixed_end <= end_date
                )
            ).all()

            events_data = [event.to_json() for event in events]
            response = {"events": events_data}
            return jsonify(response), 200
        else:
            return jsonify({"message": "User not found"}), 404
    except Exception as e:
        return jsonify({"message": "An internal server error occurred"}), 500


@app.route('/habits', methods=['GET'])
@jwt_required()
def gethabits():
    habits = HabitualEvents.query.all()
    json_habits = [habit.to_json() for habit in habits]
    return jsonify(json_habits),200
    
    
@app.route('/create_habit', methods=['POST'])
@jwt_required()
def create_habit():
    current_user_id = get_jwt_identity()
    data = request.json
    name = data.get('habitTitle')
    description = data.get('habitDescription')
    duration = data.get('habitDuration')
    frequency = data.get('habitFrequency')
    energy = data.get('energy')
    priority = data.get('priority')
    if not energy:
        energy = 1
    if not priority:
        priority = 1
    #add habitual event
    if frequency == 'daily':
        frequency = 7
    elif frequency == 'weekly':
        frequency = 1
    elif frequency == 'biweekly':
        frequency = 2 
    else:
        pass # not good case handling
    new_habit = HabitualEvents(
        name = name,
        duration=int(duration),
        energy=int(energy),
        priority=int(priority),
        description=description,
        recurrence_pattern = frequency,
        user_id = current_user_id,
        #occurences = ?
    )
    existing_events = Events.query.filter_by(user_id=current_user_id).all()
    occurances = []
    for i in range(frequency):
        
        new_event = Events(
            name=name,
            duration=int(duration),
            energy=int(energy),
            priority=int(priority),
            deadline=None,
            fixed_start=None,
            fixed_end=None,
            event_type=None,
            dependency=None,
            flexible=True,
            is_habit = True,
            habitual_event_id = new_habit.id,
            user_id=current_user_id,
        )
        occurances.append(new_event)
    new_habit.occurrences = occurances

    timedistrib = load_time_distr(current_user_id)

    #call scheduler
    print(f"len of occurances: {len(occurances)}")
    user = Users.query.get(current_user_id)
    active_hours_begin = user.active_hours_begin
    active_hours_end = user.active_hours_end
    balanced_schedule = user.balanced
    current_date = datetime.datetime.now()
    s_date = current_date.replace(hour=0, minute=0, second=0, microsecond=0)
    scheduled = hs.schedule_habit(habit_occ=occurances,events=existing_events,starting_date=s_date, active_hours=(active_hours_begin, active_hours_end), balanced=balanced_schedule, timedistr=timedistrib)
    db.session.add_all(occurances)
    db.session.add(new_habit)    
    db.session.commit()
    json_events = [event.to_json() for event in scheduled]
    return jsonify(json_events), 200
    scheduled = hs.schedule_habit(habit=new_habit, events=existing_events, starting_date=s_date, active_hours=(active_hours_begin, active_hours_end), balanced=balanced_schedule, timedistr=timedistrib)

    return jsonify(json_events), 200

@app.route('/reschedule', methods=['POST'])
@jwt_required()
def reschedule():
    current_user_id = get_jwt_identity()
    data = request.json
    id = data.get('id')
    name = data.get('name')
    duration = data.get('duration')
    energy = data.get('energy')
    priority = data.get('priority')
    deadline = data.get('deadline')
    fixed_start = data.get('fixed_start')
    fixed_end = data.get('fixed_end')
    event_type = data.get('event_type')
    dependency = data.get('dependency')
    flexible = data.get('flexible') == 'True'
    duration = int(duration) if duration != "" else None
    energy = int(energy) if energy != "" else 3
    priority = int(priority) if priority != "" else 3
    if deadline:
        parsed_time = datetime.datetime.strptime(deadline, '%a, %d %b %Y %H:%M:%S %Z')
        deadline = parsed_time.strftime('%Y-%m-%dT%H:%M')
        deadline = datetime.datetime.strptime(deadline, '%Y-%m-%dT%H:%M')
    fixed_start = datetime.datetime.strptime(fixed_start, "%Y-%m-%dT%H:%M") if fixed_start else None
    fixed_end = datetime.datetime.strptime(fixed_end, "%Y-%m-%dT%H:%M") if fixed_end else None

    existing_events = Events.query.filter_by(user_id=current_user_id).all()
    resc_events = [event for event in existing_events if event.id == id]
    resc_event = resc_events[0] # because we click on 1 event only but rescheduler expects list

    # Increment the reschedule frequency
    if resc_event.rescheduleFrequency is None:
        resc_event.rescheduleFrequency = 0
    resc_event.rescheduleFrequency += 1

    timedistrib = load_time_distr(current_user_id)

    user = Users.query.get(current_user_id)
    active_hours_begin = user.active_hours_begin
    active_hours_end = user.active_hours_end
    balanced_schedule = user.balanced
    current_date = datetime.datetime.now()
    s_date = current_date.replace(hour=0, minute=0, second=0, microsecond=0)
    scheduled = rsc.recreate_schedule(resc_events=resc_events, events=existing_events, starting_date=s_date, active_hours=(active_hours_begin, active_hours_end), balanced=balanced_schedule, timedistr=timedistrib)
    db.session.commit()
    json_events = [event.to_json() for event in scheduled]

    return jsonify(json_events), 200

@app.route('/habitual_events/<int:event_id>', methods=['DELETE'])
@jwt_required()
def delete_habitual_event(event_id):
    habit = HabitualEvents.query.get(event_id)

    if habit:
        try:
            associated_events = Events.query.filter_by(habitual_event_id=event_id).all()
            for event in associated_events:
                db.session.delete(event)
            # Delete the HabitualEvents object
            db.session.delete(habit)
            db.session.commit()

            # Optionally, delete associated Events objects if necessary
            # Example:

            return {"message": "Habit deleted successfully"}, 200
        except Exception as e:
            db.session.rollback()
            return {"error": str(e)}, 500
    else:
        return {"error": "Habit not found"}, 404

@app.route('/addevent', methods=['POST'])
@jwt_required()
def addevent():
    #print(timedistrib)
    current_user_id = get_jwt_identity()
    data = request.json
    name = data.get('name')
    duration = data.get('duration')
    energy = data.get('energy')
    priority = data.get('priority')
    deadline = data.get('deadline')
    fixed_start = data.get('fixed_start')
    fixed_end = data.get('fixed_end')
    event_type = data.get('event_type')
    dependency = data.get('dependency')
    flexible = data.get('flexible') == 'True'

    duration = int(duration) if duration != "" else None
    energy = int(energy) if energy != "" else 3
    priority = int(priority) if priority != "" else 3
    deadline = datetime.datetime.strptime(deadline, "%Y-%m-%dT%H:%M") if deadline else None
    fixed_start = datetime.datetime.strptime(fixed_start, "%Y-%m-%dT%H:%M") if fixed_start else None
    fixed_end = datetime.datetime.strptime(fixed_end, "%Y-%m-%dT%H:%M") if fixed_end else None
    new_event = Events(
        name=name,
        duration=duration,
        energy=energy,
        priority=priority,
        deadline=deadline,
        fixed_start=fixed_start,
        fixed_end=fixed_end,
        event_type=event_type,
        dependency=dependency,
        flexible=flexible,
        user_id=current_user_id
    )
    
    timedistrib = load_time_distr(current_user_id)

    existing_events = Events.query.filter_by(user_id=current_user_id).all()
    all_events = existing_events + [new_event]
    user = Users.query.get(current_user_id)
    active_hours_begin = user.active_hours_begin
    active_hours_end = user.active_hours_end
    balanced_schedule = user.balanced
    current_date = datetime.datetime.now()
    s_date = current_date.replace(hour=0, minute=0, second=0, microsecond=0)
    scheduled = sc.create_schedule(new_event=new_event,existing_events=existing_events, starting_date=s_date, active_hours=(active_hours_begin, active_hours_end), balanced=balanced_schedule, timedistr=timedistrib)
    db.session.add(new_event)
    db.session.commit()

    # # Add event to Google Calendar
    # credentials = authenticate()  # Assume a function to get Google credentials
    # service = build('calendar', 'v3', credentials=credentials)
    # event_data = {
    #     'summary': new_event.name,
    #     'start': {'dateTime': new_event.fixed_start.isoformat(), 'timeZone': 'UTC'},
    #     'end': {'dateTime': new_event.fixed_end.isoformat(), 'timeZone': 'UTC'}
    # }
    # service.events().insert(calendarId='primary', body=event_data).execute()

    json_events = [event.to_json() for event in scheduled]
    
    return jsonify(json_events), 200


@app.route('/update_all_completion', methods=['POST'])
@jwt_required()
def update_all_completion():
    user_id = get_jwt_identity()  # Get user ID from JWT token
    data = request.json
    completed = data.get('completed')
    reschedule = data.get('reschedule')
    print("completed tasks: ",completed) 
    for event in completed:
        task = Events.query.filter_by(id=event['id'], user_id=user_id).first()
        task.completed = True

        task = Events.query.filter_by(id=event['id'], user_id=user_id).first()
        task_start_hour = task.fixed_start.hour
        task_start_weekday = task.fixed_start.weekday()
        task_duration_hours = task.duration
        
        timedistrib = load_time_distr(user_id)
        start_index = task_start_weekday * 24 + task_start_hour
        for i in range(task_duration_hours):
            timedistrib[(start_index + i) % (24 * 7)] += 1

        max_completions = max(timedistrib)
        min_completions = min(timedistrib)
        
        for i in range(len(timedistrib)):
            if timedistrib[i] == max_completions:
                timedistrib[i] = 3
            elif timedistrib[i] == min_completions:
                timedistrib[i] = 1
            else:
                timedistrib[i] = 2

        save_time_distr(user_id, timedistrib)
    
    reschedule_events = []
    for event in reschedule:
        task = Events.query.filter_by(id=event['id'], user_id=user_id).first()
        reschedule_events.append(task)
    
    existing_events = Events.query.filter_by(user_id=user_id).all()
    user = Users.query.get(user_id)
    active_hours_begin = user.active_hours_begin
    active_hours_end = user.active_hours_end
    balanced_schedule = user.balanced
    current_date = datetime.datetime.now()
    s_date = current_date.replace(hour=0, minute=0, second=0, microsecond=0)
    rescheduled = rsc.recreate_schedule(reschedule_events,existing_events,(active_hours_begin,active_hours_end), timedistrib, balanced_schedule,s_date) #FIXME:
    db.session.commit()
    json_events = [event.to_json() for event in rescheduled]

    return jsonify(json_events), 200
    
    
    

# Endpoint for updating task completion status and productivity distribution
@app.route('/userdata/<int:task_id>', methods=['PUT'])
@jwt_required()  # Protect this route with JWT authentication
def update_task_completion(task_id):
    user_id = get_jwt_identity()  # Get user ID from JWT token
    
    # Retrieve the task from the database
    task = Events.query.filter_by(id=task_id, user_id=user_id).first()
    print(task)
    
    if task:
        # Update the completion status
        data = request.json
        print(data)
        task.completed = data.get('completed', task.completed)  # Update completion status if provided in request
        print(task)
        db.session.commit()

        # If the task is marked as completed, update the productivity distribution
        if task.completed:
            task_start_hour = task.fixed_start.hour
            task_start_weekday = task.fixed_start.weekday()
            task_duration_hours = task.duration
            
            timedistrib = load_time_distr(user_id)
            start_index = task_start_weekday * 24 + task_start_hour
            for i in range(task_duration_hours):
                timedistrib[(start_index + i) % (24 * 7)] += 1

            max_completions = max(timedistrib)
            min_completions = min(timedistrib)
            
            for i in range(len(timedistrib)):
                if timedistrib[i] == max_completions:
                    timedistrib[i] = 3
                elif timedistrib[i] == min_completions:
                    timedistrib[i] = 1
                else:
                    timedistrib[i] = 2

            save_time_distr(user_id, timedistrib) 

        # Fetch the updated task from the database
        updated_task = Events.query.filter_by(id=task_id, user_id=user_id).first()
        if updated_task:
            return jsonify(updated_task.to_json()), 200  # Return the updated task in the response
        else:
            return jsonify({'error': 'Task not found after update'}), 404
    else:
        return jsonify({'error': 'Task not found'}), 404


@app.route('/signup', methods=['POST'])
def sign_up():
	data = request.json
	print(data)
	# Extract data from request
	first_name = data.get('name')
	last_name = data.get('surname')
	email = data.get('email')
	password = data.get('password')
	active_hours_begin = data.get('activeHoursStart')
	active_hours_end = data.get('activeHoursEnd')
	balanced = data.get('balanced')

	# Validate data (you may add more validation as needed)
	if not first_name or not last_name or not email or not password:
		return jsonify({'error': 'Missing required fields'}), 400

	# Check if user already exists
	if Users.query.filter_by(email=email).first():
		return jsonify({'error': 'User with this email already exists'}), 400

	# Create a new user object
	new_user = Users(
		first_name=first_name,
		last_name=last_name,
		registration_date = datetime.datetime.now(),
		email=email,
		password=password,
		active_hours_begin=int(active_hours_begin),
		active_hours_end=int(active_hours_end),
		balanced=bool(balanced)
	)

	# Add user to the database
	db.session.add(new_user)
	db.session.commit()

	return jsonify({'message': 'User created successfully'}), 201


@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    print(data)
    # Perform user authentication (e.g., check email/password against database)
    user = Users.query.filter_by(email=email, password=password).first()
    if user:
        # Store user ID in session
        # token = jwt.encode({'user_id': user.id}, app.secret_key, algorithm='HS256')
        access_token = create_access_token(identity=user.id)
        return jsonify({'access_token': access_token}), 200

    else:
        return jsonify({'error': 'Invalid credentials'}), 401


@app.route('/dashboard', methods=['GET'])
@jwt_required()
def dashboard():
    current_user_id = get_jwt_identity()

    # Fetch user data from the database
    user = Users.query.get(current_user_id)

    # Sync with Google Calendar
    # credentials = authenticate()  # Assume a function to get Google credentials
    # service = build('calendar', 'v3', credentials=credentials)

    # now = datetime.datetime.now()
    # time_min = (now - timedelta(weeks=2)).isoformat() + 'Z'  # 2 weeks before now
    # time_max = (now + timedelta(weeks=3)).isoformat() + 'Z'  # 3 weeks after now

    # events_result = service.events().list(calendarId='primary', timeMin=time_min, timeMax=time_max, singleEvents=True, orderBy='startTime').execute()
    # gc_events = events_result.get('items', [])

    # # Add new events fetched from Google Calendar to the database
    # for gc_event in gc_events:
    #     name = gc_event['summary']
    #     existing_event = Events.query.filter_by(user_id=current_user_id, name=name).first()

    #     if not existing_event:
    #         start = gc_event['start'].get('dateTime')
    #         end = gc_event['end'].get('dateTime')

    #         if start and end:
    #             start_time = datetime.datetime.fromisoformat(start)
    #             end_time = datetime.datetime.fromisoformat(end)

    #             new_event = Events(
    #                 name=name,
    #                 duration=(end_time - start_time).total_seconds() // 3600,
    #                 energy=1,
    #                 priority=1,
    #                 deadline=None,
    #                 fixed_start=start_time,
    #                 fixed_end=end_time,
    #                 event_type="Google Calendar",
    #                 dependency=None,
    #                 flexible=False,
    #                 user_id=current_user_id
    #             )
    #             db.session.add(new_event)
    # db.session.commit()

    if user:
        # Construct user data JSON object
        user_data = {
            'id': user.id,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'active_hours_begin': user.active_hours_begin,
            'active_hours_end': user.active_hours_end,
            'balanced': user.balanced,
            'events': [event.to_json() for event in user.events]  # Convert events to JSON
        }

        # Return user data as JSON response
        return jsonify(user_data), 200
    else:
        # Handle case where user is not found
        return jsonify({'error': 'User not found'}), 404

	

@app.route('/chatbot', methods=['POST'])
@jwt_required()
def chatbot():
    try:
        input_data = request.json
        response = "No text entered."

        if 'textInput' in input_data:
            text_input = input_data['textInput']
            response = chatbot_process_text(text_input)
        elif 'audioInput' in input_data:
            print("Please speak a word into the microphone")
            aud.record_to_file('demo.wav')
            print("Audio recording done. Converting to text...")
            response = chatbot_process_text(aud.convert_audio_to_text('demo.wav'))
        else:
            return jsonify({'error': 'Invalid input data'}), 400
		
        print("Response:", response)
        return jsonify(response), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

	
def chatbot_process_text(text):
            print(text)
            current_user_id = get_jwt_identity()
            print(f"current jwt : {current_user_id}")
            timedistrib = load_time_distr(current_user_id)
            # response_struct = {'results': {'list_of_events': ['yoga'], 'event_time': None, 'end_time': None, 'event_dates': None, 'list_of_attendees': None}, 'stats': {'n_text_characters': 36, 'n_entities': 5, 'n_tokens_used': 472}}
            response_struct  = post_query(text)
            # response ={
            # "list_of_events": [
            #     "class10",
            # ],
            # "event_time": [
            #     "5:00 p.m.",
            # ],
            # "end_time": [
            #     "6:00 p.m."
            # ],
            # "event_dates": [
            #     "sunday",
                
            # ],
            # "list_of_attendees": [
            #     "John Doe"
            # ]
            #         }
            # scheduler_events = convert_to_Event(response.json())
            print(response_struct.json())
            scheduler_events = convert_to_Event(response_struct.json())
            print(f"post processing scheduler events")
            new_event_objects = []
            print_events(scheduler_events)
            for new_event in scheduler_events:            
                name = new_event.name
                duration = new_event.duration
                energy = new_event.energy
                priority = new_event.priority
                deadline = new_event.deadline
                fixed_start = new_event.fixed_start
                fixed_end = new_event.fixed_end
                event_type = new_event.event_type
                dependency = new_event.dependency
                flexible = new_event.flexible == 'True'

                duration = int(duration) if duration != "" else None
                energy = int(energy) if energy != "" else 3
                priority = int(priority) if priority != "" else 3
                deadline = datetime.datetime.strptime(deadline, "%Y-%m-%dT%H:%M:%S") if deadline else None
                print(f"fixed_start: {fixed_start}")
                fixed_start = datetime.datetime.strptime(fixed_start, "%Y-%m-%dT%H:%M:%S") if fixed_start else None
                print(f"fixed_start: {fixed_start}")
                fixed_end = datetime.datetime.strptime(fixed_end, "%Y-%m-%dT%H:%M:%S") if fixed_end else None
                print(f"fixed_end: {fixed_end}")
                new_event_obj = Events(
                    name=name,
                    duration=duration,
                    energy=1,
                    priority=1,
                    deadline=deadline,
                    fixed_start=fixed_start,
                    fixed_end=fixed_end,
                    event_type=event_type,
                    dependency=dependency,
                    flexible=flexible,
                    user_id=current_user_id
                )
                new_event_objects.append(new_event_obj)
            print(f"new event obj {new_event_objects}")
            existing_events = Events.query.filter_by(user_id=current_user_id).all()
            all_events = existing_events + new_event_objects
            user = Users.query.get(current_user_id)
            active_hours_begin = user.active_hours_begin
            active_hours_end = user.active_hours_end
            balanced_schedule = user.balanced
            current_date = datetime.datetime.now()
            s_date = current_date.replace(hour=0, minute=0, second=0, microsecond=0)
            scheduled = sc.create_schedule(new_event=new_event_objects[0], existing_events=existing_events, starting_date=s_date, active_hours=(active_hours_begin, active_hours_end), balanced=balanced_schedule, timedistr=timedistrib)
            print("before loop")
            for e in new_event_objects:
                print(e)
                db.session.add(e)
            db.session.commit()
            response = {"response":f"{len(new_event_objects)} events successfully scheduled."}
            print("event scheduled")
            return response

def calculate_statistics(user_id):
    completed_events = Events.query.filter_by(user_id=user_id, completed=True).all()
    total_events = Events.query.filter_by(user_id=user_id).count()
    total_completed_tasks = len(completed_events)
    total_incompleted_tasks = total_events - total_completed_tasks

    # Calculate longest and shortest task durations
    if completed_events:
        longest_task = max(completed_events, key=lambda event: event.duration)
        shortest_task = min(completed_events, key=lambda event: event.duration)
        longest_task_duration = longest_task.duration
        shortest_task_duration = shortest_task.duration
    else:
        longest_task_duration = shortest_task_duration = 0

    # Filter out events with None fixed_start
    valid_completed_events = [event for event in completed_events if event.fixed_start is not None]

    # Most active hour for completing tasks
    if valid_completed_events:
        completion_hours = [event.fixed_start.hour for event in valid_completed_events]
        hour_counts = Counter(completion_hours)
        most_active_hour = max(hour_counts, key=hour_counts.get)
    else:
        most_active_hour = None

    # Tasks by energy level
        # Tasks by energy level
    high_energy_tasks_completed = Events.query.filter(Events.user_id == user_id, Events.energy > 2, Events.completed == True).count()
    low_energy_tasks_completed = Events.query.filter(Events.user_id == user_id, Events.energy < 2, Events.completed == True).count()


    # Average task duration
    average_task_duration = db.session.query(func.avg(Events.duration)).filter_by(user_id=user_id).scalar()

    # Task completion rate
    completion_rate = (total_completed_tasks / total_events) if total_events > 0 else 0
    completion_rate = round(completion_rate, 2) if completion_rate is not None else 0

    # Filter out events with NULL event_type
    non_null_events = [event.id for event in Events.query.filter_by(user_id=user_id).filter(Events.event_type.isnot(None)).all()]

    # Breakdown by task type
    task_type_counts = db.session.query(Events.event_type, func.count(Events.id)).filter(Events.id.in_(non_null_events)).group_by(Events.event_type).all()
    task_type_breakdown = {event_type: count for event_type, count in task_type_counts}

    # Breakdown by priority
    priority_counts = db.session.query(Events.priority, func.count(Events.id)).filter_by(user_id=user_id).group_by(Events.priority).all()
    priority_breakdown = {priority: count for priority, count in priority_counts}

    # Time breakdown and focus time
    total_time_spent = db.session.query(func.sum(Events.duration)).filter_by(user_id=user_id).scalar() or 0
    deep_work_time = db.session.query(func.sum(Events.duration)).filter_by(user_id=user_id).filter(Events.duration >= 120).scalar() or 0  # Long events ()>= 2 hours)
    shallow_work_time = total_time_spent - deep_work_time  # Short events (< 2 hours)

    # Breaks between events
    breaks_between_events = []
    sorted_events = sorted(valid_completed_events, key=lambda event: event.fixed_start)
    for i in range(1, len(sorted_events)):
        if sorted_events[i].fixed_end and sorted_events[i-1].fixed_start:
            break_duration = (sorted_events[i].fixed_start - sorted_events[i-1].fixed_end).total_seconds() / 3600
            breaks_between_events.append(break_duration)
    average_break_duration = sum(breaks_between_events) / len(breaks_between_events) if breaks_between_events else 0

    # Work-life balance
    work_hours = db.session.query(func.sum(Events.duration)).filter_by(user_id=user_id).filter(Events.event_type == 'Work').scalar() or 0
    personal_hours = db.session.query(func.sum(Events.duration)).filter_by(user_id=user_id).filter(Events.event_type == 'Personal').scalar() or 0

    # Heaviest and lightest work days
    events_by_day = db.session.query(func.strftime('%Y-%m-%d', Events.fixed_start), func.sum(Events.duration)).filter_by(user_id=user_id).group_by(func.strftime('%Y-%m-%d', Events.fixed_start)).all()
    if events_by_day:
        heaviest_day = max(events_by_day, key=lambda x: x[1])
        lightest_day = min(events_by_day, key=lambda x: x[1])
        lightest_day_date, lightest_day_duration = lightest_day
        heaviest_day_date, heaviest_day_duration = heaviest_day
    else:
        heaviest_day = lightest_day = None
        lightest_day_date = lightest_day_duration = None
        heaviest_day_date = heaviest_day_duration = None

    # Get top 3 most rescheduled events
    top_rescheduled_events = Events.query.filter_by(user_id=user_id).order_by(Events.rescheduleFrequency.desc()).limit(3).all()
    top_rescheduled_data = {event.name: event.rescheduleFrequency for event in top_rescheduled_events}

    # Calculate average reschedule frequency and limit to 2 decimal places
    avg_reschedule_frequency_query = db.session.query(func.avg(Events.rescheduleFrequency)).filter_by(user_id=user_id).scalar()
    avg_reschedule_frequency = round(avg_reschedule_frequency_query, 2) if avg_reschedule_frequency_query is not None else 0

    timedistrib = load_time_distr(user_id)

    statistics = {
        "totalTasks": total_events,
        "totalCompletedTasks": total_completed_tasks,
        "totalIncompletedTasks": total_incompleted_tasks,
        "mostActiveHour": most_active_hour,
        "highEnergyTasksCompleted": high_energy_tasks_completed,
        "lowEnergyTasksCompleted": low_energy_tasks_completed,
        "averageTaskDuration": average_task_duration,
        "completionRate": completion_rate,
        "priorityBreakdown": priority_breakdown,
        "totalTimeSpent": total_time_spent,
        "deepWorkTime": deep_work_time,
        "shallowWorkTime": shallow_work_time,
		"averageBreakDuration": average_break_duration,
        "workHours": work_hours,
        "personalHours": personal_hours,
        "heaviestDay": heaviest_day_date,
        "lightestDay": lightest_day_date,
        "lightestDayDuration": lightest_day_duration,
        "heaviestDayDuration": heaviest_day_duration,
        "taskTypeBreakdown": task_type_breakdown,
        "longestTask": longest_task_duration,
        "shortestTask": shortest_task_duration,
        "topRescheduledEvents": top_rescheduled_data,
        "averageRescheduleFrequency": avg_reschedule_frequency,
        "dailyProductivity": {
            "Mon": timedistrib[:24], 
            "Tue": timedistrib[24:48], 
            "Wed": timedistrib[48:72], 
            "Thu": timedistrib[72:96], 
            "Fri": timedistrib[96:120], 
            "Sat": timedistrib[120:144], 
            "Sun": timedistrib[144:168], 
        }
    }

    print(statistics)

    return statistics


@app.route('/statistics', methods=['GET'])
@jwt_required()
def get_statistics():
    current_user_id = get_jwt_identity()
    statistics = calculate_statistics(current_user_id)
    return jsonify(statistics), 200


@app.route('/success')
def success():
	events = Events.query.all()


	return render_template('success.html', events=events)

def create_time_distr():
    timedistr = []
    for hour in range(24 * 7):
        if hour % 24 == 10:  # Peak at 9 AM every day
            timedistr.append(3)
        else:
            distance_to_peak = abs(hour % 24 - 10)  # Calculate distance to peak
            if distance_to_peak <= 1:  # Within 4 hours of peak
                timedistr.append(3)
            elif distance_to_peak <= 2:  # Within 4 hours of peak
                timedistr.append(2)
                
            else:
                timedistr.append(1)
    return timedistr

def load_time_distr(user_id):
    user = Users.query.get(user_id)
    if user.timedistrib is not None:
        return json.loads(user.timedistrib)
    else:
        timedistr = create_time_distr()
        user.timedistrib = json.dumps(timedistr)
        db.session.commit()
        return timedistr

def save_time_distr(user_id, timedistr):
    user = Users.query.get(user_id)
    user.timedistrib = json.dumps(timedistr)
    db.session.commit()

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        all_users = Users.query.all()
        for user in all_users:
            user_id = user.id
            timedistr = load_time_distr(user_id)
            save_time_distr(user_id, timedistr)
    app.run(debug=True)