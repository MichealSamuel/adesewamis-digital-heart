DROP POLICY "Anyone can view memories" ON public.memory_entries;
CREATE POLICY "Owner can view memories" ON public.memory_entries FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.memory_entries TO authenticated;
GRANT ALL ON public.memory_entries TO service_role;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.memory_entries FROM anon;
DROP POLICY "Anyone can view memory lane files" ON storage.objects;
CREATE POLICY "Owner can view memory lane files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'memory-lane' AND public.has_role(auth.uid(), 'admin'::public.app_role));