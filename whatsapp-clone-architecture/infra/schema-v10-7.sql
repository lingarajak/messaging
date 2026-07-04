-- V10.7 Schema
ALTER TABLE polls ADD COLUMN target_type TEXT DEFAULT 'chat';
ALTER TABLE polls ADD COLUMN target_id TEXT;
CREATE TABLE albums (id UUID PRIMARY KEY, title TEXT, chat_id TEXT);
CREATE TABLE album_photos (id UUID PRIMARY KEY, album_id UUID, photo_url TEXT);
