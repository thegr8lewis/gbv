# set -o errexit

# pip install -r requirements.txt
# python manage.py collectstatic --noinput
# python manage.py migrate


#!/usr/bin/env bash
set -o errexit

# Move into the Django backend folder
cd report_backend

pip install -r ../requirements.txt
python manage.py collectstatic --noinput
python manage.py migrate
