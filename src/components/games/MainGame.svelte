<script lang="ts">
	import { dogBreeds } from '../../stores/dogs';
	import api from '../../lib/api';
	import type { GameController } from './types';
	import GameKeyboard from './GameKeyboard.svelte';

	export let started: boolean = false;

	let breedImages: string[] = [];
	let currentBreedName: string = '';
	let currentBreedNameArray: any[] = [];
	let enteredChars = '';

	function processBreedName() {
		currentBreedNameArray = currentBreedName.split('').map((c) => ({
			char: c,
			visible: false,
			state: -1
		}));
	}

	function loadBreedInfo() {
		const breeds = $dogBreeds;
		const breedKeys = Object.keys(breeds);

		const idx = Math.floor(Math.random() * breedKeys.length);
		const breedName = breedKeys[idx];
		let subBreedName = '';

		if (breeds[breedName].length > 0) {
			subBreedName = breeds[breedName][Math.floor(Math.random() * breeds[breedName].length)];
		}

		const url =
			subBreedName == ''
				? `breed/${breedName}/images/random/3`
				: `breed/${breedName}/${subBreedName}/images/random/3`;
		console.log(url);
		api.dogApi
			.get(url)
			.then((response) => {
				const { message } = response.data;
				breedImages = message;
				currentBreedName = breedName + (subBreedName ? ' ' + subBreedName : '');
				processBreedName();
				started = true;
			})
			.catch((error) => {
				alert('Unable to start game! ' + error.message);
			});
	}

	function appendChar(char: string) {
		if (enteredChars.length < currentBreedName.length) {
			enteredChars = enteredChars + char;
		}
	}

	function backspaceChar() {
		if (enteredChars.length > 0) {
			enteredChars = enteredChars.slice(0, enteredChars.length - 1);
		}
	}

	function handleReset() {
		enteredChars = '';
		processBreedName();
	}

	function checkGame() {
		let totalCorrect = 0;
		console.log(
			currentBreedName,
			enteredChars,
			currentBreedName.toLowerCase() == enteredChars.toLowerCase()
		);

		if (enteredChars.length != currentBreedName.length) {
			gameController.end(false);
			return;
		}

		let chancesChars = currentBreedName.toLowerCase().split('');
		currentBreedNameArray = currentBreedNameArray.map((item, i) => {
			const cInput = enteredChars[i].toLowerCase();
			if (item.char.toLowerCase() == cInput) {
				item.visible = true;
				item.state = 2;
				totalCorrect++;
			} else {
				if (chancesChars.indexOf(cInput) > -1) {
					item.state = 1;
					chancesChars.splice(chancesChars.indexOf(cInput), 1);
				} else {
					item.state = 0;
				}
			}

			return item;
		});

		if (totalCorrect >= currentBreedName.length) {
			gameController.end(true);
		}
	}

	function handleKeyboardKeyPress(e: CustomEvent) {
		const { char } = e.detail;
		appendChar(char);
	}

	function handleKeyboardDelete() {
		backspaceChar();
	}

    function handleKeyboardSubmit() {
        checkGame();
    }

    function handleKeyboardClear() {
        handleReset();
    }

	export const gameController: GameController = {
		start() {
			loadBreedInfo();
		},
		pause() {},
		end(win: boolean) {
			if (win) {
				alert("You're correct!");
			} else {
				alert('Try again...');
			}
		}
	};
</script>

<div class="guess-the-doggo-container">
	{#if started}
		<div class="dog-pics">
			{#each breedImages as img, i (i)}
				<img src={img} alt="Dog image number {i + 1}" class="dog-pic" />
			{/each}
		</div>
		<div class="dog-name">
			{#each currentBreedNameArray as item, i (i)}
				<div
					class="letter"
					class:green={item.state == 2}
					class:orange={item.state == 1}
					class:red={item.state == 0}
				>
					{item.visible ? item.char : ''}
				</div>
			{/each}
		</div>
		<div class="entered-chars">
			{enteredChars}
		</div>
		<GameKeyboard
			on:keypress={handleKeyboardKeyPress}
			on:submit={handleKeyboardSubmit}
			on:deletechar={handleKeyboardDelete}
			on:clearall={handleKeyboardClear}
		/>
		<button
			class="start-btn bg-blue-400 text-white border-blue-700 rounded-lg py-2 px-10 w-full mt-4"
			on:click={checkGame}
		>
			Check
		</button>
	{:else}
		<div class="greet-screen p-4">
			<h3 class="text-3xl text-center mt-16 uppercase greet-h3">Guess The Doggo</h3>
			<button
				class="start-btn bg-green-600 text-white border-green-700 rounded-lg"
				on:click={() => gameController.start()}
			>
				Start
			</button>
		</div>
	{/if}
</div>

<style lang="scss">
	.guess-the-doggo-container {
		min-height: 300px;
		padding: 1rem;

		.entered-chars {
			text-transform: uppercase;
			text-align: center;
			letter-spacing: 3px;
			font-size: 1.25rem;
			padding: 1rem;
			display: block;
			min-height: 3.25rem;
		}

		.dog-name {
			display: flex;
			justify-content: space-evenly;
			height: fit-content;

			.letter {
				font-size: 2rem;
				width: 3rem;
				height: 3rem;
				display: block;
				border-radius: 0.5rem;

				color: #333;
				background-color: white;
				border: 3px solid steelblue;

				display: flex;
				align-items: center;
				justify-content: center;
				text-transform: uppercase;

				transition: all 250ms ease;

				&.red {
					color: white;
					background-color: rgb(255, 0, 0);
					border-color: rgb(170, 0, 0);
				}

				&.orange {
					background-color: blanchedalmond;
					border-color: burlywood;
				}

				&.green {
					color: white;
					background-color: rgb(0, 220, 0);
					border-color: rgb(0, 170, 0);
				}
			}
		}

		.dog-pics {
			display: flex;
			justify-content: space-between;
			padding: 1rem;

			.dog-pic {
				width: 200px;
			}
		}

		.greet-screen {
			display: flex;
			flex-direction: column;

			.greet-h3 {
				letter-spacing: 2px;
			}

			.start-btn {
				margin-top: 3rem;
				font-size: 1.75rem;
				text-transform: uppercase;
				letter-spacing: 4px;
				border-width: 2px;
				border-style: solid;
				width: fit-content;
				padding: 0.25rem 3rem;
				align-self: center;
			}
		}
	}
</style>
