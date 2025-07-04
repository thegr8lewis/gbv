"""
WSGI config for report_backend project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application


settings_module = 'report_backend.report_backend.deployment_settings' if os.environ.get('RENDER_EXTERNAL_HOSTNAME') else 'report_backend.report_backend.settings'
os.environ.setdefault('DJANGO_SETTINGS_MODULE', settings_module)
# settings_module = 'report_backend.deployment_settings' if os.environ.get('RENDER_EXTERNAL_HOSTNAME') else 'report_backend.settings'
# os.environ.setdefault('DJANGO_SETTINGS_MODULE', settings_module)

application = get_wsgi_application()
