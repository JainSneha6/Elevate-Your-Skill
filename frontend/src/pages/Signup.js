import React, { useState } from 'react';
import axios from 'axios';
import styles from './Signup.module.css';
import {useNavigate} from 'react-router-dom';

const Signup = () => {
    const [form, setForm] = useState({
        username: '',
        password: '',
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prevForm) => ({
            ...prevForm,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/signup', form);
            alert('Signed up successfully');
            navigate('/information')
        } catch (error) {
            console.error('Error during signup', error);
        }
    };

    return (
        <div className={styles.container}>
            <form className={styles.form} onSubmit={handleSubmit}>
            <h2 className={styles.title}>Sign Up</h2>
                <div className={styles.field}>
                    <label htmlFor="username" className={styles.label}>Username</label>
                    <input
                        type="text"
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        className={styles.input}
                        required
                    />
                </div>
                <div className={styles.field}>
                    <label htmlFor="password" className={styles.label}>Password</label>
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        className={styles.input}
                        required
                    />
                </div>
                <button type="submit" className={styles.button}>Sign Up</button>
            </form>
            <div className={styles.imageContainer}>
                <img src="Graduates.webp" alt="Intro img" className={styles.image}/>
            </div>
        </div>
    );
};

export default Signup;
