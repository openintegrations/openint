-- Add previous stateements which were missed
GRANT INSERT ON TABLE public.event TO customer; --> statement-breakpoint
GRANT INSERT ON TABLE public.event TO org; --> statement-breakpoint
GRANT INSERT ON TABLE public.event TO authenticated; --> statement-breakpoint
GRANT SELECT ON TABLE public.organization TO org; --> statement-breakpoint
GRANT SELECT ON TABLE public.organization TO authenticated; --> statement-breakpoint
-- 

ALTER POLICY "customer_read" ON "event" TO customer USING (
        org_id = public.jwt_org_id ()
        AND customer_id = public.jwt_customer_id ()
      );--> statement-breakpoint
ALTER POLICY "org_append" ON "event" TO org WITH CHECK (org_id = jwt_org_id());--> statement-breakpoint
ALTER POLICY "org_member_append" ON "event" TO authenticated WITH CHECK (
        org_id = public.jwt_org_id()
        AND user_id = public.jwt_sub()
      );--> statement-breakpoint
ALTER POLICY "customer_append" ON "event" TO customer WITH CHECK (
        org_id = public.jwt_org_id()
        AND customer_id = public.jwt_customer_id()
      );