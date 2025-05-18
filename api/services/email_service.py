import logging
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Email configuration
EMAIL_HOST = os.getenv("EMAIL_HOST", "localhost")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", 1025))  # Default to mailhog port
EMAIL_USERNAME = os.getenv("EMAIL_USERNAME", "")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD", "")
EMAIL_FROM = os.getenv("EMAIL_FROM", "notifications@example.com")
EMAIL_USE_TLS = os.getenv("EMAIL_USE_TLS", "False").lower() == "true"

async def send_email(recipient: str, subject: str, content: str) -> bool:
    """
    Send an email using SMTP.
    Returns True if successful, False otherwise.
    
    In development, you can use a tool like MailHog for testing:
    - MailHog runs on port 1025 for SMTP and 8025 for the web UI
    - You can install it from https://github.com/mailhog/MailHog
    """
    try:
        # Create message
        message = MIMEMultipart()
        message["From"] = EMAIL_FROM
        message["To"] = recipient
        message["Subject"] = subject
        
        # Attach text content
        message.attach(MIMEText(content, "html"))
        
        # For development/testing, log the email instead of sending it
        if os.getenv("ENVIRONMENT", "development") == "development":
            logger.info(f"[DEV MODE] Email to: {recipient}, Subject: {subject}, Content: {content}")
            return True
        
        # Send email
        await aiosmtplib.send(
            message,
            hostname=EMAIL_HOST,
            port=EMAIL_PORT,
            username=EMAIL_USERNAME or None,
            password=EMAIL_PASSWORD or None,
            use_tls=EMAIL_USE_TLS
        )
        
        logger.info(f"Email sent to {recipient}")
        return True
    except Exception as e:
        logger.exception(f"Failed to send email: {str(e)}")
        return False