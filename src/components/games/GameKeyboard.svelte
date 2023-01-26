<script lang="ts">
	import { createEventDispatcher, onMount } from "svelte";

    const dispatch = createEventDispatcher();
    const KEYBOARD = [
        "QWERTYUIOP",
        "ASDFGHJKL",
        "ZXCVBNM",
        " "
    ]

    function handleReset() {
        dispatch("clearall");
        this?.blur();
    }

    function handleDelete() {
        dispatch("deletechar");
        this?.blur();
    }

    function addChar(char:string) {
        dispatch("keypress", { char });
    }

    function handleKeyPress(e:KeyboardEvent) {
        const key = e.key.toLowerCase();
        switch (key) {
            case "escape": {
                handleReset();
                break;
            };
            case "backspace": {
                handleDelete();
                break;
            };
            case "enter": {
                dispatch("submit");
                break;
            };
            default: {
                if ("abcdefghijklmnopqrstuvwxyz 0123456789".includes(key)) {
                    addChar(key);
                }
            };
        }
    }

    onMount(() => {
        window.addEventListener("keyup", handleKeyPress);

        return () => {
            window.removeEventListener("keyup", handleKeyPress);
        }
    })
</script>
<div class="keyboard">
    <div class="row">
        <button class="key" on:click={handleReset} style="flex: 4">
            Clear All
        </button>
        <button class="key" on:click={handleDelete}>
            Delete
        </button>
    </div>
    {#each KEYBOARD as rows, y (y)}
        <div class="row">
            {#each rows.split("") as char, x (x)}
            <button class="key char" on:click={() => { addChar(char); this.blur(); }}>
                {char == " " ? "SPACE" : char}
            </button>
        {/each}
        </div>
    {/each}
</div>
<style lang="scss">
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
</style>