# #!/usr/bin/env bash
# set -o errexit

# # Move into the Django backend folder
# cd report_backend

# pip install -r ../requirements.txt
# python manage.py collectstatic --noinput
# python manage.py migrate


#!/usr/bin/env bash
# Exit on error
set -o errexit

# Install dependencies
pip install -r requirements.txt

# Navigate to the Django project directory
cd report_backend

# Collect static files
python manage.py collectstatic --noinput

# Run migrations
python manage.py migrate