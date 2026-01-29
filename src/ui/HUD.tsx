import React from 'react';
import { Controls } from './Controls';
import { InfoPanel } from './InfoPanel';

export const HUD: React.FC = () => {
    return (
        <div className="absolute inset-0 pointer-events-none z-20">
            {/* Enable pointer events only for the children panels */}
            <div className="w-full h-full pointer-events-auto">
                <Controls />
                <InfoPanel />
            </div>
        </div>
    );
};
