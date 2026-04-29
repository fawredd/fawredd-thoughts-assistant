"use client"
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { useState } from 'react';
import { Button } from './ui/button';

export function InstallButton() {
    const { isInstallable, install, isIOS } = useInstallPrompt();
    const [showIOSInstructions, setShowIOSInstructions] = useState(false);

    if (isInstallable) {
        return (
            <Button onClick={install} variant="link" size="xs">
                📲 Instalar app
            </Button>
        );
    }

    if (isIOS) {
        return (
            <>
                <Button onClick={() => setShowIOSInstructions(true)} variant="link" size="xs">
                    📲 Instalar app
                </Button>

                {showIOSInstructions && (
                    <div>
                        <p>Para instalar en tu iPhone:</p>
                        <ol>
                            <li>Tocá el ícono de compartir ↑</li>
                            <li>Seleccioná &quot;Agregar a pantalla de inicio&quot;</li>
                        </ol>
                        <Button onClick={() => setShowIOSInstructions(false)} variant="link" size="xs">
                            Cerrar
                        </Button>
                    </div>
                )}
            </>
        );
    }

    return null;
}