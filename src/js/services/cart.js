import { supabase } from '../utils/supabaseClient.js';

/**
 * Add an item to the user's cart
 */
export async function addToCart(outfitId, size, rentalDays) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        throw new Error("You must be logged in to add items to your cart.");
    }

    const { data, error } = await supabase
        .from('cart')
        .insert([{
            user_id: user.id,
            outfit_id: outfitId,
            size,
            rental_days: rentalDays
        }])
        .select();

    if (error) {
        console.error("Error adding to cart:", error);
        throw error;
    }
    
    return data;
}

/**
 * Retrieve all items in the user's cart including outfit details
 */
export async function getCartItems() {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
        return [];
    }

    // Process the fetch
    const { data, error } = await supabase
        .from('cart')
        .select(`
            id,
            size,
            rental_days,
            outfits (
                id,
                name,
                price_per_day,
                image_url
            )
        `)
        .eq('user_id', user.id);

    if (error) {
         console.error("Error fetching cart items:", error);
         throw error;
    }
    
    return data;
}

/**
 * Remove an item from the cart
 */
export async function removeFromCart(cartItemId) {
     const { data: { user } } = await supabase.auth.getUser();
     if (!user) throw new Error("Authentication required.");

    const { error } = await supabase
        .from('cart')
        .delete()
        .eq('id', cartItemId)
        .eq('user_id', user.id); // Extra security

    if (error) {
         console.error("Error removing item from cart:", error);
         throw error;
    }
}
