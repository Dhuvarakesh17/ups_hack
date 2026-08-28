import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging
from app.core.config import settings
from app.models.models import Shipment

logger = logging.getLogger("email_service")

class EmailService:
    @staticmethod
    def send_status_update_email(shipment: Shipment, old_status: str, new_status: str) -> bool:
        recipient = shipment.sender_email
        subject = f"One Logistics Update: Shipment {shipment.shipment_number} is now {new_status.replace('_', ' ').upper()}"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #1e3a8a, #2563eb); padding: 24px; border-radius: 16px; color: white; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">ONE LOGISTICS</h1>
                <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 13px;">Real-Time Shipment Milestone Notification</p>
            </div>
            
            <div style="padding: 24px 0;">
                <p>Hello <strong>{shipment.sender_name}</strong>,</p>
                <p>Your shipment <strong>{shipment.shipment_number}</strong> ({shipment.product_name}) has updated status:</p>
                
                <div style="background-color: #f1f5f9; border-left: 4px solid #2563eb; padding: 16px; border-radius: 8px; margin: 16px 0;">
                    <p style="margin: 0; font-size: 13px; color: #64748b;">Current Status</p>
                    <h2 style="margin: 4px 0; color: #1e3a8a; text-transform: uppercase;">{new_status.replace('_', ' ')}</h2>
                    <p style="margin: 4px 0 0 0; font-size: 12px; color: #475569;">Previous: {old_status.replace('_', ' ')}</p>
                </div>

                <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 16px;">
                    <tr>
                        <td style="padding: 8px 0; color: #64748b;">Recipient:</td>
                        <td style="padding: 8px 0; font-weight: bold;">{shipment.receiver_name}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #64748b;">Destination:</td>
                        <td style="padding: 8px 0; font-weight: bold;">{shipment.receiver_city}, {shipment.receiver_state} {shipment.receiver_postal_code}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #64748b;">Service Level:</td>
                        <td style="padding: 8px 0; font-weight: bold; text-transform: capitalize;">{shipment.delivery_type} Linehaul</td>
                    </tr>
                </table>
            </div>

            <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 11px; color: #94a3b8; text-align: center;">
                <p>This is an automated notification from One Logistics Platform.</p>
            </div>
        </body>
        </html>
        """

        # Log simulated dispatch
        logger.info(f"[EMAIL DISPATCHED] To: {recipient} | Subject: {subject}")
        print(f"\n📨 [EMAIL SIMULATION] Sent to {recipient} -> Status updated to {new_status.upper()}")

        if settings.SMTP_HOST and settings.SMTP_USER and settings.SMTP_PASSWORD:
            try:
                msg = MIMEMultipart("alternative")
                msg["Subject"] = subject
                msg["From"] = settings.FROM_EMAIL
                msg["To"] = recipient
                msg.attach(MIMEText(html_content, "html"))

                with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                    server.starttls()
                    server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                    server.sendmail(settings.FROM_EMAIL, recipient, msg.as_string())
                return True
            except Exception as e:
                logger.error(f"Failed to send email via SMTP: {e}")
                return False
        return True

