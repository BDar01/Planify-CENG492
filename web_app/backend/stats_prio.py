import random
from config import app
from models import Events
from datetime import datetime, timedelta
from scipy.stats import pearsonr

def calculate_efficiency_scores():
    current_datetime = datetime.today()

    # Set start time to 8 am
    time_difference = current_datetime - current_datetime.replace(hour=8, minute=0, second=0, microsecond=0)

    # Calculate start of the week
    start_of_week = current_datetime - timedelta(days=current_datetime.weekday()) - time_difference

    # Calculate end of the week
    end_of_week = start_of_week + timedelta(days=6) + timedelta(hours=15, minutes=59)

    # Filter events for the current week
    events = Events.query.filter(Events.fixed_start >= start_of_week, Events.fixed_start <= end_of_week).all()

    priorities = []
    durations = []

    for event in events:
        priorities.append(event.priority)
        duration = (event.fixed_end - event.fixed_start).total_seconds() / 3600
        durations.append(duration)

    correlation_coefficient, p_value = pearsonr(priorities, durations)

    alpha = 0.05

    if p_value < alpha:
        print("Reject the null hypothesis: There is a statistically significant correlation between priority and efficiency.")
        return 0
    else:
        print("Fail to reject the null hypothesis: There is no statistically significant correlation between priority and efficiency.")
        return 1
    
if __name__ == '__main__':
    with app.app_context():
        correlation_coefficient, p_value = calculate_efficiency_scores()