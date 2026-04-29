
import sys, json, requests
from requests.auth import HTTPBasicAuth
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

BASE_URL = 'https://assetdevops.com'
USERNAME = 'venu'
PASSWORD = 'Venu@2425'
PROJECT = 'jhs'

def fetch_issues():
    session = requests.Session()
    session.auth = HTTPBasicAuth(USERNAME, PASSWORD)
    session.verify = False
    all_issues = []
    offset = 0
    limit = 100
    while True:
        url = f'{BASE_URL}/projects/{PROJECT}/issues.json'
        params = {'tracker_id': 2, 'status_id': 'open', 'limit': limit, 'offset': offset}
        try:
            resp = session.get(url, params=params, timeout=30)
            if resp.status_code != 200:
                print(json.dumps({'error': f'HTTP {resp.status_code}'})); sys.exit(1)
            data = resp.json()
            all_issues.extend(data.get('issues', []))
            total = data.get('total_count', 0)
            offset += limit
            if offset >= total: break
        except Exception as e:
            print(json.dumps({'error': str(e)})); sys.exit(1)
    filtered = []
    for issue in all_issues:
        status = issue.get('status', {}).get('name', '')
        if status in ['Ready for test', 'New']:
            filtered.append({'id': issue.get('id'), 'subject': issue.get('subject'), 'status': status, 'url': f'{BASE_URL}/issues/{issue.get("id")}'})
    print(json.dumps({'total': len(filtered), 'issues': filtered}, indent=2))

fetch_issues()
