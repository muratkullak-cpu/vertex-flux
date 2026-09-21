const VERTEX_SUPABASE_URL='https://ujrgwowdxxazbjilstht.supabase.co';
const VERTEX_SUPABASE_PUBLISHABLE_KEY='sb_publishable_uvi9mfx29vf9ohey_NfMSg_LT-TxBXY';
const VertexCloud=window.supabase?window.supabase.createClient(VERTEX_SUPABASE_URL,VERTEX_SUPABASE_PUBLISHABLE_KEY):null;
window.VertexCloud=VertexCloud;
