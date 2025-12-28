import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import AxiosInstance from '../utils/axios';

export default function GlobalLoadingBar() {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Request interceptor
        const requestInterceptor = AxiosInstance.interceptors.request.use(
            (config) => {
                setLoading(true);
                return config;
            },
            (error) => {
                setLoading(false);
                return Promise.reject(error);
            }
        );

        // Response interceptor
        const responseInterceptor = AxiosInstance.interceptors.response.use(
            (response) => {
                setLoading(false);
                return response;
            },
            (error) => {
                setLoading(false);
                return Promise.reject(error);
            }
        );

        // Cleanup interceptors on unmount
        return () => {
            AxiosInstance.interceptors.request.eject(requestInterceptor);
            AxiosInstance.interceptors.response.eject(responseInterceptor);
        };
    }, []);

    return (
        <AnimatePresence>
            {loading && (
                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    exit={{ scaleX: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className='fixed top-0 left-0 right-0 h-1 z-[100]'
                    style={{
                        background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-primary))',
                        transformOrigin: 'left',
                        boxShadow: '0 0 10px var(--accent-glow)'
                    }}
                />
            )}
        </AnimatePresence>
    );
}
