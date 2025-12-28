import { LockIcon, User2Icon, EyeIcon, EyeClosedIcon, UserPlusIcon, LoaderCircleIcon } from 'lucide-react'
import React, { useState } from 'react'
import { motion } from "framer-motion"
import { Link, useNavigate } from 'react-router-dom';
import { toast } from "react-hot-toast"
import { useAuthStore } from '../store/AuthStore';

export default function Login() {
    const navigate = useNavigate();
    const { isLoggingIn, loginFunc } = useAuthStore();
    const [formData, setFormData] = useState({ username: "", password: "" });
    const [showPass, setShowPass] = useState(false);

    const handleChange = function (e) {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }))
    }

    const validateData = function () {
        if (!formData.username.trim() || !formData.password.trim()) {
            toast.error("All fields should be filled");
            return false;
        }

        return true;
    }

    const loginUser = async function (e) {
        e.preventDefault();
        if (validateData()) {
            await loginFunc(formData);

            // Get user from store after login
            const user = useAuthStore.getState().user;

            // Role-based redirect
            if (user?.role === 'admin') {
                navigate("/admin/dashboard");
            } else {
                navigate("/");
            }

            setFormData({ username: "", password: "" });
        }
    }
    return (
        <div className='flex flex-col justify-center items-center gap-2 mt-20'>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
            >
                <div className='text-center mb-4'>
                    <h1 className='font-bold text-2xl uppercase mono tracking-tight' style={{ color: 'var(--color-text-primary)' }}>
                        Connect to your account
                    </h1>
                </div>
            </motion.div>
            <form
                onSubmit={loginUser}
                className='hardware-card w-[750px] p-9 gap-5'>
                <label className='flex justify-start items-center gap-4 p-3 mb-4' style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: '4px',
                    background: 'var(--color-bg)'
                }}>
                    <i style={{ color: 'var(--color-text-secondary)' }}><User2Icon /></i>
                    <input
                        type="text"
                        className='w-full bg-transparent outline-none'
                        placeholder='Type your username'
                        name='username'
                        value={formData.username}
                        onChange={handleChange}
                        style={{ color: 'var(--color-text-primary)' }}
                    />
                </label>
                <label className='flex justify-between items-center gap-4 p-3 mb-4' style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: '4px',
                    background: 'var(--color-bg)'
                }}>
                    <div className='flex items-center gap-4 w-full'>
                        {
                            !showPass ? (
                                <>
                                    <i style={{ color: 'var(--color-text-secondary)' }}><LockIcon aria-hidden={"true"} /></i>
                                    <input
                                        type="password"
                                        className='w-full bg-transparent outline-none'
                                        placeholder='Type your password'
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        style={{ color: 'var(--color-text-primary)' }}
                                    />
                                </>
                            ) : (
                                <>
                                    <i style={{ color: 'var(--color-text-secondary)' }}><LockIcon /></i>
                                    <input
                                        type="text"
                                        className='w-full bg-transparent outline-none'
                                        placeholder='Type your password'
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        style={{ color: 'var(--color-text-primary)' }}
                                    />
                                </>
                            )
                        }
                    </div>
                    <div>
                        {
                            !showPass ? (
                                <button type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className='flex justify-center items-center'
                                >
                                    <i style={{ color: 'var(--color-text-secondary)' }}><EyeIcon /></i>
                                </button>
                            ) : (
                                <button type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className='flex justify-center items-center'
                                >
                                    <i style={{ color: 'var(--color-text-secondary)' }}><EyeClosedIcon /></i>
                                </button>
                            )
                        }
                    </div>
                </label>
                <button type='submit' className='w-full py-3 flex items-center justify-center gap-2 transition-fast' style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: '4px',
                    background: 'var(--color-accent)',
                    color: 'var(--color-bg)'
                }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                    {
                        !isLoggingIn ? (
                            <>
                                <i><UserPlusIcon /></i>
                                <span className='font-bold mono'>Connect</span>
                            </>
                        ) : (
                            <>
                                <i className='animate-spin'><LoaderCircleIcon /></i>
                                <span className='font-bold mono'>Connecting</span>
                            </>
                        )
                    }
                </button>
            </form>
            <div className='mt-5 flex items-center gap-1.5'>
                <p style={{ color: 'var(--color-text-secondary)' }}>No account,</p>
                <Link to="/signup">
                    <span className='transition-all duration-200 hover:underline' style={{ color: 'var(--color-accent)' }}>Signup</span>
                </Link>
            </div>
        </div>
    )
}
