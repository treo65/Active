"""
Webhook routes for n8n workflow integration
"""
from flask import Blueprint, request, jsonify
import logging
from datetime import datetime
import json

webhook_bp = Blueprint('webhooks', __name__)
logger = logging.getLogger(__name__)

@webhook_bp.route('/new-applicant', methods=['POST'])
def new_applicant():
    """
    Main webhook endpoint for new applicants
    Triggered by: Brevo, Apollo, LinkedIn, Facebook, Google Forms
    """
    try:
        data = request.json
        logger.info(f"📥 New applicant webhook received from {request.remote_addr}")
        
        # Extract applicant data based on source
        source = data.get('source', request.headers.get('X-Source', 'unknown'))
        
        applicant_data = {
            'name': data.get('name', data.get('firstName', '') + ' ' + data.get('lastName', '')),
            'email': data.get('email'),
            'phone': data.get('phone', data.get('mobile', '')),
            'resume_text': data.get('resume_text', data.get('description', data.get('notes', ''))),
            'resume_url': data.get('resume_url', data.get('cv_url', '')),
            'source': source,
            'job_title': data.get('job_title', data.get('position', '')),
            'experience': data.get('experience', data.get('years_experience', '')),
            'skills': data.get('skills', []),
            'location': data.get('location', data.get('city', '')),
            'timestamp': datetime.now().isoformat(),
            'status': 'pending_ai_review',
            'raw_data': json.dumps(data)  # Store original data
        }
        
        # Validate required fields
        if not applicant_data['name'] or not applicant_data['email']:
            return jsonify({
                'error': 'Missing required fields: name and email',
                'status': 'rejected'
            }), 400
        
        # Save to database (Firebase)
        from services.firebase_service import FirebaseService
        firebase = FirebaseService()
        
        applicant_id = firebase.save_applicant(applicant_data)
        
        # Process with AI
        from services.ai_scoring import AIScoringService
        ai_service = AIScoringService()
        
        score_result = ai_service.score_applicant(applicant_data)
        
        # Update applicant with AI results
        firebase.update_applicant_score(applicant_id, score_result)
        
        # Send notifications if high score
        if score_result.get('score', 0) >= 80:
            from services.notification_service import NotificationService
            notification = NotificationService()
            notification.send_high_score_alert(applicant_data, score_result)
        
        return jsonify({
            'status': 'processed',
            'applicant_id': applicant_id,
            'ai_score': score_result.get('score', 0),
            'threshold_met': score_result.get('score', 0) >= 80,
            'next_action': 'fast_track' if score_result.get('score', 0) >= 80 else 'manual_review'
        })
        
    except Exception as e:
        logger.error(f"❌ Webhook processing error: {e}")
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

@webhook_bp.route('/brevo', methods=['POST'])
def brevo_webhook():
    """Brevo CRM specific webhook"""
    data = request.json
    logger.info(f"📥 Brevo webhook received")
    
    # Transform Brevo data format
    applicant_data = {
        'name': f"{data.get('first_name', '')} {data.get('last_name', '')}".strip(),
        'email': data.get('email'),
        'phone': data.get('phone', data.get('mobile')),
        'resume_text': data.get('message', data.get('description', '')),
        'source': 'Brevo CRM',
        'job_title': data.get('job_title', data.get('position', '')),
        'company': data.get('company', ''),
        'location': data.get('location', data.get('city', '')),
        'custom_fields': data.get('attributes', {})
    }
    
    return new_applicant()

@webhook_bp.route('/apollo', methods=['POST'])
def apollo_webhook():
    """Apollo.io specific webhook"""
    data = request.json
    logger.info(f"📥 Apollo webhook received")
    
    applicant_data = {
        'name': data.get('name', ''),
        'email': data.get('email'),
        'phone': data.get('phone'),
        'resume_text': data.get('description', data.get('summary', '')),
        'source': 'Apollo.io',
        'job_title': data.get('title', ''),
        'company': data.get('company', {}).get('name', ''),
        'location': data.get('location', ''),
        'skills': data.get('skills', []),
        'experience': data.get('experience', [])
    }
    
    return new_applicant()

@webhook_bp.route('/google-form', methods=['POST'])
def google_form_webhook():
    """Google Forms webhook"""
    data = request.json
    logger.info(f"📥 Google Form submission received")
    
    # Map Google Form fields
    form_data = data.get('form_data', {})
    
    applicant_data = {
        'name': form_data.get('name', form_data.get('Name', '')),
        'email': form_data.get('email', form_data.get('Email', '')),
        'phone': form_data.get('phone', form_data.get('Phone', '')),
        'resume_text': form_data.get('resume_text', form_data.get('Resume', '')),
        'source': 'Google Forms',
        'job_title': form_data.get('job_title', form_data.get('Position', '')),
        'experience': form_data.get('experience', form_data.get('Experience', '')),
        'skills': form_data.get('skills', form_data.get('Skills', ''))
    }
    
    return new_applicant()

@webhook_bp.route('/test', methods=['GET', 'POST'])
def test_webhook():
    """Test endpoint for webhook configuration"""
    if request.method == 'GET':
        return jsonify({
            'status': 'ready',
            'endpoints': [
                '/new-applicant',
                '/brevo',
                '/apollo',
                '/google-form'
            ],
            'instructions': 'Send POST request with applicant data'
        })
    
    return new_applicant()
@webhook_bp.route('/google-form', methods=['POST'])
def google_form_webhook():
    """Google Forms webhook handler"""
    data = request.json
    logger.info(f"📥 Google Form submission received")
    
    # Map your specific Google Form field names to your CRM names
    # Ensure these match exactly what you named your questions in Google Forms
    form_data = data.get('form_data', {})
    
    applicant_data = {
        'name': form_data.get('Name', ''),
        'email': form_data.get('Email', ''),
        'phone': form_data.get('Phone', ''),
        'resume_url': form_data.get('Resume Link', ''), # The Google Drive link
        'source': 'Google Forms',
        'job_title': form_data.get('Position Applied For', ''),
        'experience': form_data.get('Experience Level', ''),
        'skills': form_data.get('Skills', '')
    }
    
    # This sends the cleaned data to your main 'new_applicant' function above
    return new_applicant(manual_data=applicant_data)
@webhook_bp.route('/google-form', methods=['POST'])
def google_form_webhook():
    """Google Forms webhook handler"""
    data = request.json
    logger.info("📥 Google Form submission received")
    
    form_data = data.get('form_data', {})
    
    # Clean and map the data
    applicant_data = {
        'name': form_data.get('Name', ''),
        'email': form_data.get('Email', ''),
        'phone': form_data.get('Phone', ''),
        'resume_url': form_data.get('Resume Link', ''),
        'source': 'Google Forms',
        'job_title': form_data.get('Position Applied For', ''),
        'experience': form_data.get('Experience Level', ''),
        'skills': form_data.get('Skills', '')
    }
    
    # CRITICAL: Pass the data into the main function
    return new_applicant(manual_data=applicant_data)

# Update your main function to accept 'manual_data'
def new_applicant(manual_data=None):
    try:
        # If manual_data is passed, use it. Otherwise, pull from the live request.
        data = manual_data if manual_data else request.json
        
        # ... the rest of your logic (Firebase, AI Scoring, etc.)
        # Make sure the rest of the function uses 'data' variable
        @webhook_bp.route('/google-form', methods=['POST'])
def google_form_webhook():
    # Check for the secret key
    secret = request.headers.get('X-Webhook-Secret')
    if secret != "your-very-secret-key-123":
        return jsonify({"error": "Unauthorized"}), 401
    
    # ... rest of your code