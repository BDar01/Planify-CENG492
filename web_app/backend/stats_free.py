from config import app
from models import Events
from datetime import datetime, timedelta
import numpy as np

def analyze_schedule():
    current_datetime = datetime.today()

    # Calculate start of the week
    start_of_week = current_datetime - timedelta(days=current_datetime.weekday()) - timedelta(hours=current_datetime.hour, minutes=current_datetime.minute, seconds=current_datetime.second)

    # Calculate end of the week
    end_of_week = start_of_week + timedelta(days=6, hours=23, minutes=59, seconds=59)

    # Filter events for the current week
    events = Events.query.filter(Events.fixed_start >= start_of_week, Events.fixed_start <= end_of_week).order_by(Events.fixed_start).all()

    days_of_week = [0, 1, 2, 3, 4, 5, 6]
    event_counts = np.zeros(7)
    energy_usage = np.zeros(7)

    threshold_event_count = 2
    threshold_energy_usage = 5

    for event in events:
        event_day_index = (event.fixed_start.weekday() + 1) % 7
        event_counts[event_day_index] += 1
        energy_usage[event_day_index] += event.energy

    # Find the day(s) with the least number of events and energy usage
    min_event_count_day = set([days_of_week[i] for i, count in enumerate(event_counts) if count == min(event_counts) and count <= threshold_event_count])
    min_energy_usage_day = set([days_of_week[i] for i, energy in enumerate(energy_usage) if energy == min(energy_usage) and energy <= threshold_energy_usage])

    available_days = min_event_count_day.intersection(min_energy_usage_day)

    return available_days

if __name__ == '__main__':
    with app.app_context():
        available_days = analyze_schedule()
        if available_days:
            print("Available days for scheduling new events:", available_days)
        else:
            print("No common available days found.")
