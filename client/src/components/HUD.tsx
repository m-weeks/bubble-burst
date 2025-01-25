import { GameData, GameState, LocalState } from "../types";
import shellImage from './assets/shell.png'
import Ellipsis from "./Ellipsis";

const HUD = ({ localState, gameState, sendMessage } : { localState: LocalState, gameState: GameState } & Pick<GameData, 'sendMessage'>) => {
    const { player } = localState;


    const won = gameState.winner === localState.clientId;
    const handleRematchClick = () => {
        sendMessage('REMATCH', null);
    }

    return (
        <>
            {
                (gameState.reloadTimer) && (
                    <div style={{ position: 'fixed', zIndex: 2, top: '25px', width: '100%', color: 'white', textAlign: 'center', fontSize: '12px' }} className="stroke">
                        <div style={{ marginBottom: '4px' }}>
                            Reloading in<Ellipsis/>
                        </div>
                        <div style={{ fontSize: '32px' }}>
                            {gameState.reloadTimer}
                        </div>
                    </div>
                )
            }
            <div style={{ position: 'fixed', zIndex: 2, top: '25px', left: '25px', display: 'flex', alignItems: 'center', height: 20 }}>
                <div style={{ position: 'relative', width: 100, marginRight: '5px', height: 20 }}>
                    <div style={{ backgroundColor: 'red', width: 100, height: 12, position: 'absolute', top: 5 }}>
                    </div>
                    <div style={{ backgroundColor: 'green', width: Math.max(player?.health ?? 100, 0), height: 12, position: 'absolute',  top: 5 }}>
                    </div>
                </div>
                <div>
                    {
                        Array.from(new Array(player.ammo)).map((_, i) => (
                            <img
                                key={i}
                                src={shellImage}
                                style={{ height: '20px', marginRight: '5px' }}
                            />
                        ))
                    }
                </div>
            </div>
            {
                gameState.winner && (
                    <div style={{ fontSize: '48px', position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', zIndex: 4, color: 'white' }}>
                        <div>
                            <img src="/logo.png" style={{ width: '200px' }} />
                        </div>
                        {won ? 'You win!' : 'You lose!'}
                        <div style={{ marginTop: '20px' }}>
                            <button style={{ fontSize: '32px', backgroundColor: 'white', padding: '20px', borderRadius: '15px' }} onClick={handleRematchClick}>
                                {won ? 'BRING ME ANOTHER' : 'TRY AGAIN'}
                                
                            </button>
                        </div>
                    </div>
                )
            }
            {
                player.score && (
                    <div style={{ position: 'fixed', zIndex: 2, top: '25px', right: '25px', color: 'white', fontSize: '12px' }} className="stroke">
                        Score: {player.score}
                    </div>
                )
            }
        </>
    )
}

export default HUD;