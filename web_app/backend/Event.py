# from ortools.sat.python import cp_model

class Event_2:
    def __init__(self,name,duration,energy,priority,event_type=None,deadline=None,fixed_start=None, fixed_end=None, dependency=None, auxilary=None, flexible=True):
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
        self.auxilary = auxilary
        self.flexible = flexible
    # def add_dependency(self, task):
    #     self.dependency.append(task)
        