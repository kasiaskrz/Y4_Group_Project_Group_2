// CommonJS version (safe default on Vercel)
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { title } = req.body ?? {};
    if (!title) return res.status(400).json({ error: 'Missing title' });

    const { data, error } = await supabase
      .from('notes')
      .insert({ title })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ note: data });
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  }
};
