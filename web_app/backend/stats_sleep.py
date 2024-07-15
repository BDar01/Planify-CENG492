from config import app
from models import Events
from datetime import datetime, timedelta
from scipy.stats import pearsonr

def calculate_sleep_productivity_scores():
    current_datetime = datetime.today()

    # Calculate start of the week
    start_of_week = current_datetime - timedelta(days=current_datetime.weekday()) - timedelta(hours=current_datetime.hour, minutes=current_datetime.minute, seconds=current_datetime.second)

    # Calculate end of the week
    end_of_week = start_of_week + timedelta(days=6, hours=23, minutes=59, seconds=59)

    # Filter events for the current week
    events = Events.query.filter(Events.fixed_start >= start_of_week, Events.fixed_start <= end_of_week).order_by(Events.fixed_start).all()

    productivity_scores = []
    sleep_durations = []

    # Set a sleep schedule
    sleep_start = start_of_week.replace(hour=0, minute=0, second=0)
    sleep_end = start_of_week.replace(hour=10, minute=0, second=0)

    prev_day_end = start_of_week - timedelta(seconds=1)  # Initialize previous day end time
    for event in events:
        event_start = event.fixed_start
        # Check if event interferes with sleep schedule
        if event_start < sleep_end:

            sleep_end = event_start
            sleep_duration = (sleep_end - sleep_start).total_seconds() / 3600
            
            if sleep_duration > 0:
                sleep_durations.append(sleep_duration)
                productivity_scores.append(event.energy)
            
            # Update sleep schedule start time for the next day
            sleep_start = event.fixed_end.replace(hour=0, minute=0, second=0)
        # Update previous day end time
        prev_day_end = event.fixed_end

    # Add remaining sleep duration if the week ends before end of sleep
    remaining_sleep_duration = (sleep_end - sleep_start).total_seconds() / 3600
    if remaining_sleep_duration > 0:
        sleep_durations.append(remaining_sleep_duration)
        productivity_scores.append(1)

    correlation_coefficient, p_value = pearsonr(sleep_durations, productivity_scores)

    alpha = 0.05

    if p_value < alpha:
        print("Reject the null hypothesis: There is a statistically significant correlation between sleep duration and productivity.")
        return 0
    else:
        print("Fail to reject the null hypothesis: There is no statistically significant correlation between sleep duration and productivity.")
        return 1

    return correlation_coefficient, p_value

if __name__ == '__main__':
    with app.app_context():
        correlation_coefficient, p_value = calculate_sleep_productivity_scores()
        print("Pearson correlation coefficient:", correlation_coefficient)
        print("P-value:", p_value)