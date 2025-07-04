"""
WSGI config for report_backend project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/wsgi/
"""

# import os

# from django.core.wsgi import get_wsgi_application


# settings_module = 'report_backend.settings' if os.environ.get('RENDER_EXTERNAL_HOSTNAME') else 'report_backend.report_backend.settings'
# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'report_backend.settings')
# application = get_wsgi_application()

# settings_module = 'report_backend.deployment_settings' if os.environ.get('RENDER_EXTERNAL_HOSTNAME') else 'report_backend.settings'
# os.environ.setdefault('DJANGO_SETTINGS_MODULE', settings_module)


import os
from django.core.wsgi import get_wsgi_application

# Set the correct settings module based on environment
if os.environ.get('RENDER_EXTERNAL_HOSTNAME'):
    # Production/Render environment
    settings_module = 'report_backend.report_backend.settings'
else:
    # Local development
    settings_module = 'report_backend.report_backend.settings'

os.environ.setdefault('DJANGO_SETTINGS_MODULE', settings_module)
application = get_wsgi_application()

