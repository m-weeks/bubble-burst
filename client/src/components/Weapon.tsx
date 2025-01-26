import { useEffect, useState } from 'react'
import idle from '../components/assets/fists/fists.png'
import punch1 from '../components/assets/fists/left-punch.png'
import punch2 from '../components/assets/fists/right-punch.png'

export default function Weapon({ curClientId }: { curClientId: string }) {
  const [image, setImage] = useState(idle);

  useEffect(() => {
    let timeouts: number[] = [];
    const handleFire = (event: CustomEvent) => {
      if (event.detail.clientId !== curClientId) {
        return
      }
      
      setImage(Math.random() < 0.5 ? punch1 : punch2);
      timeouts.push(setTimeout(() => {
        setImage(idle);
      }, 250));
    }
    // @ts-ignore
    window.addEventListener('fire', handleFire);

    return () => {
      // @ts-ignore
      window.removeEventListener('fire', handleFire);
      timeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, [curClientId]);


  return (
    <>
      {/* Load images beforehand so they are ready for use (Otherwise they may not load in production) */}
      <div style={{ position: 'absolute', width: 0, height: 0, top: 0, left: 0, overflow: 'hidden'}}>
        <img src={idle} />
        <img src={punch1} />
        <img src={punch2} />
      </div>
      <img
        src={image}
        style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)' }}
      />
    </>
  )
}