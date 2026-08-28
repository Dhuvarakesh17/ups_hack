import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging
import httpx
from app.core.config import settings
from app.models.models import Shipment

logger = logging.getLogger("email_service")

class EmailService:
    @staticmethod
    def _get_base_styles() -> str:
        return """
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f8fafc;
            margin: 0;
            padding: 24px;
            color: #17231b;
        """

    @staticmethod
    def dispatch_email(recipient: str, subject: str, html_body: str) -> bool:
        """
        Sends email via Resend API or SMTP (Gmail/SendGrid/SES), or falls back to simulation console log.
        """
        if not recipient:
            logger.warning("[EMAIL SERVICE] No recipient email provided. Skipping dispatch.")
            return False

        # 1. Option A: Resend API
        if settings.RESEND_API_KEY:
            try:
                response = httpx.post(
                    "https://api.resend.com/emails",
                    headers={
                        "Authorization": f"Bearer {settings.RESEND_API_KEY}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "from": settings.FROM_EMAIL,
                        "to": [recipient],
                        "subject": subject,
                        "html": html_body
                    },
                    timeout=10.0
                )
                if response.status_code in (200, 201):
                    logger.info(f"[RESEND SUCCESS] Sent email to {recipient} (Subject: {subject})")
                    return True
                else:
                    logger.error(f"[RESEND ERROR] Status {response.status_code}: {response.text}")
            except Exception as e:
                logger.error(f"[RESEND EXCEPTION] {e}")

        # 2. Option B: Standard SMTP (Gmail, SendGrid, SES, Mailgun)
        if settings.SMTP_HOST and settings.SMTP_USER and settings.SMTP_PASSWORD:
            try:
                msg = MIMEMultipart("alternative")
                msg["Subject"] = subject
                msg["From"] = settings.FROM_EMAIL
                msg["To"] = recipient
                msg.attach(MIMEText(html_body, "html"))

                with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
                    server.starttls()
                    server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                    server.sendmail(settings.FROM_EMAIL, recipient, msg.as_string())
                logger.info(f"[SMTP SUCCESS] Sent email to {recipient} (Subject: {subject})")
                return True
            except Exception as e:
                logger.error(f"[SMTP EXCEPTION] Failed to send via SMTP: {e}")
                # Fall through to simulation log

        # 3. Option C: Local Dev Simulation Logger
        logger.info(f"[EMAIL SIMULATED] To: {recipient} | Subject: {subject}")
        print(f"\n=======================================================")
        print(f"📨 [EMAIL NOTIFICATION DISPATCHED]")
        print(f"To: {recipient}")
        print(f"Subject: {subject}")
        print(f"=======================================================\n")
        return True

    @classmethod
    def send_booking_confirmation_email(cls, shipment: Shipment) -> bool:
        """
        Sends booking confirmation receipt when a new shipment is created.
        """
        recipient = shipment.sender_email
        tracking_url = f"{settings.FRONTEND_URL}/shipments/{shipment.id}"
        subject = f"Booking Confirmed: {shipment.shipment_number} ({shipment.product_name})"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <body style="{cls._get_base_styles()}">
            <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2ebd0; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
                <!-- Header -->
                <div style="background-color: #17231b; padding: 28px; text-align: center;">
                    <span style="color: #d9ff69; font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;">ONE LOGISTICS</span>
                    <h1 style="color: #edf7cd; margin: 8px 0 0 0; font-size: 22px; font-weight: 800;">Shipment Booked Successfully</h1>
                </div>

                <!-- Body -->
                <div style="padding: 28px;">
                    <p style="font-size: 15px; margin: 0 0 16px 0;">Hello <strong>{shipment.sender_name}</strong>,</p>
                    <p style="font-size: 14px; color: #475569; margin: 0 0 20px 0; line-height: 1.5;">
                        Your shipment for <strong>{shipment.product_name}</strong> has been booked and scheduled for processing.
                    </p>

                    <!-- Details Card -->
                    <div style="background-color: #edf7cd; border-radius: 14px; padding: 18px; margin-bottom: 24px; border: 1px solid #d9ff69;">
                        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                            <tr>
                                <td style="padding: 6px 0; color: #17231b; font-weight: bold;">Tracking ID:</td>
                                <td style="padding: 6px 0; text-align: right; font-family: monospace; font-weight: 800; color: #17231b;">{shipment.shipment_number}</td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 0; color: #17231b; font-weight: bold;">Service Level:</td>
                                <td style="padding: 6px 0; text-align: right; font-weight: 600; text-transform: capitalize; color: #17231b;">{shipment.delivery_type}</td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 0; color: #17231b; font-weight: bold;">Destination:</td>
                                <td style="padding: 6px 0; text-align: right; font-weight: 600; color: #17231b;">{shipment.receiver_city}, {shipment.receiver_state}</td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 0; color: #17231b; font-weight: bold;">Amount Paid:</td>
                                <td style="padding: 6px 0; text-align: right; font-weight: 800; color: #17231b;">${(shipment.total_amount or 0.0):.2f}</td>
                            </tr>
                        </table>
                    </div>

                    <!-- Button CTA -->
                    <div style="text-align: center; margin: 28px 0;">
                        <a href="{tracking_url}" style="background-color: #17231b; color: #d9ff69; padding: 14px 28px; border-radius: 12px; font-weight: 800; font-size: 13px; text-decoration: none; display: inline-block;">
                            Track Shipment in Dashboard
                        </a>
                    </div>
                </div>

                <!-- Footer -->
                <div style="border-top: 1px solid #e2ebd0; padding: 16px; background-color: #fafbf8; text-align: center; font-size: 11px; color: #94a3b8;">
                    <p style="margin: 0;">One Logistics Experience &copy; 2026. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        return cls.dispatch_email(recipient, subject, html_content)

    @classmethod
    def send_status_update_email(cls, shipment: Shipment, old_status: str, new_status: str) -> bool:
        """
        Sends milestone update email when shipment transitions (e.g. In Transit, Out for Delivery, Delivered).
        """
        recipient = shipment.sender_email
        tracking_url = f"{settings.FRONTEND_URL}/shipments/{shipment.id}"
        formatted_status = new_status.replace("_", " ").upper()
        subject = f"Milestone Update: Shipment {shipment.shipment_number} is {formatted_status}"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <body style="{cls._get_base_styles()}">
            <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2ebd0; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
                <!-- Header -->
                <div style="background-color: #17231b; padding: 24px; text-align: center;">
                    <span style="color: #d9ff69; font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;">ONE LOGISTICS TRACKING</span>
                    <h1 style="color: #edf7cd; margin: 8px 0 0 0; font-size: 20px; font-weight: 800;">Shipment Milestone Updated</h1>
                </div>

                <!-- Body -->
                <div style="padding: 28px;">
                    <p style="font-size: 14px; margin: 0 0 16px 0;">Hello <strong>{shipment.sender_name}</strong>,</p>
                    
                    <!-- Milestone Banner -->
                    <div style="background-color: #edf7cd; border-left: 5px solid #17231b; border-radius: 8px; padding: 18px; margin: 16px 0;">
                        <span style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #17231b; opacity: 0.8;">Current Milestone</span>
                        <h2 style="margin: 4px 0 2px 0; color: #17231b; font-size: 22px; font-weight: 900;">{formatted_status}</h2>
                        <span style="font-size: 12px; color: #526356;">Previous: {old_status.replace('_', ' ').title()}</span>
                    </div>

                    <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 20px;">
                        <tr>
                            <td style="padding: 6px 0; color: #64748b;">Tracking ID:</td>
                            <td style="padding: 6px 0; font-weight: bold; text-align: right;">{shipment.shipment_number}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; color: #64748b;">Destination:</td>
                            <td style="padding: 6px 0; font-weight: bold; text-align: right;">{shipment.receiver_city}, {shipment.receiver_state}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; color: #64748b;">Recipient:</td>
                            <td style="padding: 6px 0; font-weight: bold; text-align: right;">{shipment.receiver_name}</td>
                        </tr>
                    </table>

                    <!-- CTA -->
                    <div style="text-align: center; margin: 28px 0 12px 0;">
                        <a href="{tracking_url}" style="background-color: #17231b; color: #d9ff69; padding: 12px 24px; border-radius: 12px; font-weight: 800; font-size: 13px; text-decoration: none; display: inline-block;">
                            View Live Timeline & Route
                        </a>
                    </div>
                </div>

                <!-- Footer -->
                <div style="border-top: 1px solid #e2ebd0; padding: 16px; background-color: #fafbf8; text-align: center; font-size: 11px; color: #94a3b8;">
                    <p style="margin: 0;">Automated notification from One Logistics Platform.</p>
                </div>
            </div>
        </body>
        </html>
        """
        return cls.dispatch_email(recipient, subject, html_content)

    @classmethod
    def send_delay_alert_email(cls, shipment: Shipment, delay_reason: str, new_eta: str) -> bool:
        """
        Sends predictive disruption warning when route delay is detected.
        """
        recipient = shipment.sender_email
        tracking_url = f"{settings.FRONTEND_URL}/shipments/{shipment.id}"
        subject = f"⚠️ Schedule Notice: Delay Detected on Shipment {shipment.shipment_number}"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <body style="{cls._get_base_styles()}">
            <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #fecdd3;">
                <div style="background-color: #be123c; padding: 24px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800;">Transit Delay Advisory</h1>
                </div>
                <div style="padding: 24px;">
                    <p style="font-size: 14px;">Hello <strong>{shipment.sender_name}</strong>,</p>
                    <p style="font-size: 13px; color: #475569;">
                        Our real-time AI telemetry has flagged a potential delay on shipment <strong>{shipment.shipment_number}</strong>:
                    </p>
                    <div style="background-color: #fff1f2; border-left: 4px solid #be123c; padding: 14px; border-radius: 8px; margin: 16px 0;">
                        <p style="margin: 0; font-weight: bold; color: #9f1239; font-size: 13px;">Reason: {delay_reason}</p>
                        <p style="margin: 4px 0 0 0; font-size: 12px; color: #be123c;">Updated Estimated Delivery: <strong>{new_eta}</strong></p>
                    </div>
                    <div style="text-align: center; margin: 24px 0 8px 0;">
                        <a href="{tracking_url}" style="background-color: #17231b; color: #d9ff69; padding: 12px 24px; border-radius: 12px; font-weight: 800; font-size: 13px; text-decoration: none; display: inline-block;">
                            Review Shipment Details
                        </a>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
        return cls.dispatch_email(recipient, subject, html_content)
