<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { Tag } from '@lucide/svelte';
	import type { User } from '@supabase/supabase-js';
	import DeviceLaptop from '@tabler/icons-svelte/icons/device-laptop';
	import DotsVerticalIcon from '@tabler/icons-svelte/icons/dots-vertical';
	import LogoutIcon from '@tabler/icons-svelte/icons/logout';
	import MoneybagEdit from '@tabler/icons-svelte/icons/moneybag-edit';
	import Moon from '@tabler/icons-svelte/icons/moon';
	import PigMoney from '@tabler/icons-svelte/icons/pig-money';
	import Sun from '@tabler/icons-svelte/icons/sun';
	import { default as Users } from '@tabler/icons-svelte/icons/users';
	import { resetMode, setMode } from 'mode-watcher';
	import type { ComponentProps, Snippet } from 'svelte';

	const sidebar = Sidebar.useSidebar();

	const sidebarNav = [
		{
			title: 'Dashboard',
			url: '/private/dashboard',
			icon: MoneybagEdit
		},
		{
			title: 'Contatti',
			url: '/private/contacts',
			icon: Users
		},
		{
			title: 'Tag',
			url: '/private/tags',
			icon: Tag
		}
	];

	type $$Props = ComponentProps<typeof Sidebar.Root> & {
		user: User;
		onlogout: () => {};
		mainButton?: Snippet;
	};

	let { user, onlogout, mainButton, ...restProps }: $$Props = $props();
</script>

<Sidebar.Root collapsible="offcanvas" {...restProps}>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton class="data-[slot=sidebar-menu-button]:!p-1.5">
					{#snippet child({ props })}
						<a href="/private" {...props}>
							<PigMoney class="!size-5" />
							<span class="font-serif text-lg font-semibold">Debt Manager</span>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupContent class="flex flex-col gap-2">
				{#if mainButton}
					<Sidebar.Menu>
						<Sidebar.MenuItem class="flex items-center gap-2">
							{@render mainButton?.()}
						</Sidebar.MenuItem>
					</Sidebar.Menu>
				{/if}
				<Sidebar.Menu>
					{#each sidebarNav as item (item.title)}
						<Sidebar.MenuItem>
							<a href={item.url}>
								<Sidebar.MenuButton tooltipContent={item.title}>
									{#if item.icon}
										<item.icon />
									{/if}
									<span>{item.title}</span>
								</Sidebar.MenuButton>
							</a>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Content>
	<Sidebar.Footer>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<Sidebar.MenuButton
								{...props}
								size="lg"
								class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
							>
								<Avatar.Root class="size-8 rounded-lg grayscale">
									<Avatar.Fallback class="rounded-lg">
										{user.email?.slice(0, 2).toUpperCase()}
									</Avatar.Fallback>
								</Avatar.Root>
								<div class="grid flex-1 text-left text-sm leading-tight">
									<span class="truncate font-medium">{user.email}</span>
									<span class="truncate text-xs text-muted-foreground">
										{user.email}
									</span>
								</div>
								<DotsVerticalIcon class="ml-auto size-4" />
							</Sidebar.MenuButton>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content
						class="w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-lg"
						side={sidebar.isMobile ? 'bottom' : 'right'}
						align="end"
						sideOffset={4}
					>
						<DropdownMenu.Label class="p-0 font-normal">
							<div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<Avatar.Root class="size-8 rounded-lg">
									<Avatar.Fallback class="rounded-lg">
										{user.email?.slice(0, 2).toUpperCase()}
									</Avatar.Fallback>
								</Avatar.Root>
								<div class="grid flex-1 text-left text-sm leading-tight">
									<span class="truncate font-medium">{user.email}</span>
									<span class="truncate text-xs text-muted-foreground">
										{user.email}
									</span>
								</div>
							</div>
						</DropdownMenu.Label>
						<DropdownMenu.Sub>
							<DropdownMenu.SubTrigger>
								<Sun
									class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 !transition-all dark:scale-0 dark:-rotate-90"
								/>
								<Moon
									class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 !transition-all dark:scale-100 dark:rotate-0"
								/>
								Tema
							</DropdownMenu.SubTrigger>
							<DropdownMenu.SubContent>
								<DropdownMenu.Item onclick={() => setMode('light')}>
									<Sun />
									Chiaro
								</DropdownMenu.Item>
								<DropdownMenu.Item onclick={() => setMode('dark')}>
									<Moon />
									Scuro
								</DropdownMenu.Item>
								<DropdownMenu.Item onclick={() => resetMode()}>
									<DeviceLaptop />
									Sistema
								</DropdownMenu.Item>
							</DropdownMenu.SubContent>
						</DropdownMenu.Sub>
						<DropdownMenu.Separator />
						<DropdownMenu.Item onclick={onlogout}>
							<LogoutIcon />
							Esci
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Footer>
</Sidebar.Root>
