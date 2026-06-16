-- Phase 2 Invoice Verification Screen Redesign
-- Creates tables for Comments, History, and Variance Acceptances

CREATE TABLE IF NOT EXISTS public.invoice_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE public.invoice_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoice_comments_select" ON public.invoice_comments
    FOR SELECT USING (true);

CREATE POLICY "invoice_comments_insert" ON public.invoice_comments
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "invoice_comments_update" ON public.invoice_comments
    FOR UPDATE USING (auth.uid() = created_by OR EXISTS (
        SELECT 1 FROM public.users u
        JOIN public.roles r ON u.role_id = r.id
        WHERE u.id = auth.uid() AND r.role_code IN ('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ADMIN', 'SUPER_ADMIN')
    ));


CREATE TABLE IF NOT EXISTS public.invoice_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    action VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.invoice_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoice_history_select" ON public.invoice_history
    FOR SELECT USING (true);

CREATE POLICY "invoice_history_insert" ON public.invoice_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);


CREATE TABLE IF NOT EXISTS public.invoice_variance_acceptances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    variance_id UUID NOT NULL REFERENCES public.invoice_variances(id) ON DELETE CASCADE,
    accepted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    accepted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    remarks TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'ACCEPTED'
);

ALTER TABLE public.invoice_variance_acceptances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoice_variance_acceptances_select" ON public.invoice_variance_acceptances
    FOR SELECT USING (true);

CREATE POLICY "invoice_variance_acceptances_insert" ON public.invoice_variance_acceptances
    FOR INSERT WITH CHECK (auth.uid() = accepted_by);

CREATE POLICY "invoice_variance_acceptances_update" ON public.invoice_variance_acceptances
    FOR UPDATE USING (auth.uid() = accepted_by OR EXISTS (
        SELECT 1 FROM public.users u
        JOIN public.roles r ON u.role_id = r.id
        WHERE u.id = auth.uid() AND r.role_code IN ('ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ADMIN', 'SUPER_ADMIN')
    ));
