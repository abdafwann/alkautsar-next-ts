-- RLS (Row Level Security) Implementation
-- Purpose: Database-level protection to ensure users can only access their own data
-- Principle: Defense in depth - RLS as backup to app-level authorization

-- Enable RLS on sensitive tables
-- These policies ensure that even if app-level checks fail,
-- the database will still prevent unauthorized access

-- ============================================
-- ORDER TABLE POLICIES
-- ============================================

-- Enable RLS on Order table
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if exists (for re-runs)
DROP POLICY IF EXISTS "order_user_isolation_select" ON "Order";
DROP POLICY IF EXISTS "order_user_isolation_update" ON "Order";
DROP POLICY IF EXISTS "order_user_isolation_delete" ON "Order";

-- Policy: Users can only SELECT their own orders, Admins can see all
CREATE POLICY "order_user_isolation_select" ON "Order"
    FOR SELECT USING (
        -- Admin bypass: If is_admin flag is set, allow all
        current_setting('app.is_admin', true) = 'true'
        -- User isolation: Must match user ID or be a guest order (guestEmail is not null)
        OR "userId"::text = current_setting('app.user_id', true)
        OR ("userId" IS NULL AND "guestEmail" IS NOT NULL)
    );

-- Policy: Users can only UPDATE their own orders (limited fields)
CREATE POLICY "order_user_isolation_update" ON "Order"
    FOR UPDATE USING (
        current_setting('app.is_admin', true) = 'true'
        OR "userId"::text = current_setting('app.user_id', true)
    );

-- Note: INSERT and DELETE are handled by app-level logic only
-- INSERT doesn't need RLS (new orders are always created by the user)
-- DELETE is restricted via app-level checks (orders are cancelled, not deleted)

-- ============================================
-- CART ITEM TABLE POLICIES
-- ============================================

-- Enable RLS on CartItem table
ALTER TABLE "CartItem" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cart_user_isolation_all" ON "CartItem";

CREATE POLICY "cart_user_isolation_all" ON "CartItem"
    FOR ALL USING (
        -- Users can only access their own cart items
        "userId"::text = current_setting('app.user_id', true)
        -- Note: No admin bypass for cart - admins shouldn't need to see user carts
    );

-- ============================================
-- USER TABLE POLICIES
-- ============================================

-- Enable RLS on User table (for profile access)
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "user_profile_isolation_select" ON "User";
DROP POLICY IF EXISTS "user_profile_isolation_insert" ON "User";
DROP POLICY IF EXISTS "user_profile_isolation_update" ON "User";

-- SELECT: Users can see their own profile, admins can see all
CREATE POLICY "user_profile_isolation_select" ON "User"
    FOR SELECT USING (
        -- Users can only see their own profile
        id::text = current_setting('app.user_id', true)
        -- Admins can see all profiles
        OR current_setting('app.is_admin', true) = 'true'
    );

-- INSERT: Allow everyone to insert (for user registration)
-- App-level validation handles duplicate emails, etc.
CREATE POLICY "user_profile_isolation_insert" ON "User"
    FOR INSERT WITH CHECK (true);

-- UPDATE: Users can update their own profile, admins can update all
CREATE POLICY "user_profile_isolation_update" ON "User"
    FOR UPDATE USING (
        -- Users can only update their own profile
        id::text = current_setting('app.user_id', true)
        -- Admins can update any profile
        OR current_setting('app.is_admin', true) = 'true'
    );

-- ============================================
-- ADMIN LOG TABLE POLICIES
-- ============================================

-- Enable RLS on AdminLog table (FIXED: was incorrectly set to "Order")
ALTER TABLE "AdminLog" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_log_isolation" ON "AdminLog";

CREATE POLICY "admin_log_isolation" ON "AdminLog"
    FOR SELECT USING (
        -- Only admins can view admin logs
        current_setting('app.is_admin', true) = 'true'
    );

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Create helper function to set user context
-- Uses session scope (is_local = false) so settings persist across queries
CREATE OR REPLACE FUNCTION set_app_context(
    p_user_id UUID,
    p_is_admin BOOLEAN DEFAULT FALSE
)
RETURNS VOID AS $$
BEGIN
    -- is_local = false means session scope (persists until disconnect)
    PERFORM set_config('app.user_id', p_user_id::text, false);
    PERFORM set_config('app.is_admin', p_is_admin::text, false);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify RLS is enabled on all tables
SELECT
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename IN ('Order', 'CartItem', '"User"', 'AdminLog', 'Admin')
AND schemaname = 'public';

-- List all policies created
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename IN ('Order', 'CartItem', '"User"', 'AdminLog');
