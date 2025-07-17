import firebase_admin
from firebase_admin import auth, credentials
from django.contrib.auth import get_user_model
from rest_framework import authentication, exceptions
import os
from pathlib import Path

User = get_user_model()

class FirebaseAuthentication(authentication.BaseAuthentication):
    def __init__(self):
        # Initialize Firebase app if not already initialized
        if not firebase_admin._apps:
            try:
                # Path to your service account file
                cred_path = Path(__file__).resolve().parent.parent / 'config' / 'firebase-service-account.json'
                
                if not cred_path.exists():
                    raise FileNotFoundError(f"Firebase service account file not found at {cred_path}")
                
                cred = credentials.Certificate(str(cred_path))
                firebase_admin.initialize_app(cred)
            except Exception as e:
                raise RuntimeError(f"Firebase initialization failed: {str(e)}")

    def authenticate(self, request):
        auth_header = request.META.get("HTTP_AUTHORIZATION")
        if not auth_header or not auth_header.startswith("Bearer "):
            return None
            
        token = auth_header.split(" ")[1]
        try:
            decoded_token = auth.verify_id_token(token)
            firebase_user_id = decoded_token["uid"]
            
            try:
                user = User.objects.get(username=firebase_user_id)
                return (user, None)
            except User.DoesNotExist:
                # Create new user with data from Firebase
                firebase_user = auth.get_user(firebase_user_id)
                user = User.objects.create_user(
                    username=firebase_user_id,
                    email=firebase_user.email,
                    first_name=firebase_user.display_name or ""
                )
                return (user, None)
                
        except auth.InvalidIdTokenError:
            raise exceptions.AuthenticationFailed('Invalid Firebase ID token')
        except auth.ExpiredIdTokenError:
            raise exceptions.AuthenticationFailed('Firebase ID token expired')
        except auth.RevokedIdTokenError:
            raise exceptions.AuthenticationFailed('Firebase ID token revoked')
        except Exception as e:
            raise exceptions.AuthenticationFailed(str(e))