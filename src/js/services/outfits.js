import { supabase } from '../utils/supabaseClient.js';

/**
 * Fetch all available outfits (public listing)
 */
export async function fetchOutfits() {
  const { data, error } = await supabase
    .from('outfits')
    .select('*');
  
  if (error) throw error;
  return data;
}

/**
 * Fetch ALL outfits including unavailable (for admin)
 */
export async function fetchAllOutfits() {
  const { data, error } = await supabase
    .from('outfits')
    .select('*');

  if (error) throw error;
  return data;
}

/**
 * Get a specific outfit by its ID
 */
export async function getOutfitById(id) {
  const { data, error } = await supabase
    .from('outfits')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) throw error;
  return data;
}

/**
 * Admin: Create a new outfit
 */
export async function createOutfit(outfitData) {
  const { data, error } = await supabase
    .from('outfits')
    .insert([{
      name: outfitData.name,
      description: outfitData.description,
      price_per_day: outfitData.price_per_day,
      category: outfitData.category,
      size_available: outfitData.size_available,
      image_url: outfitData.image_url || '',
      available: outfitData.available !== undefined ? outfitData.available : true,
    }])
    .select();

  if (error) {
    console.error("Error creating outfit:", error);
    throw error;
  }
  return data;
}

/**
 * Admin: Update an existing outfit
 */
export async function updateOutfit(id, outfitData) {
  const { data, error } = await supabase
    .from('outfits')
    .update({
      name: outfitData.name,
      description: outfitData.description,
      price_per_day: outfitData.price_per_day,
      category: outfitData.category,
      size_available: outfitData.size_available,
      image_url: outfitData.image_url,
      available: outfitData.available,
    })
    .eq('id', id)
    .select();

  if (error) {
    console.error("Error updating outfit:", error);
    throw error;
  }
  return data;
}

/**
 * Admin: Delete an outfit
 */
export async function deleteOutfit(id) {
  const { error } = await supabase
    .from('outfits')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Error deleting outfit:", error);
    throw error;
  }
}

/**
 * Admin: Toggle outfit availability
 */
export async function toggleAvailability(id, available) {
  const { data, error } = await supabase
    .from('outfits')
    .update({ available })
    .eq('id', id)
    .select();

  if (error) {
    console.error("Error toggling availability:", error);
    throw error;
  }
  return data;
}
