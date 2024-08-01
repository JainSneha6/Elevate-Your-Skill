import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './CareerVideo.module.css';

const CareerVideo = ({ username }) => {
    const [videoUrl, setVideoUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchVideo = async () => {
            setLoading(true);
            setError('');

            try {
                const response = await axios.post('http://localhost:5000/create-video', { username }, { responseType: 'blob' });
                const videoBlob = new Blob([response.data], { type: 'video/mp4' });
                const videoUrl = URL.createObjectURL(videoBlob);
                setVideoUrl(videoUrl);
            } catch (error) {
                //setError('Failed to generate video. Please check the username and try again.');
            }

            setLoading(false);
        };

        if (username) {
            fetchVideo();
        }
    }, [username]);

    return (
        <div className={styles.App}>
            <h1 className={styles.heading}>Career Report Video Generator</h1>
            {loading && <p className={styles.loading}>Generating video...</p>}
            {error && <p className={styles.error}>{error}</p>}
            {!loading && videoUrl && (
                <div className={styles.videoContainer}>
                    <h2 className={styles.heading}>Your Career Report Video</h2>
                    <video src={videoUrl} controls />
                </div>
            )}
        </div>
    );
};

export default CareerVideo;
