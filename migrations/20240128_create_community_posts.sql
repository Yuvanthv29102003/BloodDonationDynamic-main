-- Create community_posts table
CREATE TABLE IF NOT EXISTS community_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    content TEXT NOT NULL,
    location TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view all posts
CREATE POLICY "Users can view all posts"
    ON community_posts
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow users to create their own posts
CREATE POLICY "Users can create their own posts"
    ON community_posts
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own posts
CREATE POLICY "Users can update their own posts"
    ON community_posts
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own posts
CREATE POLICY "Users can delete their own posts"
    ON community_posts
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);