import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent


SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-pn&8gvtrm-n%1+8!z_1da+-jk83o+0k%-5k1kl7(32&yp+jxkk')

DEBUG = os.getenv('DEBUG', 'False') == 'True'  # Default to False for security

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third party apps
    'rest_framework',
    'corsheaders',
    'rest_framework_simplejwt.token_blacklist',
    'django_ratelimit',
    'axes',  # Account lockout
    'health_check',  # Health monitoring
    'health_check.db',
    'health_check.cache',
    'health_check.storage',
    # Local apps
    'ClinicalH',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'axes.middleware.AxesMiddleware',  # Account lockout - must be after AuthenticationMiddleware
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Axes (Account Lockout) Configuration
AUTHENTICATION_BACKENDS = [
    'axes.backends.AxesBackend',  # Must be first
    'django.contrib.auth.backends.ModelBackend',
]

AXES_ENABLED = not DEBUG  # Only enable in production
AXES_FAILURE_LIMIT = 5  # Lock after 5 failed attempts
AXES_COOLOFF_TIME = 1  # Lock for 1 hour
AXES_RESET_ON_SUCCESS = True
AXES_LOCKOUT_TEMPLATE = None  # Use API response instead
AXES_LOCKOUT_URL = None
AXES_VERBOSE = True

# Cache Configuration - Required for django-ratelimit and axes
# Using database cache for Docker environment (no Redis required)
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.db.DatabaseCache',
        'LOCATION': 'django_cache_table',
    }
}

# Rate limiting configuration
# Disabled because it requires Redis or Memcached for atomic increment support
# To enable rate limiting, add Redis to docker-compose and configure CACHES with Redis
RATELIMIT_ENABLE = False

# Silence ratelimit checks since it's disabled
SILENCED_SYSTEM_CHECKS = ['django_ratelimit.W001', 'django_ratelimit.E003']

# CORS Configuration - Allow React frontend
CORS_ALLOWED_ORIGINS = os.getenv(
    'CORS_ALLOWED_ORIGINS',
    'http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000,http://localhost:80,http://localhost'
).split(',')

CORS_ALLOW_CREDENTIALS = True

# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 50,
}
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}

ROOT_URLCONF = 'SextaMedical.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'SextaMedical.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases

# Database configuration - Always use PostgreSQL in Docker
POSTGRES_DB = os.getenv('POSTGRES_DB', 'sexta_medical_db')
POSTGRES_USER = os.getenv('POSTGRES_USER', 'sexta_user')
POSTGRES_PASSWORD = os.getenv('POSTGRES_PASSWORD', 'Ars0.1.2.1')
POSTGRES_HOST = os.getenv('POSTGRES_HOST', 'localhost')
POSTGRES_PORT = os.getenv('POSTGRES_PORT', '5432')

# Use PostgreSQL if POSTGRES_HOST is set (Docker) or POSTGRES_DB env var exists
if POSTGRES_HOST != 'localhost' or os.getenv('POSTGRES_DB'):
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': POSTGRES_DB,
            'USER': POSTGRES_USER,
            'PASSWORD': POSTGRES_PASSWORD,
            'HOST': POSTGRES_HOST,
            'PORT': POSTGRES_PORT,
        }
    }
else:
    # Fallback to SQLite only for local development without Docker
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }


# Password validation
# https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 8,  # Minimum 8 characters
        }
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Custom password validator for complexity
class PasswordComplexityValidator:
    """
    Validate that the password contains at least one uppercase letter,
    one lowercase letter, one digit, and one special character.
    """
    def validate(self, password, user=None):
        import re
        if not re.search(r'[A-Z]', password):
            from django.core.exceptions import ValidationError
            raise ValidationError(
                "La contraseña debe contener al menos una letra mayúscula.",
                code='password_no_upper',
            )
        if not re.search(r'[a-z]', password):
            from django.core.exceptions import ValidationError
            raise ValidationError(
                "La contraseña debe contener al menos una letra minúscula.",
                code='password_no_lower',
            )
        if not re.search(r'[0-9]', password):
            from django.core.exceptions import ValidationError
            raise ValidationError(
                "La contraseña debe contener al menos un número.",
                code='password_no_digit',
            )
        if not re.search(r'[^A-Za-z0-9]', password):
            from django.core.exceptions import ValidationError
            raise ValidationError(
                "La contraseña debe contener al menos un carácter especial.",
                code='password_no_special',
            )

    def get_help_text(self):
        return "La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial."

