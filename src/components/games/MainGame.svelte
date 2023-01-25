<script lang="ts">
	import { dogBreeds } from '../../stores/dogs';
    import api from "../../lib/api";
	import type { GameController } from './types';

	export let started: boolean = false;

    const KEYBOARD = [
        "QWERTYUIOP",
        "ASDFGHJKL",
        "ZXCVBNM",
        " "
    ]

    let breedImages:string[] = [];
    let currentBreedName:string = "";
    let currentBreedNameArray:any[] = [];
    let enteredChars = "";

    function processBreedName() {
        currentBreedNameArray = currentBreedName.split("").map(c => ({
            char: c,
            visible: false
        }))
    }

    function loadBreedInfo() {
        const breeds = $dogBreeds;
        const breedKeys = Object.keys(breeds);

        const idx = Math.floor(Math.random() * breedKeys.length);
        const breedName = breedKeys[idx];
        let subBreedName = "";

        if (breeds[breedName].length > 0) {
            subBreedName = breeds[breedName][Math.floor(Math.random() * breeds[breedName].length)];
        }

        const url = subBreedName == "" ? `breed/${breedName}/images/random/3` : `breed/${breedName}/${subBreedName}/images/random/3`;
        console.log(url);
        api.dogApi.get(url).then(response => {
            const { message } = response.data;
            breedImages = message;
            currentBreedName = breedName + (subBreedName ? " " + subBreedName : "");
            processBreedName();
            started = true;
        }).catch(error => {
            alert("Unable to start game! " + error.message);
        })
        
    }

    function checkGame() {
        let totalCorrect = 0;
        console.log(currentBreedName, enteredChars, currentBreedName.toLowerCase() == enteredChars.toLowerCase());

        currentBreedNameArray = currentBreedNameArray.map((item, i) => {
            const cInput = enteredChars[i];
            if (item.char.toLowerCase() == cInput.toLowerCase()) {
                item.visible = true;
                totalCorrect++;
            }

            return item;
        });

        if (totalCorrect >= currentBreedName.length) {
            gameController.end(true);
        }
    };

    function handleKeyPress(e:KeyboardEvent) {
        console.log(e.key);
    }

	export const gameController: GameController = {
		start() {
            document.body.addEventListener("keypress", handleKeyPress);
            loadBreedInfo();
        },
		pause() {},
		end(win:boolean) {
            if (win) {
                alert("You're correct!");
            } else {
                alert("Try again...");
            }
            document.body.removeEventListener("keypress", handleKeyPress);
        }
	};
</script>

<div class="guess-the-doggo-container">
	{#if started}
		<div class="dog-pics">
            {#each breedImages as img, i (i)}
                <img src={img} alt="Dog image number {i + 1}" class="dog-pic">
            {/each}
        </div>
        <div class="dog-name">
            {#each currentBreedNameArray as item, i (i)}
                <div class="letter">
                    {item.visible ? item.char : ""}
                </div>
            {/each}
        </div>
        <div class="entered-chars p-4 text-2xl uppercase text-center">
            {enteredChars}
        </div>
        <div class="keyboard">
            <button class="key" on:click={() => enteredChars = ""}>
                Clear All
            </button>
            {#each KEYBOARD as rows, y (y)}
                <div class="row">
                    {#each rows.split("") as char, x (x)}
                    <button class="key char" on:click={() => {
                        if (enteredChars.length < currentBreedName.length) {
                            enteredChars += char;
                        }
                    }}>
                        {char == " " ? "SPACE" : char}
                    </button>
                {/each}
                </div>
            {/each}
        </div>
        <button class="start-btn bg-blue-400 text-white border-blue-700 rounded-lg py-2 px-10 w-full mt-4" on:click={checkGame}>
            Check
        </button>
	{:else}
		<div class="greet-screen p-4">
			<h3 class="text-3xl text-center mt-16 uppercase greet-h3">Guess The Doggo</h3>
			<button class="start-btn bg-green-600 text-white border-green-700 rounded-lg" on:click={() => gameController.start()}> Start </button>
		</div>
	{/if}
</div>

<style lang="scss">
	.guess-the-doggo-container {
		min-height: 300px;
        padding: 1rem;

        .keyboard {
            display: flex;
            flex-direction: column;

            .row {
                display: flex;
            }

            .key {
                flex: 1;
                padding: 0.5rem;
                border: 1px solid darkblue;
                background-color: lightblue;
            }
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
                background-color: blanchedalmond;
                border: 3px solid burlywood;
                border-radius: 0.5rem;
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
