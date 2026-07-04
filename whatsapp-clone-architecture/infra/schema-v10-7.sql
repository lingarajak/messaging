-- V10.7 Schema Updates

-- Polls in channels
ALTER TABLE polls ADD COLUMN target_type TEXT DEFAULT 'chat';
ALTER TABLE polls ADD COLUMN target_id TEXT;
UPDATE polls SET target_id = chat_id WHERE target_id IS NULL;

-- Shared photo albums
CREATE TABLE albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  chat_id TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE album_members (
  album_id UUID REFERENCES albums(id),
  user_id TEXT NOT NULL,
  PRIMARY KEY (album_id, user_id)
);

CREATE TABLE album_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID REFERENCES albums(id),
  photo_url TEXT NOT NULL,
  caption TEXT,
  added_by TEXT NOT NULL,
  added_at TIMESTAMPTZ DEFAULT NOW()
);
