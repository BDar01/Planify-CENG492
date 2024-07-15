from ortools.sat.python import cp_model
import sqlite3
from datetime import datetime, timedelta
import random

def convert_hour_to_datetime(start, end, starting_date): # Added helper function to convert hours (0-24) to datetime
    start_datetime = starting_date + timedelta(hours=start)
    end_datetime = starting_date + timedelta(hours=end)
    return start_datetime, end_datetime

def convert_hour_to_dt(hour, starting_date):
    hour_datetime = starting_date + timedelta(hours=hour)
    return hour_datetime

def convert_datetime_to_hour(datetime_value, starting_date):
    delta = datetime_value - starting_date
    return int(delta.total_seconds() // 3600)


def recreate_schedule(resc_events, events, active_hours, timedistr,balanced, starting_date):  # Added starting_date parameter to create_schedule
    
    active_hours_start,active_hours_end = active_hours
    model = cp_model.CpModel()
    schedule = [] # list of intervalvars which are a type of variable that correspond to our event slots
    start_vars = [] # for each of the flexible interval vars we need start and end integer variables that the solver will decide on
    end_vars = []
    rescs_old_end = []
    
    flex_old_starts = {}
    flex_old_ends = {}
    deadlines = []
    deadline_scores = {}
    for resc_ev in resc_events:
        resc_old_end = convert_datetime_to_hour(resc_ev.fixed_end,starting_date)
        rescs_old_end.append(resc_old_end)
        if resc_ev.deadline:
            deadlines.append((resc_ev.id, convert_datetime_to_hour(resc_ev.deadline, starting_date)))       
        else: 
            deadlines.append((resc_ev.id, 0))       
        for event in events:
            if event.id==resc_ev.id:
                event.fixed_start = None
                event.fixed_end = None
    
    for event in events:
        if event.flexible and event not in resc_events:
            # print(f'starting date: ')
            # print(f'event old start: ')
            old_start = convert_datetime_to_hour(event.fixed_start,starting_date)
            flex_old_starts[event.id]= old_start
            old_end = convert_datetime_to_hour(event.fixed_end,starting_date)
            flex_old_ends[event.id]= old_end
            event.fixed_start = None
            event.fixed_end = None
        if event.deadline:
            deadlines.append((event.id,convert_datetime_to_hour(event.deadline, starting_date)))
        else:
            deadlines.append((event.id,0))
    
    deadlines.sort(key=lambda x: x[1], reverse=True)
    for id, deadline in deadlines:
        deadline_scores[id] = deadlines.index((id,deadline))+2
        
                
    
    for res_ev in resc_events: #  making sure events that depend on the incoming events are also rescheduled
        for event in events:
            if event.dependency:
                dependency = event.dependency.split(',')
                if res_ev.name in dependency:
                    event.fixed_start = None
                    event.fixed_end = None
    
    flexible_events = [event for event in events if (event.fixed_start is None and event.fixed_end is None)]
    for ind, event in enumerate(events):
        # checking if it is an event with hard set times
        if event.fixed_start is not None and event.fixed_end is not None:
            begin = convert_datetime_to_hour(event.fixed_start, starting_date)
            finish = convert_datetime_to_hour(event.fixed_end, starting_date)
            schedule.append(model.NewIntervalVar(start=begin, size=event.duration, end=finish, name=str(event.name)))
            
        else:
            # flexible time event, scheduler picks the time
            begin = model.NewIntVar(0, 167, f'{event.name}_start')
            start_vars.append(begin)
            finish = model.NewIntVar(0, 167, f'{event.name}_end')
            end_vars.append(finish)
            schedule.append(model.NewIntervalVar(start=begin, size=event.duration, end=finish, name=str(event.name)))
            # TODO: test
            if event.deadline is not None:
                model.Add(finish<=convert_datetime_to_hour(event.deadline, starting_date))
            
            # model.AddBoolOr([begin >= active_hours_start + day_start for day_start in range(0,167,24)])
            # model.AddBoolOr([finish < active_hours_end + day_start for day_start in range(0,167,24)])
    for i,event in enumerate(flexible_events):
        #TODO: TEST THIS
        if event.dependency:
            dependency = event.dependency.split(',')
            for e in dependency:
                print(e)
                for ev in events:
                    if ev.name == e:
                        print('found')
                        if ev.fixed_start is not None and ev.fixed_end is not None:
                            model.Add(start_vars[i]>=convert_datetime_to_hour(ev.fixed_end, starting_date)) # events with dependency automatically mean they are flexible
                        else:
                            model.Add(start_vars[i]>=end_vars[flexible_events.index(ev)]) # depends on other events, must start when they end
                        break

    
    for i,res_ev in enumerate(resc_events):
        for j,event in enumerate(flexible_events):
            if event.id == res_ev.id:
                print('found')
                model.Add(start_vars[j]> rescs_old_end[i])
                break    
    
                      
    # blocking off the inactive hours so that the scheduler doesnt pick those to slot in the events/tasks
    inactive_hours = []
    week = list(range(0,168,24))
    for i,day_start in enumerate(week):
        inactive_before = model.NewIntervalVar(start=day_start,size=active_hours_start,end=day_start+active_hours_start, name=f'day{i}_inactive1')
        inactive_after = model.NewIntervalVar(start=day_start+active_hours_end,size=(i+1)*24-(day_start+active_hours_end),end=(i+1)*24, name=f'day{i}_inactive2')
        inactive_hours.append(inactive_before)
        inactive_hours.append(inactive_after)
            
    schedule = schedule + inactive_hours      
    model.AddNoOverlap(schedule)
        

    # # Define the objective function based on energy, priority, and productivity distribution
    # objective_terms = []
    # for i in range(len(flexible_events)):
    #     event = flexible_events[i]
    #     # For each event, create a set of constraints to select the start time based on timedistr
    #     for start_hour in range(len(timedistr)):
    #         # Calculate the value for selecting this start hour based on energy, priority, and productivity
    #         value = event.energy * event.priority * timedistr[start_hour]
    #         # Add a binary variable for selecting this start hour
    #         var = model.NewBoolVar(f'{event.name}_starts_at_{start_hour}')
    #         # Add the binary variable to the objective function with the calculated value
    #         objective_terms.append(value * var)
    #         # Add a constraint that enforces the selection of only one start hour for this event
    #         model.Add(start_vars[i] == start_hour).OnlyEnforceIf(var)

    # # Maximize the sum of objective terms
    # model.Maximize(sum(objective_terms))
    
    
    objective_terms = []
    for i in range(len(flexible_events)):
        event = flexible_events[i]
        for start_hour in range(len(timedistr)):
            # Calculate the difference between event's characteristics and productivity of the time slot
            compatibility_score = 100*(1+(event.energy * event.priority * timedistr[start_hour] - (timedistr[start_hour])**2))
            if event.id in deadline_scores:
                compatibility_score*=deadline_scores[event.id]
            if event.deadline:
                compatibility_score*=10
            #print(f'compatibility of hr {start_hour} is {compatibility_score}')
            if event.id in flex_old_starts:
                original_start = flex_old_starts[event.id]
                change_penalty = (abs(start_hour - original_start) * 2)  # Penalty for deviation from original start time
                compatibility_score-=change_penalty
            
            # Penalize later start hours
            penalty = 0#.01*start_hour
            # Multiply compatibility score by penalty to favor earlier start hours
            if event.priority == 3:
                penalty = 0.01*start_hour
            adjusted_score = compatibility_score - penalty
            # Add a binary variable for selecting this start hour
            var = model.NewBoolVar(f'{event.name}_starts_at_{start_hour}')
            # Add the binary variable to the objective function with the adjusted compatibility score
            objective_terms.append(adjusted_score * var)
            # Add a constraint that enforces the selection of only one start hour for this event
            model.Add(start_vars[i] == start_hour).OnlyEnforceIf(var)

    model.Maximize(sum(objective_terms))


    solver = cp_model.CpSolver()
    status = solver.Solve(model)

    if status != cp_model.OPTIMAL:
        if status !=cp_model.FEASIBLE:
            print("No optimal solution found.")
            return

    # Added code to sort and store all events in schedule to database:
    scheduled_events = []
    print(solver.ObjectiveValue())
    for task in (events):
        if task.fixed_start is None and task.fixed_end is None:
            i = flexible_events.index(task)
            start_time = solver.Value(start_vars[i])
            end_time = solver.Value(end_vars[i])
            #print(f'for event {task.name} the start is {start_time} and end is {end_time}')
            start_time, end_time = convert_hour_to_datetime(start_time,end_time , starting_date)
            task.fixed_start = start_time
            task.fixed_end = end_time
        else:
            start_time = convert_datetime_to_hour(task.fixed_start, starting_date)
            end_time = convert_datetime_to_hour(task.fixed_end, starting_date)
            #print(f'for event {task.name} the start is {start_time} and end is {end_time}')

        # Store all events with scheduled start_time and end_time
        scheduled_events.append(task)

    # Sort events based on fixed_start
    #sorted_events = sorted(scheduled_events, key=lambda x: x.fixed_start)

    
    return scheduled_events