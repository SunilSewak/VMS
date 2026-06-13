# Quick Fix - Edge Function 400 Error

## The Problem
User creation was failing with:
```
Edge Function returned a non-2xx status code (400)
```

## Root Cause
**Function name mismatch:**
- Frontend was calling: `'hyper-processor'`
- But Edge Function is deployed as: `'create-user'`

## The Fix (Already Applied)
Changed 1 line in `src/features/users/userService.ts`:

**Line 172 - Before:**
```typescript
const { data, error } = await supabase.functions.invoke('hyper-processor', {
```

**Line 172 - After:**
```typescript
const { data, error } = await supabase.functions.invoke('create-user', {
```

## What This Fixes
✅ Frontend now calls the correct function name  
✅ Edge Function can be found on Supabase  
✅ 400 error should resolve to successful user creation  

## Next Steps
1. **Deploy the Edge Function** (if not already done)
   - Use: `supabase functions deploy create-user`
   - Or: Use Supabase Dashboard → Edge Functions → Create
   - Copy code from: `supabase/functions/create-user/index.ts`

2. **Set SERVICE_ROLE_KEY Secret** (on Supabase)
   - Dashboard → Project Settings → Edge Functions → Secrets
   - Key: `SERVICE_ROLE_KEY`
   - Value: Your service role key from Settings → API

3. **Test User Creation**
   - Login as Admin
   - Go to Administration → Users
   - Try creating a user
   - Should succeed now

## Files Modified
- `src/features/users/userService.ts` (1 line changed)

## Documentation
See `EDGE_FUNCTION_FIX_AND_DEPLOYMENT.md` for complete deployment guide.