# Add custom validator (optional - can be enabled for production)
# AUTH_PASSWORD_VALIDATORS.append({
#     'NAME': 'SextaMedical.settings.PasswordComplexityValidator',
# })


# Internationalization
# https://docs.djangoproject.com/en/5.2/topics/i18n/

LANGUAGE_CODE = 'es-co'

TIME_ZONE = 'America/Bogota'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.2/howto/static-files/

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Media files (user uploads)
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Default primary key field type
# https://docs.djangoproject.com/en/5.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Security Settings (Production)
USE_HTTPS = os.getenv('USE_HTTPS', 'False') == 'True'  # Set to True when SSL is configured

if not DEBUG:
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'
    SECURE_HSTS_SECONDS = 31536000  # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SECURE_SSL_REDIRECT = USE_HTTPS  # Redirect HTTP to HTTPS when enabled
    SESSION_COOKIE_SECURE = USE_HTTPS
    CSRF_COOKIE_SECURE = USE_HTTPS
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https') if USE_HTTPS else None

# Logging Configuration
# Create logs directory if it doesn't exist (only in production)
if not DEBUG:
    logs_dir = BASE_DIR / 'logs'
    logs_dir.mkdir(exist_ok=True)

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'level': 'DEBUG' if DEBUG else 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        'ClinicalH': {
            'handlers': ['console'],
            'level': 'DEBUG' if DEBUG else 'INFO',
            'propagate': False,
        },
        'django_ratelimit': {
            'handlers': ['console'],
            'level': 'WARNING',
            'propagate': False,
        },
    },
}

# Add file handler only in production (when DEBUG=False)
if not DEBUG:
    LOGGING['handlers']['file'] = {
        'level': 'INFO',
        'class': 'logging.handlers.RotatingFileHandler',
        'filename': str(BASE_DIR / 'logs' / 'django.log'),
        'maxBytes': 1024 * 1024 * 5,  # 5 MB
        'backupCount': 5,
        'formatter': 'verbose',
    }
    # Add file handler to root and loggers
    LOGGING['root']['handlers'].append('file')
    LOGGING['loggers']['django']['handlers'].append('file')
    LOGGING['loggers']['ClinicalH']['handlers'].append('file')
    LOGGING['loggers']['django_ratelimit']['handlers'].append('file')

# Create logs directory if it doesn't exist (only in production)
if not DEBUG:
    import os
    logs_dir = BASE_DIR / 'logs'
    os.makedirs(logs_dir, exist_ok=True)

# Sentry Error Tracking (Optional - configure SENTRY_DSN in .env)
SENTRY_DSN = os.getenv('SENTRY_DSN', None)
if SENTRY_DSN and not DEBUG:
    import sentry_sdk
    import logging
    from sentry_sdk.integrations.django import DjangoIntegration
    from sentry_sdk.integrations.logging import LoggingIntegration
    
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=[
            DjangoIntegration(
                transaction_style='url',
                middleware_spans=True,
                signals_spans=True,
            ),
            LoggingIntegration(
                level=logging.INFO,
                event_level=logging.ERROR
            ),
        ],
        traces_sample_rate=0.1,  # 10% of transactions
        send_default_pii=False,  # Don't send PII
        environment=os.getenv('ENVIRONMENT', 'production'),
    )

# Health Check Configuration
HEALTH_CHECK = {
    'DISK_USAGE_MAX': 90,  # Alert if disk usage exceeds 90%
    'MEMORY_MIN': 100,  # Alert if memory below 100MB
}
