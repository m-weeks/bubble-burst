import { GameState } from "../types";
const HUD = ({ gameState } : { gameState: GameState }) => {
    return (
        <>
            {
                gameState.score && (
                    <div style={{ position: 'fixed', zIndex: 2, top: '25px', left: '50%', transform: 'translateX(-50%)', color: 'white', fontSize: '36px' }} className="stroke">
                        Net Worth: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(gameState.score)}
                    </div>
                )
                
            }

            {
                !gameState.score && (
                    <div style={{ fontSize: '48px', position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', zIndex: 4, color: 'white' }}>
                        <img src="/logo.png" style={{ width: '200px' }} />
                        BANKRUPT
                        <div style={{ marginTop: '20px' }}>
                            <button className='startButton' onClick={() => window.location.reload()}>
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