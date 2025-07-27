<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
</script>

<div class="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
	<div class="flex w-full max-w-sm flex-col gap-6">
		<div class="flex flex-col gap-6">
			<Card.Root>
				<Card.Header class="text-center">
					<Card.Title class="text-xl">Accedi</Card.Title>
					<Card.Description>Inserisci email e password</Card.Description>
				</Card.Header>
				<Card.Content>
					<form method="post" action="?/login">
						<div class="grid gap-6">
							<div class="grid gap-6">
								<div class="grid gap-3">
									<Label for="email">Email</Label>
									<Input
										id="email"
										name="email"
										type="email"
										placeholder="m@example.com"
										required
									/>
								</div>
								<div class="grid gap-3">
									<div class="flex items-center">
										<Label for="password">Password</Label>
									</div>
									<Input id="password" name="password" type="password" required />
								</div>
							</div>
							<div class="flex flex-col gap-2">
								<Button type="submit" class="w-full">Accedi</Button>
								<Button formaction="?/signup" variant="ghost" class="w-full">Registrati</Button>
							</div>
						</div>
					</form>
				</Card.Content>
			</Card.Root>
		</div>
	</div>
</div>
