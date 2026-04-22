import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { useState } from 'react';

export default function InstallButton() {
    const { isInstallable, install, isIOS, isInstalled } = useInstallPrompt();
    const [showIOSInstructions, setShowIOSInstructions] = useState(false);


    {/* Android/Chrome — prompt nativo */ }
    {
        isInstallable && (
            <button onClick={install}>
                📲 Instalar app
            </button>
        )
    }

    {/* iOS — instrucciones manuales */ }
    {
        isIOS && !isInstallable && (
            <>
                <button onClick={() => setShowIOSInstructions(true)}>
                    📲 Instalar app
                </button>

                {showIOSInstructions && (
                    <div>
                        <p>Para instalar en tu iPhone:</p>
                        <ol>
                            <li>Tocá el ícono de compartir ↑</li>
                            <li>Seleccioná "Agregar a pantalla de inicio"</li>
                        </ol>
                        <button onClick={() => setShowIOSInstructions(false)}>
                            Cerrar
                        </button>
                    </div>
                )}
            </>
        )
    }
}