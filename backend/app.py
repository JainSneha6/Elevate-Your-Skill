from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash, check_password_hash
from moviepy.editor import VideoFileClip, AudioFileClip, concatenate_videoclips
import os
import sys 
import google.generativeai as genai
from PIL import Image
import regex as re
from googleapiclient.discovery import build
from dotenv import load_dotenv
import pymongo
from werkzeug.exceptions import NotFound
from gtts import gTTS

load_dotenv()

# Flask setup
app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["http://localhost:3000"]) 
client = pymongo.MongoClient(os.getenv('URL'))
db = client['usersdb']
app.config['VIDEO_FOLDER'] = 'question_videos'

# Generative AI configuration
API_KEY = os.getenv('API_KEY')
genai.configure(api_key=API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

SEARCH_API_KEY = os.getenv('SEARCH_API_KEY')
youtube = build('youtube', 'v3', developerKey=SEARCH_API_KEY)

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data['username']
    password = data['password']
    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')

    if db.users.find_one({'username': username}):
        return jsonify({'message': 'Username already exists'}), 409

    new_user = {
        'username': username,
        'password': hashed_password
    }
    db.users.insert_one(new_user)

    return jsonify({'message': 'User created successfully'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = db.users.find_one({'username': username})

    if user and check_password_hash(user['password'], password):
        response = jsonify({'message': 'Logged in successfully'})
        response.set_cookie('username', username)  # Set a cookie to identify the user
        return response, 200
    else:
        return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/logout', methods=['POST'])
def logout():
    response = jsonify({'message': 'Logged out successfully'})
    response.delete_cookie('username')  # Remove the cookie to log out
    return response, 200

@app.route('/check-auth', methods=['GET'])
def check_auth():
    username = request.cookies.get('username')
    if username:                                             
        return jsonify({'username': username}), 200
    else:
        return jsonify({'message': 'Not authenticated'}), 401

@app.route('/update-profile', methods=['POST'])
def update_profile():
    data = request.get_json()
    username = data['username']

    user = db.users.find_one({'username': username})

    if not user:
        return jsonify({'message': 'User not found'}), 404

    updated_data = {
        'name': data.get('name'),
        'age': data.get('age'),
        'location': data.get('location'),
        'contact': data.get('contact'),
        'education': data.get('education'),
        'field': data.get('field'),
        'grades': data.get('grades'),
        'employment_status': data.get('employmentStatus'),
        'experience': data.get('experience'),
        'technical_skills': data.get('technicalSkills'),
        'soft_skills': data.get('softSkills'),
        'strength': data.get('strength'),
        'weakness': data.get('weakness'),
        'interests': data.get('interests'),
        'disability': data.get('disability')
    }

    db.users.update_one({'username': username}, {'$set': updated_data})

    return jsonify({'message': 'Profile updated successfully'}), 200

@app.route('/create-video', methods=['POST'])
def create_video():
    data = request.get_json()
    username = data['username']

    user = db.users.find_one({'username': username})

    if not user:
        return jsonify({'message': 'User not found'}), 404

    # Generate text content using Generative AI
    prompt = f"Act as a Career Counsellor. Taking these into consideration Name: {user['name']}, Age:{user['age']}, Field of study{user['field']}, Education: {user['education']}, Grades: {user['grades']}, Employement Status:{user['employment_status']} Work Experience: {user['experience']}, Technical Skills : {user['technical_skills']} ,Soft Skills : {user['soft_skills']} , Interests : {user['interests']},Strength : {user['strength']} , Weakness : {user['weakness']} , Disability : {user['disability']} generate a career report for the user. Just give me a simple paragraph with no asterisks."
    response = model.generate_content(prompt)
    report = response.text

    # Create audio from text
    audio_file = 'career_report_audio.mp3'
    create_audio_from_text(report, audio_file)

    # Create video from avatar image and audio
    output_video = 'career_report_video.mp4'
    create_video_from_image_and_audio(audio_file, output_video)

    # Return the generated video
    return send_file(output_video, as_attachment=True)

def create_audio_from_text(text, audio_file):
    tts = gTTS(text=text, lang='en')
    tts.save(audio_file)


def create_video_from_image_and_audio(audio_file, output_video):
    # Load the image using PIL
    gif_clip = VideoFileClip("avatar.gif")

    # Load the audio file
    audio_clip = AudioFileClip(audio_file)

    audio_duration = audio_clip.duration
    
    gif_duration = gif_clip.duration
    repeat_count = int(audio_duration // gif_duration) + 1

    clips = [gif_clip] * repeat_count
    looped_gif_clip = concatenate_videoclips(clips, method="compose")

    # Trim the concatenated GIF to match the exact duration of the audio
    looped_gif_clip = looped_gif_clip.subclip(0, audio_duration)

    # Set the audio to the GIF video clip
    video_with_audio = looped_gif_clip.set_audio(audio_clip)

    # Write the result to a video file
    video_with_audio.write_videofile(output_video, fps=24)

def create_career_choices(user):
    prompt = f"Taking these into consideration Name: {user['name']}, Age:{user['age']}, Field of study{user['field']}, Education: {user['education']}, Grades: {user['grades']}, Employement Status:{user['employment_status']} Work Experience: {user['experience']}, Technical Skills : {user['technical_skills']} ,Soft Skills : {user['soft_skills']} , Interests : {user['interests']},Strength : {user['strength']} , Weakness : {user['weakness']} , Disability : {user['disability']} generate a career report for the user. just give me the names of career choices the user should choose. If a person is 11th standard and below then just give the name of the exams which are required to crack that career choice. Give only the names and in very concise and short manner. Give me only one of the following either the name of the exams or career choices. Just 1 name."
    
    response = model.generate_content(prompt)
    report = response.text
    print(report)
    
    return report

def name_of_channels(report):
    prompt = f"Give me only names of Indian YouTube channels which can teach the user {report}. Do not give descriptions. Give me *nameofthechannel format"
    
    response = model.generate_content(prompt)
    channels_text = response.text
    print("Generated Channel Names Text:")
    print(channels_text)
    
    pattern = re.compile(r'\*\s*(.*?)\s*$', re.MULTILINE)
    matches = pattern.findall(channels_text)
    unique_channels = list(set(matches))
    
    print("Unique Channel Names:")
    print(unique_channels)
    
    return unique_channels[:6]

def search_youtube_channel(query):
    search_response = youtube.search().list(
        q=query,
        part='snippet',
        type='channel',
        maxResults=1
    ).execute()

    channels = []
    for item in search_response.get('items', []):
        channel_id = item['id']['channelId']
        title = item['snippet']['title']
        description = item['snippet']['description']
        url = f"https://www.youtube.com/channel/{channel_id}"
        channels.append({
            'title': title,
            'description': description,
            'url': url
        })
    
    return channels


def recommend_channels(unique_channels):
    recommendations = []
    for channel in unique_channels:
        channels = search_youtube_channel(channel)
        recommendations.extend(channels)
    return recommendations

@app.route('/recommend-channels', methods=['POST'])
def recommend_channels_route():
    data = request.get_json()
    username = data['username']

    user = db.users.find_one({'username': username})

    if not user:
        return jsonify({'message': 'User not found'}), 404

    # Create career choices and find relevant channels
    report = create_career_choices(user)
    unique_channels = name_of_channels(report)
    recommended_channels = recommend_channels(unique_channels)
    
    return jsonify({'channels': recommended_channels})

def generate_questions(field):
    prompt = f"Generate only one interview question related to the field of {field}. There should not be any asterisk or comma present in the question. Also do not include any placeholder text."
    response = model.generate_content(prompt)
    return response.text


@app.route('/get-next-question', methods=['POST'])
def get_next_question():
    data = request.get_json()
    username = data["username"]
    current_index = data["currentIndex"]

    user = db.users.find_one({'username': username})

    if not user:
        return jsonify({'message': 'User not found'}), 404

    # Generate questions
    questions = generate_questions(user['field'])

    # Directory to store videos
    output_dir = app.config['VIDEO_FOLDER']
    os.makedirs(output_dir, exist_ok=True)

    if current_index + 1 >= 9:
        return jsonify({'message': 'No more questions'}), 404

    next_index = current_index + 1
    next_question = questions

    # Create audio and video for the next question
    audio_file = f'{output_dir}/question_{next_index}.mp3'
    create_audio_from_text(next_question, audio_file)

    video_file = f'{output_dir}/question_{next_index}.mp4'
    create_video_from_image_and_audio(audio_file, video_file)
    
    # Stream the video file directly
    try:
        return send_file(video_file, mimetype='video/mp4')
    except FileNotFoundError:
        return NotFound('Video file not found')
    
def get_feedback_from_gemini(answer):
    prompt = f"Provide detailed feedback on the following interview answer: {answer}. Provide in one paragraph without any asterisk "
    response = model.generate_content(prompt)
    feedback = response.text
    return feedback
    
@app.route('/submit-answer', methods=['POST'])
def submit_answer():
    data = request.get_json()
    answer = data["answer"]

    # Generate feedback based on the user's answer
    feedback = get_feedback_from_gemini(answer)

    return jsonify({'feedback': feedback, 'nextVideo': True})


if __name__ == '__main__':
    app.run(debug=True)
