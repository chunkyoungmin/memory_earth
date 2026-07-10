-- Earth Memory 초기 스키마 (Part 1: 골격만 정의, 세부 컬럼/관계는 Part 4~7에서 확장)

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trips (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS photos (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  trip_id INTEGER REFERENCES trips(id) ON DELETE SET NULL, -- 여행에 속하지 않아도 됨
  file_path TEXT NOT NULL,
  title TEXT,
  country TEXT,
  city TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  taken_at TIMESTAMPTZ,       -- EXIF 촬영 시간
  gps_source TEXT DEFAULT 'exif', -- 'exif' | 'manual'
  created_at TIMESTAMPTZ DEFAULT now()
);
