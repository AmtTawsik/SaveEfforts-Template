<template>
	<div>
		<SideBar />
		<div class="p-0 lg:ml-64">
			<!-- <div class="p-0"> -->
			<!-- <StatusBar /> -->

			<div class="relative">
				<main class="main-container">
					<slot />
				</main>
				<!-- <div class="taskmenu absolute right-0 top-0 h-screen max-lg:hidden">
					<TaskMenu />
				</div> -->
			</div>
		</div>
	</div>
</template>

<script setup></script>
