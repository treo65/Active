"""
AI Scoring Service for applicant evaluation
"""
import os
import json
import logging
from openai import OpenAI
from typing import Dict, Any

logger = logging.getLogger(__name__)

class AIScoringService:
    def __init__(self):
        self.api_key = os.getenv('OPENAI_API_KEY')
        self.model = os.getenv('AI_MODEL', 'gpt-3.5-turbo')
        self.temperature = float(os.getenv('AI_TEMPERATURE', 0.3))
        self.threshold = int(os.getenv('AI_SCORE_THRESHOLD', 80))
        
        if self.api_key:
            self.client = OpenAI(api_key=self.api_key)
            self.enabled = True
            logger.info("✅ OpenAI service initialized")
        else:
            self.client = None
            self.enabled = False
            logger.warning("⚠️ OpenAI API key not found, using mock scoring")
    
    def score_applicant(self, applicant_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Score applicant using AI based on resume and profile
        """
        try:
            if not self.enabled or not self.client:
                return self._mock_scoring(applicant_data)
            
            # Extract resume text
            resume_text = applicant_data.get('resume_text', '')
            name = applicant_data.get('name', 'Unknown')
            job_title = applicant_data.get('job_title', '')
            
            # Create AI prompt
            prompt = self._create_scoring_prompt(resume_text, job_title)
            
            # Call OpenAI API
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an expert recruitment AI that evaluates candidates."},
                    {"role": "user", "content": prompt}
                ],
                temperature=self.temperature,
                max_tokens=1000
            )
            
            # Parse AI response
            ai_response = response.choices[0].message.content
            score_result = self._parse_ai_response(ai_response)
            
            logger.info(f"✅ AI scored {name}: {score_result.get('score', 0)}/100")
            return score_result
            
        except Exception as e:
            logger.error(f"❌ AI scoring failed: {e}")
            return self._mock_scoring(applicant_data)
    
    def _create_scoring_prompt(self, resume_text: str, job_title: str = "") -> str:
        """Create prompt for AI scoring"""
        prompt = f"""
        Analyze this candidate resume and provide a comprehensive evaluation:
        
        RESUME TEXT:
        {resume_text[:3000]}
        
        TARGET POSITION: {job_title if job_title else "General Technology Role"}
        
        Please provide a JSON response with the following structure:
        {{
            "score": 0-100,
            "breakdown": {{
                "skills_match": 0-25,
                "experience_level": 0-25,
                "education": 0-20,
                "achievements": 0-15,
                "communication": 0-15
            }},
            "summary": "Brief summary of candidate",
            "strengths": ["array", "of", "strengths"],
            "weaknesses": ["array", "of", "weaknesses"],
            "recommended_roles": ["array", "of", "suitable", "roles"],
            "red_flags": ["array", "of", "red", "flags"],
            "green_flags": ["array", "of", "green", "flags"],
            "interview_questions": ["array", "of", "interview", "questions"]
        }}
        
        Score guidelines:
        - 90-100: Exceptional candidate, immediate hire
        - 80-89: Strong candidate, fast-track
        - 70-79: Good candidate, consider
        - 60-69: Average candidate, review needed
        - Below 60: Poor fit, reject
        
        Be objective and specific in your analysis.
        """
        return prompt
    
    def _parse_ai_response(self, ai_text: str) -> Dict[str, Any]:
        """Parse AI response into structured format"""
        try:
            # Extract JSON from AI response
            lines = ai_text.strip().split('\n')
            json_start = None
            json_end = None
            
            for i, line in enumerate(lines):
                if line.strip().startswith('{'):
                    json_start = i
                    break
            
            for i in range(len(lines) - 1, -1, -1):
                if lines[i].strip().endswith('}'):
                    json_end = i + 1
                    break
            
            if json_start is not None and json_end is not None:
                json_str = '\n'.join(lines[json_start:json_end])
                result = json.loads(json_str)
            else:
                # Try to find JSON-like structure
                import re
                json_match = re.search(r'\{.*\}', ai_text, re.DOTALL)
                if json_match:
                    result = json.loads(json_match.group())
                else:
                    raise ValueError("No JSON found in AI response")
            
            # Ensure all required fields
            result.setdefault('score', 75)
            result.setdefault('breakdown', {})
            result.setdefault('summary', 'AI analysis completed')
            result.setdefault('strengths', [])
            result.setdefault('weaknesses', [])
            result.setdefault('recommended_roles', [])
            result.setdefault('red_flags', [])
            result.setdefault('green_flags', [])
            result.setdefault('interview_questions', [])
            
            return result
            
        except Exception as e:
            logger.warning(f"Failed to parse AI response: {e}")
            return self._create_default_result()
    
    def _mock_scoring(self, applicant_data: Dict[str, Any]) -> Dict[str, Any]:
        """Mock scoring for development/testing"""
        import random
        
        name = applicant_data.get('name', 'Unknown')
        skills = applicant_data.get('skills', [])
        
        # Simple mock scoring logic
        base_score = 60
        if skills:
            base_score += min(len(skills) * 2, 20)
        
        if 'experience' in applicant_data:
            exp_str = str(applicant_data['experience'])
            if 'year' in exp_str.lower():
                try:
                    years = int(''.join(filter(str.isdigit, exp_str.split()[0])))
                    base_score += min(years * 2, 20)
                except:
                    base_score += 5
        
        # Add some randomness
        final_score = min(100, base_score + random.randint(-10, 10))
        
        return {
            'score': final_score,
            'breakdown': {
                'skills_match': random.randint(15, 25),
                'experience_level': random.randint(15, 25),
                'education': random.randint(10, 20),
                'achievements': random.randint(8, 15),
                'communication': random.randint(8, 15)
            },
            'summary': f"Mock analysis for {name}. Score based on resume content.",
            'strengths': skills[:3] if skills else ['Technical aptitude', 'Relevant background'],
            'weaknesses': ['Limited details in resume', 'Needs verification'],
            'recommended_roles': ['Developer', 'Technician', 'Specialist'],
            'red_flags': [],
            'green_flags': ['Complete application', 'Clear contact info'],
            'interview_questions': [
                "Tell me about your experience with the mentioned technologies",
                "What projects are you most proud of?",
                "Where do you see yourself in 5 years?"
            ]
        }
    
    def _create_default_result(self) -> Dict[str, Any]:
        """Create default scoring result"""
        return {
            'score': 75,
            'breakdown': {
                'skills_match': 18,
                'experience_level': 20,
                'education': 15,
                'achievements': 12,
                'communication': 10
            },
            'summary': 'AI analysis completed with standard evaluation',
            'strengths': ['Technical background', 'Relevant experience'],
            'weaknesses': ['Limited details', 'Needs further assessment'],
            'recommended_roles': ['Technical Role', 'Specialist Position'],
            'red_flags': [],
            'green_flags': ['Complete application'],
            'interview_questions': [
                "Discuss your technical experience",
                "What are your career goals?"
            ]
        }
    
    def analyze_resume_text(self, resume_text: str) -> Dict[str, Any]:
        """Analyze raw resume text"""
        applicant_data = {
            'resume_text': resume_text,
            'name': 'Resume Analysis',
            'job_title': 'General Position'
        }
        return self.score_applicant(applicant_data)
    # Example logic for your AI Scoring Service
def score_applicant(self, data):
    # Your LLM/AI logic here
    return {
        "score": 85,
        "summary": "9 years of IT support experience with strong Microsoft 365 and ITILV4 expertise."
    }