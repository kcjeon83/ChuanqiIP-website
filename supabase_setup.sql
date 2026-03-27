-- ════════════════════════════════════════════════════
--  CHUANQI IP — Supabase 초기 설정 SQL
--  Supabase 대시보드 → SQL Editor → 아래 전체 실행
-- ════════════════════════════════════════════════════

-- 1. 테이블 생성
CREATE TABLE IF NOT EXISTS cms_content (
  id          TEXT        PRIMARY KEY,
  data        JSONB       NOT NULL DEFAULT '{}',
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 초기 행 삽입 (빈 데이터)
INSERT INTO cms_content (id, data)
VALUES ('main', '{}')
ON CONFLICT (id) DO NOTHING;

-- 3. Row Level Security 활성화
ALTER TABLE cms_content ENABLE ROW LEVEL SECURITY;

-- 4. 정책 설정
--    - 읽기: 누구나 (메인 사이트에서 읽음)
--    - 쓰기: 어드민 페이지에서 anon key로 쓰기 허용
CREATE POLICY "allow_read"   ON cms_content FOR SELECT USING (true);
CREATE POLICY "allow_insert" ON cms_content FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_update" ON cms_content FOR UPDATE USING (true);
