import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

// --- Threat Map Mock ---
export const GlobalThreatMap = () => {
    return (
        <div className="w-full h-full relative overflow-hidden bg-black/50">
            {/* Grid overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
            
            {/* World Map Outline (Simplified SVG) */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
                <svg viewBox="0 0 1000 500" className="w-full h-full fill-white">
                    <path d="M150,150 Q200,50 400,100 T700,150 T900,100 V300 H100 Z" /> 
                    {/* Abstract continent shapes for visual feel */}
                </svg>
            </div>

            {/* Active Pings */}
            {[...Array(8)].map((_, i) => (
                <div 
                    key={i}
                    className="absolute w-2 h-2"
                    style={{
                        top: `${20 + Math.random() * 60}%`,
                        left: `${10 + Math.random() * 80}%`,
                    }}
                >
                    <div className="absolute inset-0 bg-exi-primary rounded-full animate-ping opacity-75"></div>
                    <div className="absolute inset-0 bg-white rounded-full w-1 h-1 m-0.5"></div>
                    {/* Connection Line */}
                    <div 
                        className="absolute top-1 left-1 h-[1px] bg-gradient-to-r from-exi-primary to-transparent origin-left animate-pulse" 
                        style={{ width: '100px', transform: `rotate(${Math.random() * 360}deg)` }}
                    ></div>
                </div>
            ))}

            <div className="absolute bottom-4 left-4 text-[10px] font-mono text-gray-400">
                Tracking Active Incursions...
            </div>
        </div>
    );
};

// --- System Load Chart ---
const data = Array.from({ length: 20 }, (_, i) => ({
    name: i,
    cpu: 20 + Math.random() * 30,
    net: 40 + Math.random() * 40
}));

export const SystemLoadWidget = () => (
    <div className="w-full h-full flex flex-col">
        <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-mono text-gray-500 uppercase">System Load (Real-time)</span>
            <span className="text-[10px] font-mono text-exi-primary">LIVE</span>
        </div>
        <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#E60000" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#E60000" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis dataKey="name" hide />
                    <YAxis hide domain={[0, 100]} />
                    <Area type="monotone" dataKey="cpu" stroke="#E60000" strokeWidth={2} fillOpacity={1} fill="url(#colorCpu)" isAnimationActive={false} />
                    <Area type="monotone" dataKey="net" stroke="#555" strokeWidth={1} fill="transparent" strokeDasharray="5 5" isAnimationActive={false} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    </div>
);

// --- Rolling Logs ---
const logEntries = [
    "INIT_SEQUENCE_STARTED",
    "CONNECTING_TO_TOR_RELAY_04...",
    "HANDSHAKE_SUCCESSFUL [24ms]",
    "DECRYPTING_PACKET_HEADER",
    "WARNING: HIGH_LATENCY_DETECTED_NODE_7",
    "BUFFER_OVERFLOW_PREVENTED",
    "SYNCING_LOCAL_DB_WITH_MASTER",
    "WATCHDOG_TIMER_RESET"
];

export const LogStreamWidget = () => {
    const [logs, setLogs] = useState<string[]>(logEntries);

    useEffect(() => {
        const interval = setInterval(() => {
            const newLog = `EVENT_${Math.floor(Math.random() * 9999)}: ${Math.random() > 0.5 ? 'OK' : 'PENDING'}`;
            setLogs(prev => [...prev.slice(1), newLog]);
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="font-mono text-[10px] space-y-1 text-gray-400 overflow-hidden h-full flex flex-col justify-end">
            {logs.map((log, i) => (
                <div key={i} className="flex gap-2">
                    <span className="text-gray-600">[{new Date().toLocaleTimeString()}]</span>
                    <span className={log.includes('WARNING') ? 'text-yellow-500' : 'text-gray-300'}>{log}</span>
                </div>
            ))}
        </div>
    );
};