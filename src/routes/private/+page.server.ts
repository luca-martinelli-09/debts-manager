import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ depends, locals: { supabase } }) => {
	depends('supabase:db:notes');
	const { data: notes } = await supabase.from('expenses').select('id,note').order('id');
	return { notes: notes ?? [] };
};
