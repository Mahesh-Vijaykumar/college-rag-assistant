import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Notification from '../components/ui/Notification';

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [isLockedOut, setIsLockedOut] = useState(false);
    const [retryAfter, setRetryAfter] = useState(0);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        setIsLockedOut(false);

        try {
            const data = await login(username, password);
            setSuccess('Login successful. Redirecting...');
            setTimeout(() => {
                navigate('/admin/dashboard');
            }, 1500);
        } catch (err) {
            // Handle rate limiting errors
            if (err.response?.status === 429) {
                const errorData = err.response.data.detail;

                if (typeof errorData === 'object' && errorData.retry_after) {
                    setIsLockedOut(true);
                    setRetryAfter(errorData.retry_after);
                    setError(errorData.message || 'Too many failed attempts. Please try again later.');
                } else {
                    setError('Too many login attempts. Please try again later.');
                }
            } else if (err.response?.status === 401) {
                // Generic error message to avoid username enumeration
                setError('Invalid credentials. Please check your username and password.');
            } else {
                setError('An error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Colorful Gradient Backgrounds */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, transparent 70%)',
                        filter: 'blur(60px)',
                    }}
                />
                <div
                    className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(6, 182, 212, 0.1) 0%, transparent 70%)',
                        filter: 'blur(80px)',
                    }}
                />
                <div
                    className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, transparent 70%)',
                        filter: 'blur(70px)',
                    }}
                />
            </div>

            <div className="w-full max-w-md z-10">
                {/* Notifications */}
                <div className="mb-6">
                    {success && (
                        <Notification
                            type="success"
                            message={success}
                            onClose={() => setSuccess('')}
                        />
                    )}
                    {error && (
                        <Notification
                            type="error"
                            message={error}
                            onClose={() => setError('')}
                            duration={5000}
                        />
                    )}
                    {isLockedOut && retryAfter > 0 && (
                        <Notification
                            type="warning"
                            message={`Account temporarily locked. Please wait ${Math.ceil(retryAfter / 60)} minutes before trying again.`}
                            onClose={() => setIsLockedOut(false)}
                        />
                    )}
                </div>

                <h1 className="text-4xl font-bold text-center mb-8 text-white drop-shadow-2xl">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400">
                        Admin Portal
                    </span>
                </h1>

                <Card>
                    <h2 className="text-xl font-semibold text-center mb-6">Admin Login</h2>
                    <form onSubmit={handleLogin} className="space-y-6">
                        <Input
                            id="username"
                            label="Username"
                            type="text"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            disabled={isLockedOut}
                        />
                        <Input
                            id="password"
                            label="Password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLockedOut}
                        />
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading || isLockedOut}
                        >
                            {loading ? 'Logging in...' : isLockedOut ? 'Account Locked' : 'Login'}
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default AdminLogin;


