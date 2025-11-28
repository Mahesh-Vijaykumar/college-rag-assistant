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
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const data = await login(username, password);
            localStorage.setItem('token', data.access_token);
            setSuccess('Login successful. Redirecting...');
            setTimeout(() => {
                navigate('/admin/dashboard');
            }, 1500);
        } catch (err) {
            setError('Invalid username or password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-primary-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] bg-primary-600/10 rounded-full blur-[120px]" />
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
                        />
                    )}
                </div>

                <h1 className="text-3xl font-bold text-center mb-8">Admin Portal</h1>

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
                        />
                        <Input
                            id="password"
                            label="Password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default AdminLogin;
