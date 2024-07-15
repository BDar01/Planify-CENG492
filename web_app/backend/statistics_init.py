from scheduler import create_schedule
from datetime import datetime

def calculate_scores_per_hour(sorted_events):
    
    hourly_scores = {hour: {'priority': 0, 'energy': 0, 'count': 0} for hour in range(24)}

    for event in sorted_events:
        start_hour = event.fixed_start.hour  # Extract hour from datetime object
        end_hour = event.fixed_end.hour  # Extract hour from datetime object

        for hour in range(start_hour, end_hour + 1):
            hourly_scores[hour % 24]['priority'] += event.priority
            hourly_scores[hour % 24]['energy'] += event.energy
            hourly_scores[hour % 24]['count'] += 1

    for hour in hourly_scores:
        if hourly_scores[hour]['count'] > 0:
            hourly_scores[hour]['priority'] /= hourly_scores[hour]['count']
            hourly_scores[hour]['energy'] /= hourly_scores[hour]['count']

    return hourly_scores

class Event:
    def __init__(self,name,duration,energy,priority,event_type=None,deadline=None,fixed_start=None, fixed_end=None, dependency=[]):
        self.name = name
        self.duration = duration # IN HOURS
        self.priority = priority # on a scale from 1 to 10 , 10 being highest
        self.deadline = deadline
        self.energy = energy
        self.fixed_start = fixed_start
        self.fixed_end = fixed_end
        self.fixed_day = None # Added object member to store Day (Text) of event
        self.fixed_date = None # Added object member to store date (Year-Month-Day) of event
        self.dependency = dependency # what other tasks it depends on to be started
        self.event_type = event_type
        self.variables = {}

def main():

    active_hours = (7,21)
    # assumes 1 is lowest and 3 is highest
    energies = [1,2,3] 
    priorities = [1,2,3]
    timedistrib = [1,1,1,1,1,1,1,1,2,2,3,2,2,1,1,1,1,1,1,1,1,1,1,1,
                   1,1,1,1,1,1,1,1,2,2,3,2,2,1,1,1,1,1,1,1,1,1,1,1,
                   1,1,1,1,1,1,1,1,2,2,3,2,2,1,1,1,1,1,1,1,1,1,1,1,
                   1,1,1,1,1,1,1,1,2,2,3,2,2,1,1,1,1,1,1,1,1,1,1,1,
                   1,1,1,1,1,1,1,1,2,2,3,2,2,1,1,1,1,1,1,1,1,1,1,1,
                   1,1,1,1,1,1,1,1,2,2,3,2,2,1,1,1,1,1,1,1,1,1,1,1,
                   1,1,1,1,1,1,1,1,2,2,3,2,2,1,1,1,1,1,1,1,1,1,1,1]#  productivity at 10 am
    #print(len(timedistrib))
    indices = [i for i, x in enumerate(timedistrib) if x == 3]
    print(indices)
    events = [
        Event(1,3,energies[0],priorities[0]),
        Event(2,3,energies[1],priorities[0]),
        Event(3,1,energies[2],priorities[2]),
        Event(4,1,energies[1],priorities[1]),
        Event(5,3,energies[0],priorities[1]),
        Event(6,2,energies[2],priorities[1]),
        Event(7,2,energies[2],priorities[2]),
        Event(8,1,energies[1],priorities[2]),
    ]

    balanced = True  # Provide an appropriate value for 'balanced'
    starting_date = datetime.now()  # Provide an appropriate starting date
    sorted_events = create_schedule(events, active_hours, timedistrib, balanced, starting_date)


    print(sorted_events)

    if sorted_events:
        print("\nScore per hour:\n")
        hourly_scores = calculate_scores_per_hour(sorted_events)
        for hour, score in hourly_scores.items():
            print(f'Hour {hour}: Priority Score: {score["priority"]}, Energy Score: {score["energy"]}')

if __name__ == "__main__":
    main()