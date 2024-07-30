import React from 'react';
import { Link } from 'react-router-dom';
import styles from './HomePage.module.css';
import Card from '../components/Card';

function HomePage({ username }) {
    return (
        <div className={styles.homePage}>
            <p className={styles.greeting}>Hello {username}!</p>
            <div className={styles.container}>
                <Link to="/create-video" style={{textDecoration:"none"}}><Card image="report.png" title="Personalized Career Report"/></Link>
                <Link to="/learning-path" style={{textDecoration:"none"}}><Card image="personalized-learning.png" title="Personalized Learning Path"/></Link>
                <Link to="/underprogress" style={{textDecoration:"none"}}><Card image="networking.png" title="Networking and Workshops"/></Link>
                <Link to="/interview-questions" style={{textDecoration:"none"}}><Card image="mock-interview.png" title="Mock Interview"/></Link>
                <Link to="/underprogress" style={{textDecoration:"none"}}><Card image="job-search.png" title="Job Search"/></Link>
                <Link to="/underprogress" style={{textDecoration:"none"}}><Card image="ChatBot-PNG-Pic.png" title="Doubt-Solving Chatbot"/></Link>
            </div>
        </div>
    );
}

export default HomePage;
