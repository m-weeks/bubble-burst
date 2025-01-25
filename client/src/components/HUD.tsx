import { GameState } from "../types";
const HUD = ({ gameState } : { gameState: GameState }) => {
    return (
        <>
            {
                gameState.score && (
                    <div style={{ position: 'fixed', zIndex: 2, top: '25px', right: '25px', color: 'white', fontSize: '12px' }} className="stroke">
                        Net Worth: {gameState.score}
                    </div>
                )
            }
        </>
    )
}

export default HUD;