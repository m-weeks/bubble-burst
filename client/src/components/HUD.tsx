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

            {
                !gameState.score && (
                    <div style={{ fontSize: '48px', position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', zIndex: 4, color: 'white' }}>
                        <div>
                            <img src="/logo.png" style={{ width: '200px' }} />
                        </div>
                        Game Over!
                        <div style={{ marginTop: '20px' }}>
                            <button style={{ fontSize: '32px', backgroundColor: 'white', padding: '20px', borderRadius: '15px' }} onClick={() => window.location.reload()}>
                                Play Again
                            </button>
                        </div>
                    </div>
                )
            }
        </>
    )
}

export default HUD;