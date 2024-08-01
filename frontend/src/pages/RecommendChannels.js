import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ChannelCard from '../components/ChannelCard';
import './RecommendChannels.css';
import image from "./Youtube.png"

const RecommendChannels = ({ username }) => {
    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(true); // Set loading to true initially
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchChannels = async () => {
            try {
                const response = await axios.post('http://localhost:5000/recommend-channels', { username });
                const fetchedChannels = response.data.channels.map(channel => ({
                    ...channel,
                    description: channel.description || 'No description available.' // Use default description if none
                }));
                setChannels(fetchedChannels);
            } catch (error) {
                //setError('Failed to fetch recommended channels. Please check the username and try again.');
            }
            setLoading(false); // Set loading to false after fetching
        };

        fetchChannels();
    }, [username]); // Run effect when `username` changes

    if (loading) {
        return <p>Loading...</p>; // Display loading text while fetching
    }

    return (
        <div className="recommend-channels">
            <h1>Recommended YouTube Channels</h1>
            {error && <p className="error">{error}</p>}
            {channels.length > 0 ? (
                <div className="channels-list">
                    {channels.map((channel, index) => (
                        <ChannelCard key={index} channel={channel} />
                    ))}
                </div>
            ) : (
                <p>No channels found.</p>
            )}
        </div>
    );
};

export default RecommendChannels;
