# set -o errexit

# pip install -r requirements.txt
# python manage.py collectstatic --noinput
# python manage.py migrate


#!/usr/bin/env bash
set -o errexit

# Move to the directory containing this script (report_backend/)
cd "$(dirname "$0")"

# Install dependencies
pip install -r requirements.txt

# Run Django commands using the correct path
python manage.py collectstatic --noinput
python manage.py migrate
