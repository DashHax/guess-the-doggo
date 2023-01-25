<script lang="ts">
	import MainGame from "../../components/games/MainGame.svelte";
	import type { GameController } from "../../components/games/types";

    let gameStates:("newgame"|"playing"|"gameover") = "newgame";
    let controller:GameController;

</script>

<div class="game-container">
    <div class="game">
        <MainGame started={gameStates == "playing"} bind:gameController={controller}/>
    </div>
</div>

<style lang="scss">
    .game {
        width: 95vw;
        max-width: 900px;
        background-color: white;
        border-radius: 0.5rem;
        margin-top: 1rem;
    }

    .game-container {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
        align-items: center;
        background-color: #ccc;
    }
</style>