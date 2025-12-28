import { LockIcon, User2Icon, UserPenIcon, Mail, EyeIcon, EyeClosedIcon, UserPlusIcon, LoaderCircleIcon } from 'lucide-react'
import React, { useState } from 'react'
import { motion } from "framer-motion"
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/AuthStore';

export default function Signup() {
    const navigate = useNavigate();
    const { isSigningUp, signUpFunc } = useAuthStore();
    const [showPass, setShowPass] = useState(false);
    const [formData, setFormData] = useState({ fullname: "", username: "", email: "", password: "" });

    const handleChange = function (e) {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }))
    }

    const validateData = function () {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^\w\s])[A-Za-z\d@$!%*?&/]{8,}$/;

        if (!formData.fullname.trim() || !formData.username.trim() || !formData.email.trim() || !formData.password.trim()) {
            toast.error("All fields should be filled");
            return false;
        }
        if (formData.password.length < 8) {
            toast.error("Password should be at least 8 characters long");
            return false;
        }
        if (!emailRegex.test(formData.email)) {
            toast.error("Invalid email format");
            return false;
        }
        if (!passwordRegex.test(formData.password)) {
            toast.error("Invalid password format");
            return false;
        }

        return true;
    }

    const signUpUser = function (e) {
        if (validateData()) {
            signUpFunc(formData);
            toast.success("Successfully signed up");
            setFormData({ fullname: "", username: "", email: "", password: "" })
            navigate("/");
        }
        e.preventDefault();
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
                        Create your account
                    </h1>
                </div>
            </motion.div>
            <form
                onSubmit={signUpUser}
                className='hardware-card w-[750px] p-9 gap-5'>
                <label className='flex justify-start items-center gap-4 p-3 mb-4' style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: '4px',
                    background: 'var(--color-bg)'
                }}>
                    <i style={{ color: 'var(--color-text-secondary)' }}><UserPenIcon /></i>
                    <input
                        type="text"
                        className='w-full bg-transparent outline-none'
                        placeholder='Full Name'
                        name='fullname'
                        value={formData.fullname}
                        onChange={handleChange}
                        style={{ color: 'var(--color-text-primary)' }}
                    />
                </label>
                <label className='flex justify-start items-center gap-4 p-3 mb-4' style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: '4px',
                    background: 'var(--color-bg)'
                }}>
                    <i style={{ color: 'var(--color-text-secondary)' }}><User2Icon /></i>
                    <input
                        type="text"
                        className='w-full bg-transparent outline-none'
                        placeholder='Username'
                        name='username'
                        value={formData.username}
                        onChange={handleChange}
                        style={{ color: 'var(--color-text-primary)' }}
                    />
                </label>
                <label className='flex justify-start items-center gap-4 p-3 mb-4' style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: '4px',
                    background: 'var(--color-bg)'
                }}>
                    <i style={{ color: 'var(--color-text-secondary)' }}><Mail /></i>
                    <input
                        type="email"
                        className='w-full bg-transparent outline-none'
                        placeholder='Email'
                        name='email'
                        value={formData.email}
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
                                    <i style={{ color: 'var(--color-text-secondary)' }}><LockIcon /></i>
                                    <input
                                        type="password"
                                        className='w-full bg-transparent outline-none'
                                        placeholder='Password'
                                        name='password'
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
                                        placeholder='Password'
                                        name='password'
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
                <button className='w-full py-3 flex items-center justify-center gap-2 transition-fast' style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: '4px',
                    background: 'var(--color-accent)',
                    color: 'var(--color-bg)'
                }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                    {
                        !isSigningUp ? (
                            <>
                                <i><UserPlusIcon /></i>
                                <span className='font-bold mono'>Signup</span>
                            </>
                        ) : (
                            <>
                                <i className='animate-spin'><LoaderCircleIcon /></i>
                                <span className='font-bold mono'>Signing up</span>
                            </>
                        )
                    }
                </button>
            </form>
            <div className='mt-5 flex items-center gap-1.5'>
                <p style={{ color: 'var(--color-text-secondary)' }}>Already got an account,</p>
                <Link to="/login">
                    <span className='transition-all duration-200 hover:underline' style={{ color: 'var(--color-accent)' }}>Login</span>
                </Link>
            </div>
        </div>
    )
}
