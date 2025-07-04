#!/usr/bin/env python
# """Django's command-line utility for administrative tasks."""
# import os
# import sys


# def main():
#     """Run administrative tasks."""
#     # settings_module = 'report_backend.deployment_settings' if os.environ.get('RENDER_EXTERNAL_HOSTNAME') else 'report_backend.settings'
#     # os.environ.setdefault('DJANGO_SETTINGS_MODULE', settings_module)

#     # Ensure the outer folder is on the Python path
#     sys.path.append(os.path.dirname(os.path.abspath(__file__)))

#     settings_module = 'report_backend.settings' if os.environ.get('RENDER_EXTERNAL_HOSTNAME') else 'report_backend.report_backend.settings'
#     os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'report_backend.settings')

#     try:
#         from django.core.management import execute_from_command_line
#     except ImportError as exc:
#         raise ImportError(
#             "Couldn't import Django. Are you sure it's installed and "
#             "available on your PYTHONPATH environment variable? Did you "
#             "forget to activate a virtual environment?"
#         ) from exc
#     execute_from_command_line(sys.argv)


# if __name__ == '__main__':
#     main()


#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


def main():
    """Run administrative tasks."""
    # Add the current directory to Python path
    current_dir = os.path.dirname(os.path.abspath(__file__))
    sys.path.insert(0, current_dir)
    
    # Set the correct settings module based on environment
    if os.environ.get('RENDER_EXTERNAL_HOSTNAME'):
        # Production/Render environment
        settings_module = 'report_backend.settings'
    else:
        # Local development
        settings_module = 'report_backend.settings'

    os.environ.setdefault('DJANGO_SETTINGS_MODULE', settings_module)

    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
