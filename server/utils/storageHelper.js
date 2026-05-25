const supabase = require('../config/supabase');

/**
 * Uploads a file buffer to Supabase Storage and returns its public URL.
 * 
 * @param {Object} file - The file object from Multer (using memoryStorage)
 * @param {string} folder - The folder name in the bucket (e.g. 'avatars', 'projects', 'skills', 'blogs')
 * @returns {Promise<string>} The public URL of the uploaded file
 */
const uploadToSupabase = async (file, folder = 'general') => {
  if (!file) return '';

  const fileExt = file.originalname.split('.').pop();
  const fileName = `${folder}/${Date.now()}-${Math.round(Math.random() * 1E9)}.${fileExt}`;

  console.log(`📤 Uploading ${file.originalname} to Supabase Storage (${folder}/${fileName})...`);

  const { data, error } = await supabase.storage
    .from('portfolio')
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: true
    });

  if (error) {
    console.error('❌ Supabase Upload Error:', error);
    throw new Error(`Supabase upload failed: ${error.message}`);
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('portfolio')
    .getPublicUrl(fileName);

  console.log(`✅ File uploaded successfully. Public URL: ${publicUrl}`);
  return publicUrl;
};

module.exports = {
  uploadToSupabase
};
