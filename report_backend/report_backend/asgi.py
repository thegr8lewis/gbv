"""
ASGI config for report_backend project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application

settings_module = 'report_backend.deployment_settings' if os.environ.get('RENDER_EXTERNAL_HOSTNAME') else 'report_backend.settings'

os.environ.setdefault('DJANGO_SETTINGS_MODULE', settings_module)

application = get_asgi_application()
