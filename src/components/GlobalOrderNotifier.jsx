import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

const GlobalOrderNotifier = () => {
    const [prevCount, setPrevCount] = useState(null);
    const toast = useToast();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const audioRef = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'));

    const isOrderValidForProcessing = (order) => {
        if (order.status !== 'pesanan masuk') return false;
        return order.paymentStatus === 'success' || order.paymentMethod === 'cod';
    };

    const prevCountRef = useRef(null);

    const checkNewOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await axios.get(`${API_URL}/orders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const validOrders = res.data.data.filter(order => isOrderValidForProcessing(order));
            const currentCount = validOrders.length;

            if (prevCountRef.current !== null && currentCount > prevCountRef.current) {
                // New order detected!
                toast.success('🔔 ADA PESANAN MASUK BARU!', 5000);
                
                // Play notification sound
                audioRef.current.currentTime = 0;
                audioRef.current.play().catch(e => console.log('Audio blocked:', e));
            }

            prevCountRef.current = currentCount;
        } catch (error) {
            console.error('Notifier Error:', error);
        }
    };

    useEffect(() => {
        checkNewOrders();

        const interval = setInterval(checkNewOrders, 15000); // Check every 15s
        return () => clearInterval(interval);
    }, []);

    return null;
};

export default GlobalOrderNotifier;
