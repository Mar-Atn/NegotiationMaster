#!/usr/bin/env python3
"""
ElevenLabs Feedback Pipeline - Proof of Concept
Fetches conversation transcript from ElevenLabs and generates AI feedback using Gemini.
"""

import json
import requests
import google.generativeai as genai
from typing import Dict, List, Any
import sys

# API Configuration
ELEVENLABS_API_KEY = "sk_70c12500fe1bbc13c9f34cbcf34cef8f7e45d5524b88fd43"
GEMINI_API_KEY = "AIzaSyC1eczAbf38_I2QZDekkPEa21FpROjFKtc"
CONVERSATION_ID = "conv_6401k1phxhyzfz2va165272pmakz"

def fetch_conversation_transcript(conversation_id: str) -> Dict[str, Any]:
    """Fetch conversation transcript from ElevenLabs API."""
    print("Fetching conversation transcript from ElevenLabs...")
    
    url = f"https://api.elevenlabs.io/v1/convai/conversations/{conversation_id}"
    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        conversation_data = response.json()
        print(f"✓ Successfully fetched conversation data")
        print(f"  Status: {conversation_data.get('status', 'unknown')}")
        print(f"  Transcript messages: {len(conversation_data.get('transcript', []))}")
        
        return conversation_data
    
    except requests.exceptions.RequestException as e:
        print(f"✗ Error fetching conversation: {e}")
        sys.exit(1)

def format_transcript_for_analysis(transcript: List[Dict]) -> str:
    """Format the transcript into readable text for AI analysis."""
    formatted_lines = []
    
    for message in transcript:
        role = message.get('role', 'unknown')
        content = message.get('content', '')
        
        if role == 'user':
            formatted_lines.append(f"User: {content}")
        elif role == 'assistant':
            formatted_lines.append(f"Agent: {content}")
        else:
            formatted_lines.append(f"{role.capitalize()}: {content}")
    
    return "\n".join(formatted_lines)

def generate_feedback_prompt(transcript_text: str) -> str:
    """Generate the prompt for AI feedback analysis based on the methodology."""
    return f"""
You are an expert negotiation coach analyzing a conversation transcript. Generate professional feedback following this specific structure and methodology:

FEEDBACK METHODOLOGY:
Analyze the conversation across three dimensions:
1. Claiming Value (Competitive): ZOPA exploration, BATNA usage, reciprocity, competitive balance
2. Creating Value (4 Harvard Principles): Separate people from problems, focus on interests not positions, generate mutual gains, use objective criteria  
3. Relationship Management: Trust building, communication style, conflict resolution, long-term thinking

REQUIRED STRUCTURE (300-400 words total):

**Executive Summary (50-75 words)**
- Overall performance assessment
- Key strengths demonstrated  
- Primary development opportunities

**What Was Done Well (100-150 words)**
- Specific examples with actual quotes from conversation
- Connection to negotiation theory and best practices
- Recognition of effective tactics and strategies

**Areas for Improvement (100-150 words)**
- Specific examples with quotes showing missed opportunities
- Clear suggestions for alternative approaches
- Actionable recommendations for skill development

**Next Steps & Focus Areas (50-75 words)**
- Prioritized development recommendations
- Specific concepts to study or practice
- Suggested scenarios for continued learning

CONVERSATION TRANSCRIPT:
{transcript_text}

Generate the feedback now, ensuring it's professional, specific, theory-grounded, and actionable for business executives.
"""

def analyze_with_gemini(transcript_text: str) -> str:
    """Send transcript to Gemini AI for analysis and feedback generation."""
    print("Analyzing transcript with Gemini AI...")
    
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = generate_feedback_prompt(transcript_text)
        response = model.generate_content(prompt)
        
        print("✓ Successfully generated feedback with Gemini")
        return response.text
    
    except Exception as e:
        print(f"✗ Error with Gemini analysis: {e}")
        sys.exit(1)

def save_feedback_to_file(feedback: str, filename: str = "negotiation_feedback.txt"):
    """Save the generated feedback to a file."""
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            f.write("=" * 60 + "\n")
            f.write("NEGOTIATION FEEDBACK ANALYSIS\n")
            f.write("=" * 60 + "\n\n")
            f.write(feedback)
            f.write("\n")
        
        print(f"✓ Feedback saved to {filename}")
    
    except Exception as e:
        print(f"✗ Error saving feedback: {e}")

def main():
    """Main pipeline execution."""
    print("🚀 Starting ElevenLabs Feedback Pipeline...")
    print(f"Conversation ID: {CONVERSATION_ID}")
    print("-" * 50)
    
    # Step 1: Fetch conversation transcript
    conversation_data = fetch_conversation_transcript(CONVERSATION_ID)
    
    # Step 2: Format transcript for analysis
    transcript = conversation_data.get('transcript', [])
    if not transcript:
        print("✗ No transcript found in conversation data")
        sys.exit(1)
    
    transcript_text = format_transcript_for_analysis(transcript)
    print(f"✓ Formatted transcript ({len(transcript_text)} characters)")
    
    # Step 3: Generate feedback with AI
    feedback = analyze_with_gemini(transcript_text)
    
    # Step 4: Output results
    print("\n" + "=" * 60)
    print("GENERATED FEEDBACK:")
    print("=" * 60)
    print(feedback)
    
    # Step 5: Save to file
    save_feedback_to_file(feedback)
    
    print("\n🎉 Pipeline completed successfully!")

if __name__ == "__main__":
    main()