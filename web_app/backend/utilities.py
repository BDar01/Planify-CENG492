from subprocess import HIGH_PRIORITY_CLASS
import sys
import datetime
from Event import Event_2


"""class Event:
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
        self.variables = {}"""


def calculate_duration(time_str1, time_str2):
    time_str_1 = f"{time_str1[0]:02d}:{time_str1[1]:02d}"
    time_str_2 = f"{time_str2[0]:02d}:{time_str2[1]:02d}"

    dt1 = datetime.datetime.strptime(time_str_1, '%H:%M')
    dt2 = datetime.datetime.strptime(time_str_2, '%H:%M')

    duration = dt2 - dt1

    hours, remainder = divmod(duration.seconds, 3600)
    minutes = remainder // 60

    # return f"{hours} hours and {minutes} minutes"
    return hours

def convert_to_24_hour_format(time_str):
    time_components = time_str.split()
    print(f"time after split  {time_components}")
    if len(time_components) == 1:
         time_comp = time_components[0][-2:]
         print(f"time comp: {time_comp}")
         hour_time = time_components[0][:-2]
         print(f"hour time {hour_time}")
         if hour_time != "" and ':' in hour_time:
            hours, minutes = map(int, hour_time.split(':'))
         elif hour_time != "" and '.' in hour_time:
            hours, minutes = map(int, hour_time.split('.'))
         else:
            hours = int(hour_time)
            minutes = 0
    else:
       period = time_components[1].upper()
       if ':' in time_components[0]:
          hours, minutes = map(int, time_components[0].split(':'))
       elif '.' in time_components[0]:
          hours, minutes = map(int, time_components[0].split('.'))
       else:
          hours = int(time_components[0])
          minutes = 0
       if (period == 'PM' or period == 'P.M.') and hours != 12:
          hours += 12
       elif( period == 'AM' or period == 'A.M.') and hours == 12:
          hours = 0
    print(f"result before return convert 24: {hours}")
    result_str = f'{hours:02d}:{minutes:02d}'
    
    return (hours, minutes)

def get_future_date_for_weekday(week_ind_final):
    # Get today's date
    today = datetime.date.today()
    
    # Get the index of today's weekday (0 = Monday, 6 = Sunday)
    today_index = today.weekday()
    
    # Calculate the number of days to add to get to the target weekday
    days_to_add = (week_ind_final - today_index + 7) % 7
    
    # If the target day is today, we want to get the date for next week
    if days_to_add == 0:
        days_to_add = 7
    
    # Calculate the future date
    future_date = today + datetime.timedelta(days=days_to_add)
    
    return future_date
def convert_to_Event(data):
   results = data["results"]
   eventList = results['list_of_events']
   event_start_time = results['event_time'] 
#    if len(eventList) != len(event_start_time):
#       print(f"Error: one of the events does not have a start date.")
#       sys.exit(1)
   end_times = results['end_time']
   event_dates = results['event_dates']
   atendees = results['list_of_attendees']
   scheduler_events = []
   for i, event in enumerate(eventList):
    future_date = None
    future_end = None
    if (event_start_time!=None) and i < len(event_start_time):
       
       start_time = event_start_time[i]
       
       start_time_num = convert_to_24_hour_format(start_time)
       print(start_time_num)
    else:
       
       start_time = None
       start_time_num = None
       print(event_start_time)
    if start_time_num and (end_times != None) and i < len(end_times):
        end_time = end_times[i]
        end_time_compatible = convert_to_24_hour_format(end_time)
        duration = calculate_duration(start_time_num, end_time_compatible)
        
    else:
        duration  = 1
        if start_time_num == '23:00':
           end_time_compatible = '00:00'
           
        elif start_time_num is not None:
           hour, minutes = start_time_num
           hour += 1
           end_time_compatible = (hour, minutes)
        else:
           end_time_compatible = None
    if event_dates is not None and i < len(event_dates):
       if start_time_num:
        day = event_dates[i]
        if day == 'tonight' or day =='today':
            today = datetime.date.today()
            today = today.strftime('%Y-%m-%d')
            future_date = today + 'T'+ f"{start_time_num[0]:02d}:{start_time_num[1]:02d}:00"
            if end_time_compatible:
               future_end = today + 'T'+ f"{end_time_compatible[0]:02d}:{end_time_compatible[1]:02d}:00"
        else:
            week_ind_t = datetime.date.today()
            week_ind = week_ind_t.weekday()
            if day.lower() == 'monday':
              week_ind_2 = 0
            elif day.lower() == 'tuesday':
              week_ind_2 = 1
            elif day.lower() == 'wednesday':
              week_ind_2 = 2
            elif day.lower() == 'thursday':
              week_ind_2 = 3
            elif day.lower() == 'friday':
              week_ind_2 = 4
            elif day.lower() == 'saturday':
              week_ind_2 = 5
            elif day.lower() == 'sunday':
              week_ind_2 = 6
            future_date = str(get_future_date_for_weekday(week_ind_2))+'T'+ f"{start_time_num[0]:02d}:{start_time_num[1]:02d}:00"
            if end_time_compatible:
               future_end = str(get_future_date_for_weekday(week_ind_2)) + 'T'+ f"{end_time_compatible[0]:02d}:{end_time_compatible[1]:02d}:00"
            else:
               future_end = None
       else:
          future_date = None
          future_end = None

       
    energy = ''
    priority = ''
    auxilary = {}
    auxilary['event dates'] = event_dates
    auxilary['attendees'] = atendees
    sched_event = Event_2(event,duration,energy, priority, fixed_start=future_date, fixed_end=future_end, auxilary=auxilary )      
    scheduler_events.append(sched_event)

   return scheduler_events
      
    
def print_events(eventList):
   for i, event in enumerate(eventList):
      print("event {}:".format(i+1))
      print("name: {}, duration: {} , energy: {}, fixed start: {}, fixed end: {}, auxilary: {}".format(event.name, event.duration, event.energy, event.fixed_start, event.fixed_end, event.auxilary))
   return
      




