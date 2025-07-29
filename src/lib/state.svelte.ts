import type { Contact } from '$lib/supabase/contacts';
import type { Tag } from '$lib/supabase/tags';

type $State = { contacts: Contact[]; tags: Tag[] };

export const globalStore: $State = $state({
	contacts: [],
	tags: []
});
