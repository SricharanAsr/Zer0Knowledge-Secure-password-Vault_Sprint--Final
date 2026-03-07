import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { supabase } from './storage/supabaseClient';

const PORT = process.env.PORT || 5000;

// Verify Supabase connection works at startup
const checkSupabase = async () => {
    try {
        const { error } = await supabase.from('users').select('id').limit(1);
        if (error) {
            console.warn('Supabase connected with warning:', error.message);
        } else {
            console.log('Connected to Supabase PostgreSQL');
        }
    } catch (err) {
        console.error('Supabase connection error:', err);
    }
};

checkSupabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});




