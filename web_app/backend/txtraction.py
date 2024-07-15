import requests
# from utilities import *

def post_query(text):
    
  url = "https://ai-textraction.p.rapidapi.com/textraction"
  payload = {
    "text": text,
    "entities": [
  {
    "description": "list of event description, up to 5 word, format example: reminder to take the trash out, meeting with someone",
    "type": "array[string]",
    "var_name": "list_of_events"
  },
  {
    "description": "list of event start time, format example: '9:00 a.m.'",
    "type": "array[string]",
    "var_name": "event_time"
  },
  {
    "description": "list of event end time, format example: '9:00 p.m.'",
    "type": "array[string]",
    "var_name": "end_time"
  },

  {
    "description": "days of the week, format example: today, tonight, monday, friday",
    "type": "array[string]",
    "var_name": "event_dates"
  }
  ,
  {
    "description": "list of attendees for a meeting event, empty if no meeting events",
    "type": "array[string]",
    "var_name": "list_of_attendees"
  }
]
  }
  headers = {
    "content-type": "application/json",
    "X-RapidAPI-Key": "6327b425b1mshb9b103c57c14b6cp1b35d9jsn7b8efd5acc05",
    "X-RapidAPI-Host": "ai-textraction.p.rapidapi.com"
  }

  response = requests.post(url, json=payload, headers=headers)
  return response






