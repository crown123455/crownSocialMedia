-- ================================================================
-- Crown Social Media SaaS - Complete External Supabase Setup SQL
-- ================================================================

CREATE TABLE IF NOT EXISTS public.creators (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    display_name TEXT,
    category TEXT DEFAULT 'Business',
    monthly_content_target INTEGER DEFAULT 30,
    profile_photo TEXT,
    contract_status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.social_accounts (
    id TEXT PRIMARY KEY,
    creator_id TEXT REFERENCES public.creators(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    account_name TEXT NOT NULL,
    connection_status TEXT DEFAULT 'connected',
    token_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.media_assets (
    id TEXT PRIMARY KEY,
    creator_id TEXT REFERENCES public.creators(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_type TEXT DEFAULT 'video',
    title TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.posts (
    id TEXT PRIMARY KEY,
    creator_id TEXT REFERENCES public.creators(id) ON DELETE CASCADE,
    title TEXT,
    caption TEXT,
    media_url TEXT,
    status TEXT DEFAULT 'draft',
    scheduled_at TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.post_targets (
    id TEXT PRIMARY KEY,
    post_id TEXT REFERENCES public.posts(id) ON DELETE CASCADE,
    social_account_id TEXT,
    status TEXT DEFAULT 'pending',
    error_message TEXT,
    published_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_targets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow All Access Creators" ON public.creators;
DROP POLICY IF EXISTS "Allow All Access Social Accounts" ON public.social_accounts;
DROP POLICY IF EXISTS "Allow All Access Media Assets" ON public.media_assets;
DROP POLICY IF EXISTS "Allow All Access Posts" ON public.posts;
DROP POLICY IF EXISTS "Allow All Access Post Targets" ON public.post_targets;

CREATE POLICY "Allow All Access Creators" ON public.creators FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Access Social Accounts" ON public.social_accounts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Access Media Assets" ON public.media_assets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Access Posts" ON public.posts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Access Post Targets" ON public.post_targets FOR ALL USING (true) WITH CHECK (true);
