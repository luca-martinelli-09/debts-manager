import type { Database, Tables, TablesInsert, TablesUpdate } from '$lib/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';

export type Tag = Tables<'tags'>;
export type TagInsert = TablesInsert<'tags'>;
export type TagUpdate = TablesUpdate<'tags'>;

export class TagsService {
	constructor(private supabase: SupabaseClient<Database>) {}

	async getTags() {
		const { data, error } = await this.supabase
			.from('tags')
			.select('*')
			.order('name');

		if (error) {
			console.error('Error fetching tags:', error);
		}

		return { data, error };
	}

	async getTag(id: string) {
		const { data, error } = await this.supabase
			.from('tags')
			.select('*')
			.eq('id', id)
			.single();

		if (error) {
			console.error('Error fetching tag:', error);
		}

		return { data, error };
	}

	async createTag(tagData: Omit<TagInsert, 'user_id'>) {
		const {
			data: { user }
		} = await this.supabase.auth.getUser();

		if (!user) {
			return { data: null, error: { message: 'User not authenticated' } };
		}

		const { data, error } = await this.supabase
			.from('tags')
			.insert({
				...tagData,
				user_id: user.id
			})
			.select()
			.single();

		if (error) {
			console.error('Error creating tag:', error);
		}

		return { data, error };
	}

	async updateTag(id: string, updates: TagUpdate) {
		const { data, error } = await this.supabase
			.from('tags')
			.update(updates)
			.eq('id', id)
			.select()
			.single();

		if (error) {
			console.error('Error updating tag:', error);
		}

		return { data, error };
	}

	async deleteTag(id: string) {
		// Check if tag is assigned to any contacts
		const { data: contactTags } = await this.supabase
			.from('contact_tags')
			.select('contact_id')
			.eq('tag_id', id)
			.limit(1);

		if (contactTags && contactTags.length > 0) {
			return {
				data: null,
				error: { message: 'Cannot delete tag that is assigned to contacts' }
			};
		}

		const { error } = await this.supabase
			.from('tags')
			.delete()
			.eq('id', id);

		if (error) {
			console.error('Error deleting tag:', error);
		}

		return { data: null, error };
	}

	async getTagUsageCount(id: string) {
		const { data, error } = await this.supabase
			.from('contact_tags')
			.select('contact_id')
			.eq('tag_id', id);

		if (error) {
			console.error('Error fetching tag usage count:', error);
			return { count: 0, error };
		}

		return { count: data.length, error: null };
	}
}