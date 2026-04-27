import { supabase } from '../utils/supabaseClient.js';

/**
 * Create a new booking
 */
export async function createBooking(bookingData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Authentication required to create a booking.");

    const { data, error } = await supabase
        .from('bookings')
        .insert([{
            user_id: user.id,
            outfit_id: bookingData.outfit_id,
            size: bookingData.size,
            duration: bookingData.duration,
            total_price: bookingData.total_price,
            deposit: bookingData.deposit,
            delivery_date: bookingData.delivery_date,
            return_date: bookingData.return_date,
            delivery_address: bookingData.delivery_address,
            city: bookingData.city,
            customer_name: bookingData.customer_name || '',
            customer_email: bookingData.customer_email || '',
            customer_phone: bookingData.customer_phone || '',
            status: 'pending',
            payment_status: bookingData.payment_status || 'paid',
        }])
        .select();

    if (error) {
        console.error("Failed to create booking:", error);
        throw error;
    }

    return data;
}

/**
 * Get all bookings for the currently authenticated user
 */
export async function getUserBookings() {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return [];

    const { data, error } = await supabase
        .from('bookings')
        .select(`
            *,
            outfits (
                id,
                name,
                image_url,
                price_per_day,
                category
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching user bookings:", error);
        throw error;
    }

    return data;
}

/**
 * Cancel a booking (set status to 'cancelled')
 */
export async function cancelBooking(bookingId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Authentication required.");

    const { data, error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId)
        .eq('user_id', user.id)
        .select();

    if (error) {
        console.error("Error cancelling booking:", error);
        throw error;
    }

    return data;
}

/**
 * Admin: Get ALL bookings with user and outfit details
 */
export async function getAllBookings() {
    const { data, error } = await supabase
        .from('bookings')
        .select(`
            *,
            outfits (
                id,
                name,
                image_url
            )
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching all bookings:", error);
        throw error;
    }

    return data;
}

/**
 * Admin: Update booking status
 */
export async function updateBookingStatus(bookingId, status) {
    const { data, error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId)
        .select();

    if (error) {
        console.error("Error updating booking status:", error);
        throw error;
    }

    return data;
}
