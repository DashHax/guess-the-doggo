<script lang="ts">
	import { dogBreeds } from '../../stores/dogs';
	import api from '../../lib/api';
	import type { GameController } from './types';
	import GameKeyboard from './GameKeyboard.svelte';
	import { goto } from '$app/navigation';

	export let gameState: 'idle' | 'playing' | 'paused' | 'win' | 'ended' = 'idle';

	const GAME_DIFFICULTIES: { [key: string]: { label: string; showPercent: number } } = {
		easy: {
			label: 'Easy',
			showPercent: 0.5
		},
		medium: {
			label: 'Medium',
			showPercent: 0.25
		},
		hard: {
			label: 'Hard',
			showPercent: 0.1
		},
		extreme: {
			label: 'Extreme (No Hint)',
			showPercent: 0
		}
	};

	const MAX_HINT = 10;

	let selectedDifficulties: string;
	let breedImages: string[] = [];
	let currentBreedName: string = '';
	let currentBreedNameArray: any[] = [];
	let enteredChars = '';

	let scoring: { tries: number; attemptsPattern: string[] } = {
		tries: 0,
		attemptsPattern: []
	};

	let visibleIndexes: number[] = [];

	function prepareDifficulties() {
		visibleIndexes = [];
		const difficulties = GAME_DIFFICULTIES[selectedDifficulties];
		const n = Math.min(Math.floor(currentBreedName.length * difficulties.showPercent), MAX_HINT);

		while (visibleIndexes.length < n) {
			let rand = Math.floor(Math.random() * currentBreedName.length);
			while (visibleIndexes.indexOf(rand) > -1) {
				rand = Math.floor(Math.random() * currentBreedName.length);
			}

			visibleIndexes.push(rand);
		}
	}

	function processBreedName(backspace: boolean = false) {
		currentBreedNameArray = currentBreedName
			.split('')
			.map((c) => ({ char: c, visible: false, state: -1 }));
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

		api.dogApi
			.get(url)
			.then((response) => {
				const { message } = response.data;
				breedImages = message;
				currentBreedName = breedName + (subBreedName ? ' ' + subBreedName : '');
				processBreedName();
				prepareDifficulties();
				window['$$__gameEngine'] = {
					breedName: currentBreedName
				};
				gameState = 'playing';
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
	}

	function checkGame() {
		if (gameState != 'playing') return;

		let totalCorrect = 0;
		let attempPattern = '';

		scoring.tries++;
		let chancesChars = currentBreedName.toLowerCase().split('');

		currentBreedNameArray = currentBreedNameArray.map((item, i) => {
			const cInput = enteredChars[i]?.toLowerCase() ?? '#';
			const cWord = currentBreedName[i].toLowerCase();

			item.char = cInput;
			item.visible = true;

			// 1. Current letter is correct in both position and character
			if (cInput == cWord) {
				chancesChars[i] = '.';
				item.state = 2;
				totalCorrect++;
				attempPattern += '🟩';

				return item;
			}

			/**
			 * 2.
			 *
			 * Current letter is correct but not in the right position.
			 * At this stage, cInput != cWord will always be true.
			 * */

			for (let x = 0; x < chancesChars.length; x++) {
				// Go through the chances characters array <- this is a buffer to check and replace found char
				if (chancesChars[x] == cInput) {
					// Found the first match at the chances characters array
					chancesChars[x] = '.'; // Replace the chance character - means this chance had been used
					item.state = 1;
					attempPattern += '🟧';

					return item; // Immediately return
				}
			}

			/**
			 * 3.
			 *
			 * Current letter is not correct both in terms of character and position.
			 * At this stage, it is always cInput != cWord, and cInput is nowhere to be found in chancesChars
			 * Therefore, since it's not matching, and cInput is not found in the answer space, hence it's assumed to
			 * be not found
			 * */

			item.state = 0;
			attempPattern += '⬜️';

			return item;
		});

		scoring.attemptsPattern.push(attempPattern);

		if (totalCorrect >= currentBreedName.length) {
			gameController.end(true);
		}
	}

	function handleKeyboardKeyPress(e: CustomEvent) {
		if (gameState != 'playing') return;
		const { char } = e.detail;
		appendChar(char);
	}

	function handleKeyboardDelete() {
		if (gameState != 'playing') return;
		backspaceChar();
	}

	function handleKeyboardSubmit() {
		if (gameState != 'playing') return;
		checkGame();
	}

	function handleKeyboardClear() {
		if (gameState != 'playing') return;
		handleReset();
		processBreedName();
	}

	function handleRestart() {
		gameController.start();
	}

	function handleGameEnd() {
		gameController.end(false);
	}

	export const gameController: GameController = {
		start() {
			enteredChars = '';
			breedImages = [];
			currentBreedName = '';
			currentBreedNameArray = [];
			visibleIndexes = [];
			scoring.tries = 0;
			scoring.attemptsPattern = [];

			loadBreedInfo();
		},
		pause() {},
		end(win: boolean) {
			if (win) {
				gameState = 'win';
			} else {
				gameState = 'ended';
				goto('/', { replaceState: true, invalidateAll: true });
			}
		}
	};
</script>

<div class="guess-the-doggo-container">
	{#if gameState == 'playing' || gameState == 'win'}
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
					class:gray={item.state == 0}
					class:space={item.char == ' '}
				>
					{item.visible || visibleIndexes.includes(i) ? (item.char == '#' ? '' : item.char) : ''}
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
	{:else if gameState == 'idle'}
		<div class="greet-screen p-4">
			<h3 class="text-3xl text-center mt-16 uppercase greet-h3">Guess The Doggo</h3>

			<div class="game-difficulties">
				<label>Select difficulties:</label>
				<select bind:value={selectedDifficulties}>
					{#each Object.keys(GAME_DIFFICULTIES) as key (key)}
						{@const obj = GAME_DIFFICULTIES[key]}
						<option value={key}>{obj.label}</option>
					{/each}
				</select>
			</div>

			<button
				class="start-btn bg-green-600 text-white border-green-700 rounded-lg"
				on:click={() => gameController.start()}
			>
				Start
			</button>
		</div>
	{/if}
	<!-- Separate if..else for floating UI -->
	{#if gameState == 'win'}
		<div class="win-screen">
			<h1 class="text-7xl uppercase text-center text-yellow-500">You Win!</h1>
			<h3 class="text-5xl mt-6 text-center font-semibold">
				It's <span style="text-transform: capitalize;">{currentBreedName}</span>!
			</h3>
			<p class="text-3xl mt-6 text-center">Total attempts: {scoring.tries}</p>
			<textarea
				value={`The breed is: ${currentBreedName
					.split(' ')
					.map((x) => (x ? x[0].toUpperCase() + x.slice(1) : ''))
					.join(' ')}\n\nMy attempts:\n${scoring.attemptsPattern.join('\n')}`.trim()}
			/>
			<div class="buttons mt-8 flex justify-evenly">
				<button class="win-btn green" on:click={handleRestart}> Again </button>
				<button class="win-btn" on:click={handleGameEnd}> Exit </button>
			</div>
		</div>
	{/if}
</div>

<style lang="scss">
	.guess-the-doggo-container {
		min-height: 300px;
		padding: 1rem;
		position: relative;

		.win-screen {
			position: absolute;
			width: 75%;
			background-color: lightseagreen;
			color: white;
			border: 3px solid green;
			border-radius: 1rem;

			display: flex;
			flex-direction: column;

			padding: 1.5rem;
			top: 50vh;
			left: 50%;
			transform: translate(-50%, -50%);

			textarea {
				align-self: center;
				width: 75%;
				height: 100px;
				margin-top: 1.75rem;
				color: #333;
				resize: none;
				padding: 1rem;
				border: 1px solid #ccc;
				border-radius: 0.5rem;
				overflow: auto;
			}

			.buttons {
				.win-btn {
					font-size: 1.5rem;
					padding: 0.75rem 3rem;
					background-color: orange;
					color: white;
					border-radius: 5rem;
					text-transform: uppercase;
					letter-spacing: 3px;
					text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.4);
					box-shadow: 1px 1px 3px rgba(255, 255, 255, 0.5);

					&.green {
						background-color: green;
					}
				}
			}
		}

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

				&.gray {
					color: #333;
					background-color: #eee;
					border-color: #aaa;
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

				&.space {
					opacity: 0;
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

			.game-difficulties {
				display: flex;
				flex-direction: column;
				margin-top: 1rem;
				font-size: 1.25rem;

				label {
					margin-bottom: 0.5rem;
				}

				select {
					padding: 1rem 1.25rem;
					appearance: none;
					background-color: white;
					border: 1px solid #ccc;
					border-radius: 0.5rem;
					cursor: pointer;
					position: relative;
					background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAABmklEQVRoQ+1YsUoDURDMCRrrpBau8As0SCzTaGNnYaGFlv6CpPUXxCqpFKzExtJCsNPGWitLG6sUCaKzcAdR8s57O+/lPNjAkCPZndmdeeFBkkbNX0nN52/YAlUnaAlYAqQDdoRIA+l2S4C2kCSwBEgD6XZLgLaQJLAESAPpdkuAtpAk0CSwBM0rYIXU/t3+hg/2gLEPr2YB4d8A7oGmj1hB7QTf9YAHXz7tAqJzDJz5Cjrqhetcw8UsIHoD4EgjPNVzgecDLQe7wHIW+5pygGf0bQIjZX+QfyVSiD8Cbc8hPlDfAV49+36UswnkZDt4uAEWSg7zhbpd4LpkvbMs1AIicAqclBxIavslawvLQi4g7t8C238Mdofvt4DP/7aAzNMCnoDUMZxcVuvAe4jhhSNkAvlMrktOfVkVLRtjAdGbdcmpL6sqFhDNIXCYiV/ifT/UsZnmiZWAaOSX3CKeu4D6sqoqAdFdzcRfYrgf60cca9aZvDGP0FwWsQXmYnOBiCVgCZAO2BEiDaTbLQHaQpLAEiANpNtrn8A3G08lMSId4a0AAAAASUVORK5CYII=');
					background-size: 32px 32px;
					background-repeat: no-repeat;
					background-position: 98.5% center;
				}
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
