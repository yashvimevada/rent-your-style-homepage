import { supabase } from '../utils/supabaseClient.js';

/**
 * Create a new order (booking) from a cart item validation
 */
export async function createOrder(cartItem, bookingDetails) {
    const { rental_start_date, return_date, delivery_address, city } = bookingDetails;

    // Policy Logic 1: Accept booking only if city = Ahmedabad
    if (city.trim().toLowerCase() !== 'ahmedabad') {
        throw new Error("Delivery is currently only available in Ahmedabad.");
    }

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        throw new Error("Authentication required to complete booking.");
    }

    // Calculate costs based on policy
    // We assume the cartItem object was populated with the joined outfit details
    if (!cartItem.outfits || !cartItem.outfits.price_per_day) {
        throw new Error("Invalid cart item data. Missing outfit price.");
    }

    const rentPrice = cartItem.outfits.price_per_day * cartItem.rental_days;

    // Policy Logic 2: Security deposit required (e.g. 50% of the rent)
    const depositAmount = rentPrice * 0.50;
    const totalPrice = rentPrice + depositAmount;

    // Execute the transaction: Insert Order & Delete Cart Item
    const { data, error } = await supabase
        .from('orders')
        .insert([{
            user_id: user.id,
            outfit_id: cartItem.outfits.id,
            size: cartItem.size,
            rental_start_date,
            return_date,
            delivery_address,
            city,
            total_price: totalPrice,
            deposit_amount: depositAmount,
            order_status: 'pending' // Default order state
        }])
        .select();

    if (error) {
        console.error("Failed to create order:", error);
        throw error;
    }

    // Cleanup: Remove the item from cart after order completes successfully (only if from cart)
    if (cartItem.id) {
        const { error: deleteError } = await supabase
            .from('cart')
            .delete()
            .eq('id', cartItem.id);

        if (deleteError) {
             console.error("Warning: Order was created, but failed to remove item from cart.", deleteError);
        }
    }

    return data;
}

/**
 * Get all orders for the currently authenticated user
 */
export async function getUserOrders() {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
        return [];
    }

    const { data, error } = await supabase
        .from('orders')
        .select(`
            *,
            outfits (
                name,
                image_url
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
         console.error("Error fetching user orders:", error);
         throw error;
    }
    
    return data;
}
