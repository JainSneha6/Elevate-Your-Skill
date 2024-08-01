import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './InterviewQuestions.module.css';

const InterviewQuestions = ({ username }) => {
    const [videoUrl, setVideoUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [answer, setAnswer] = useState('');
    const [recognizing, setRecognizing] = useState(false);
    const [recognitionInstance, setRecognitionInstance] = useState(null);
    const [isNextQuestionReady, setIsNextQuestionReady] = useState(false);

    useEffect(() => {
        const fetchInitialVideo = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await axios.post('http://localhost:5000/get-next-question', { username, currentIndex }, { responseType: 'blob' });
                const videoUrl = URL.createObjectURL(response.data);
                setVideoUrl(videoUrl);
                setCurrentIndex(currentIndex + 1);
            } catch (error) {
                setError('Failed to fetch the initial video.');
            }
            setLoading(false);
        };

        if (username) {
            fetchInitialVideo();
        }
    }, [username]);

    const handleAnswerSubmit = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.post('http://localhost:5000/submit-answer', { answer });
            setFeedback(response.data.feedback);
            setIsNextQuestionReady(true); 
        } catch (error) {
            setError('Failed to submit the answer.');
        }
        setLoading(false);
    };

    const loadNextQuestion = async () => {
        setLoading(true);
        setError('');
        try {
            const nextVideoResponse = await axios.post('http://localhost:5000/get-next-question', { username, currentIndex }, { responseType: 'blob' });
            const videoUrl = URL.createObjectURL(nextVideoResponse.data);
            setVideoUrl(videoUrl);
            setCurrentIndex(currentIndex + 1); // Increment index for next question
            setAnswer(''); // Clear the answer for the next question
            setFeedback(''); // Clear the feedback
            setIsNextQuestionReady(false); // Reset the flag
        } catch (error) {
            //setError('Failed to fetch the next video.');
        }
        setLoading(false);
    };

    const startRecognition = () => {
        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = true; // Continue listening until stopped
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setRecognizing(true);
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setAnswer(transcript);
        };

        recognition.onerror = (event) => {
            setRecognizing(false);
            setError('Speech recognition error: ' + event.error);
        };

        recognition.onend = () => {
            if (recognizing) { // Check if recognizing was true
                setRecognizing(false);
            }
        };

        recognition.start();
        setRecognitionInstance(recognition);
    };

    const stopRecognition = () => {
        if (recognitionInstance) {
            recognitionInstance.stop();
            setRecognizing(false);
        }
    };

    return (
        <div className={styles.InterviewQuestions}>
            <h1 className={styles.heading}>Mock Interview Session</h1>
            {loading && <p className={styles.loading}>Loading...</p>}
            {error && <p className={styles.error}>{error}</p>}
            {videoUrl && (
                <div className={styles.videoContainer}>
                    <h2 className={styles.heading}>Your Interview Question</h2>
                    <video src={videoUrl} controls />
                    <div className={styles.buttonContainer}>
                        <button 
                            className={styles.startBtn} 
                            onClick={startRecognition} 
                            disabled={recognizing}
                        >
                            {recognizing ? 'Listening...' : 'Start Voice Input'}
                        </button>
                        <button 
                            className={styles.stopBtn} 
                            onClick={stopRecognition} 
                            disabled={!recognizing}
                        >
                            Stop Voice Input
                        </button>
                        {answer && (
                            <div className={styles.answerContainer}>
                                <p>Your recorded answer: {answer}</p>
                                <button className={styles.submitBtn} onClick={handleAnswerSubmit}>Submit Answer</button>
                                <button className={styles.reRecordBtn} onClick={startRecognition}>Re-record Answer</button>
                            </div>
                        )}
                        {feedback && <p className={styles.feedback}>{feedback}</p>}
                        {isNextQuestionReady && (
                            <button className={styles.nextBtn} onClick={loadNextQuestion}>Next Question</button>
                        )}
                    </div>
                    {recognizing && <div className={styles.listeningPrompt}>Listening...</div>}
                </div>
            )}
        </div>
    );
};

export default InterviewQuestions;
