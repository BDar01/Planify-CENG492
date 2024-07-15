import os
from datetime import datetime, timedelta
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from pathlib import Path


def convert_hour_to_datetime(start, end, starting_date): # Added helper function to convert hours (0-24) to datetime
    start_datetime = starting_date + timedelta(hours=start)
    end_datetime = starting_date + timedelta(hours=end)
    return start_datetime, end_datetime

def convert_datetime_to_hour(datetime_value, starting_date):
    delta = datetime_value - starting_date
    return int(delta.total_seconds() // 3600)

def format_hour(hour):
    return f"{hour % 24}:00"

def authenticate():
    creds = None

    while True:  # Keep trying until the credentials are valid
        # Access user credentials tokens, access for 1st session and refresh for following
        if os.path.exists('token.json'):
            creds = Credentials.from_authorized_user_file('token.json', "https://www.googleapis.com/auth/calendar.events")

        # If no credentials stored or credentials are invalid, prompt user to log in
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file(
                    "planify_client_secret.json",
                    scopes=["https://www.googleapis.com/auth/calendar.events"],
                    redirect_uri="http://localhost:5005/"
                )
                creds = flow.run_local_server(port=5005)

            # Save the credentials for later authentication
            with open('token.json', 'w') as token:
                token.write(creds.to_json())
        else:
            break  # Exit the loop if credentials are valid

    return creds
