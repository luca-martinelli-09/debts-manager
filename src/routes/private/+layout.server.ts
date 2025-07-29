import { ContactsService } from '$lib/supabase/contacts';
import { TagsService } from '$lib/supabase/tags';

export const load = async ({ locals }) => {
	const { supabase } = locals;
	const contactsService = new ContactsService(supabase);
	const tagsService = new TagsService(supabase);

	const [contactsResult, tagsResult] = await Promise.all([
		contactsService.getContacts(),
		tagsService.getTags()
	]);

	return {
		contacts: contactsResult.data || [],
		tags: tagsResult.data || [],
		contactsError: contactsResult.error,
		tagsError: tagsResult.error
	};
};
