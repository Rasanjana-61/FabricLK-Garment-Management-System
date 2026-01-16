
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '../../components/common/Card';
import { useAuth } from '../../hooks/useAuth';

const API_URL = 'http://localhost:5000/api/reviews';

const AdminFeedbacks = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        const fetchFeedbacks = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get(API_URL, config);
                setFeedbacks(data);
            } catch (error) {
                console.error("Failed to fetch feedbacks", error);
            }
        };

        if (user) {
            fetchFeedbacks();
        }
    }, [user]);

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Customer Feedbacks</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {feedbacks.map(feedback => (
                    <Card key={feedback._id} className="p-4">
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xl">
                                {feedback.customer.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-4">
                                <p className="font-bold">{feedback.customer.username}</p>
                                <p className="text-sm text-gray-500">
                                    {new Date(feedback.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <div className="flex mb-2">
                            {[...Array(5)].map((_, index) => (
                                <svg
                                    key={index}
                                    className={`w-5 h-5 ${index < feedback.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                </svg>
                            ))}
                        </div>
                        <p className="text-gray-700">{feedback.comment}</p>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default AdminFeedbacks;
