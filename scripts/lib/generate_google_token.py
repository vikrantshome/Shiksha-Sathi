import os
import sys

try:
    import google.oauth2.credentials
    import google_auth_oauthlib.flow
    from google.auth.transport.requests import Request
except ImportError:
    print("Required Google auth libraries are not installed.")
    print("Please run: pip install --upgrade google-api-python-client google-auth-httplib2 google-auth-oauthlib")
    sys.exit(1)

# This is the scope required to create and manage Google Sheets files.
SCOPES = ['https://www.googleapis.com/auth/drive']

def main():
    """Shows basic usage of the Google Sheets API.
    Creates a new token.json file with user credentials.
    """
    creds = None
    
    # Correctly resolve paths relative to the project root where this script is run from
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
    client_secrets_file = os.path.join(project_root, 'google', 'client_secret.json')
    token_file = os.path.join(project_root, 'google', 'token.json')

    if not os.path.exists(client_secrets_file):
        print(f"Error: '{client_secrets_file}' not found.")
        print("Please ensure you have downloaded your credentials and placed them in the 'google/' directory.")
        return

    # The file token.json stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first time.
    if os.path.exists(token_file):
        print(f"'{token_file}' already exists. If you want to re-authenticate, please delete it first and run again.")
        return

    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            print("Starting authentication flow... Your browser will open for you to log in.")
            flow = google_auth_oauthlib.flow.InstalledAppFlow.from_client_secrets_file(
                client_secrets_file, SCOPES)
            creds = flow.run_local_server(port=0)
        # Save the credentials for the next run
        with open(token_file, 'w') as token:
            token.write(creds.to_json())
    
    print(f"✅ Successfully created '{token_file}'. You are now authenticated.")
    print("You can now run the backend and use the 'Open in Google Sheets' feature.")

if __name__ == '__main__':
    main()
