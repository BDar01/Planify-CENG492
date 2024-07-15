from config import db 
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship
#instance db is made in config

class HabitualEvents(db.Model):
    __tablename__ = 'habitual_events'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(100), nullable=True, default=None)
    duration = db.Column(db.Integer)
    energy = db.Column(db.Integer)
    priority = db.Column(db.Integer)
    recurrence_pattern = db.Column(db.String)  # Example: 'daily', 'weekly', 'monthly'
    user_id = db.Column(db.Integer, ForeignKey('users.id', ondelete='CASCADE'))
    occurrences = relationship('Events', backref='habitual_event', lazy=True)

    def to_json(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "frequency": self.recurrence_pattern,
            "duration": self.duration,
            "energy": self.energy,
            "priority": self.priority,
            }

class Events(db.Model):
    
    __tablename__ = 'events'

    id = db.Column(db.Integer,primary_key=True)
    name = db.Column(db.String(100),unique=False,nullable=False)
    duration = db.Column(db.Integer)
    energy = db.Column(db.Integer)
    priority = db.Column(db.Integer)
    deadline = db.Column(db.DateTime)
    fixed_start = db.Column(db.DateTime)
    fixed_end = db.Column(db.DateTime)
    fixed_start_time = db.Column(db.String)
    fixed_end_time = db.Column(db.String)
    fixed_day = db.Column(db.String)
    fixed_date = db.Column(db.String)
    event_type = db.Column(db.String)
    dependency = db.Column(db.String)
    completed = db.Column(db.Boolean, default=False)
    flexible = db.Column(db.Boolean, default=False)
    habitual_event_id = db.Column(db.Integer, ForeignKey('habitual_events.id', ondelete='CASCADE'), nullable=True,default=None)
    is_habit = db.Column(db.Boolean, default=False)
    # Define the foreign key constraint
    user_id = db.Column(db.Integer, ForeignKey('users.id', ondelete='CASCADE'))
    rescheduleFrequency = db.Column(db.Integer, default=0)

    
    def to_json(self):
        return {
            "id": self.id,
            "name": self.name,
            "duration": self.duration,
            "energy": self.energy,
            "priority": self.priority,
            "deadline": self.deadline,
            "fixedStart": str(self.fixed_start) if self.fixed_start else None,
            "fixedEnd": str(self.fixed_end) if self.fixed_end else None,
            "fixedStartTime": self.fixed_start_time,
            "fixedEndTime": self.fixed_end_time,
            "fixedDay": self.fixed_day,
            "fixedDate": str(self.fixed_date) if self.fixed_date else None,
            "eventType": self.event_type,
            "dependency": self.dependency,
            "completed": self.completed,
            "flexible": self.flexible,
            "habit": self.is_habit,
            "habitEventId": self.habitual_event_id,
            "rescheduleFrequency": self.rescheduleFrequency
            }
    
class Users(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer,primary_key=True)
    first_name = db.Column(db.String(100),unique=False,nullable=False)
    last_name = db.Column(db.String(100),unique=False,nullable=False)
    email = db.Column(db.String(120),unique=False,nullable=False)
    registration_date = db.Column(db.DateTime,unique=False,nullable=False)
    password = db.Column(db.String(30),unique=False,nullable=False)
    active_hours_begin = db.Column(db.Integer)
    active_hours_end = db.Column(db.Integer)
    balanced = db.Column(db.Boolean)
    events = db.relationship('Events', backref='users', lazy=True)
    timedistrib = db.Column(db.String, nullable=True, default=None)

    def to_json(self):
        return {
            "id" : self.id,
            "firstName" : self.first_name,
            "lastName" : self.last_name,
            "email" : self.email,
            "activeHours":[self.active_hours_begin,self.active_hours_end],
            "startDate": self.registration_date,
            "balanced": self.balanced,
            "timedistrib": self.timedistrib
            }