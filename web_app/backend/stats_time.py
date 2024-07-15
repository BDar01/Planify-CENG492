from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from scipy import stats
from datetime import datetime, timedelta
from config import app
from models import Events

def calculate_productivity_scores():
    # Divide time into windows for morning and afternoon
    morning_start_time = datetime.strptime('08:00:00', '%H:%M:%S').time()
    afternoon_start_time = datetime.strptime('14:00:00', '%H:%M:%S').time()

    current_datetime = datetime.today()

    # Set start time to 8 am
    time_difference = current_datetime - current_datetime.replace(hour=8, minute=0, second=0, microsecond=0)

    # Calculate start of the week
    start_of_week = current_datetime - timedelta(days=current_datetime.weekday()) - time_difference

    # Calculate end of the week
    end_of_week = start_of_week + timedelta(days=6) + timedelta(hours=15, minutes=59)

    print(start_of_week)
    print(end_of_week)

    # Filter events for the current week
    events = Events.query.filter(Events.fixed_start >= start_of_week, Events.fixed_start <= end_of_week).all()
    print(events)
    
    morning_scores = []
    afternoon_scores = []

    for event in events:
        event_time = event.fixed_start.time()

        productivity_score = event.energy

        if event_time < afternoon_start_time:
            morning_scores.append(productivity_score)
        else:
            afternoon_scores.append(productivity_score)
    
    print(morning_scores)
    print(afternoon_scores)
    
    return morning_scores, afternoon_scores

def perform_t_test():
    morning_scores, afternoon_scores = calculate_productivity_scores()

    mean_morning_score = sum(morning_scores) / len(morning_scores) if morning_scores else 0
    mean_afternoon_score = sum(afternoon_scores) / len(afternoon_scores) if afternoon_scores else 0

    print("Mean productivity score for morning:", mean_morning_score)
    print("Mean productivity score for afternoon:", mean_afternoon_score)

    t_statistic, p_value = stats.ttest_ind(morning_scores, afternoon_scores)

    print("T-statistic:", t_statistic)
    print("P-value:", p_value)

    if p_value < 0.05:
        print("Reject the null hypothesis: There is a statistically significant difference in productivity between morning and afternoon.")
    else:
        print("Fail to reject the null hypothesis: There is no statistically significant difference in productivity between morning and afternoon.")

    if mean_morning_score > mean_afternoon_score:
        print("Morning is more productive.")
        return 1
    elif mean_morning_score < mean_afternoon_score:
        print("Afternoon is more productive.")
        return 2
    else:
        print("Morning and afternoon have the same productivity.")
        return 0

if __name__ == '__main__':
    with app.app_context():
        perform_t_test()
