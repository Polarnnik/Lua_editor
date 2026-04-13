import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { PinType, PIN_COLORS } from '../types';

export interface Pin {
  id: string;
  label: string;
  type: PinType;
}

export interface BaseNodeProps {
  title: string;
  color?: string;
  inputs?: Pin[];
  outputs?: Pin[];
  selected?: boolean;
  children?: React.ReactNode;
}

export function BaseNode({ title, color = '#3b82f6', inputs = [], outputs = [], selected, children }: BaseNodeProps) {
  return (
    <div className={`flex flex-col min-w-[160px] bg-white rounded-xl shadow-xl border-2 overflow-hidden transition-colors ${selected ? 'border-yellow-500' : 'border-zinc-300'}`}>
      {/* Header */}
      <div className="px-3 py-1.5 text-sm font-semibold text-white flex items-center shadow-sm" style={{ backgroundColor: color }}>
        {title}
      </div>

      {/* Body */}
      <div className="flex flex-col p-2 gap-2 relative">
        {/* Inputs */}
        <div className="flex flex-col gap-1.5">
          {inputs.map((pin) => (
            <div key={pin.id} className="flex items-center gap-2 relative h-5">
              <Handle
                type="target"
                position={Position.Left}
                id={pin.id}
                className={`!w-3.5 !h-3.5 !border-2 !border-white ${pin.type === 'exec' ? '!rounded-sm' : '!rounded-full'}`}
                style={{ backgroundColor: PIN_COLORS[pin.type], left: -15, top: '50%', transform: 'translateY(-50%)' }}
              />
              <span className="text-xs text-zinc-700 ml-1 font-mono">{pin.label}</span>
            </div>
          ))}
        </div>

        {/* Custom Content */}
        {children && <div className="py-1 flex flex-col gap-1">{children}</div>}

        {/* Outputs */}
        <div className="flex flex-col gap-1.5 items-end">
          {outputs.map((pin) => (
            <div key={pin.id} className="flex items-center justify-end gap-2 relative h-5 w-full">
              <span className="text-xs text-zinc-700 mr-1 font-mono">{pin.label}</span>
              <Handle
                type="source"
                position={Position.Right}
                id={pin.id}
                className={`!w-3.5 !h-3.5 !border-2 !border-white ${pin.type === 'exec' ? '!rounded-sm' : '!rounded-full'}`}
                style={{ backgroundColor: PIN_COLORS[pin.type], right: -15, top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
