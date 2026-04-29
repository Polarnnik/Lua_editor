import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { PinType } from '../types';
import { useEditorTheme } from '../core/ThemeContext';

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

export function BaseNode({
  title,
  color = '#3b82f6',
  inputs = [],
  outputs = [],
  selected,
  children,
}: BaseNodeProps) {
  const theme = useEditorTheme();

  return (
    <div
      style={{
        background: 'var(--ve-node-bg)',
        border: `2px solid ${selected ? 'var(--ve-node-border-sel)' : 'var(--ve-node-border)'}`,
        borderRadius: 'var(--ve-node-radius)',
        boxShadow: 'var(--ve-node-shadow)',
        minWidth: 160,
        overflow: 'hidden',
        transition: 'border-color 0.15s',
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: color,
          borderRadius:
            'calc(var(--ve-node-radius) - 2px) calc(var(--ve-node-radius) - 2px) 0 0',
        }}
        className="px-3 py-1.5 text-sm font-semibold text-white flex items-center"
      >
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
                style={{
                  width: 14,
                  height: 14,
                  border: '2px solid var(--ve-node-bg)',
                  borderRadius: pin.type === 'exec' ? 2 : '50%',
                  backgroundColor: theme.pinColors[pin.type],
                  left: -15,
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              />
              <span
                style={{ color: 'var(--ve-node-text)' }}
                className="text-xs ml-1 font-mono"
              >
                {pin.label}
              </span>
            </div>
          ))}
        </div>

        {children && <div className="py-1 flex flex-col gap-1">{children}</div>}

        {/* Outputs */}
        <div className="flex flex-col gap-1.5 items-end">
          {outputs.map((pin) => (
            <div
              key={pin.id}
              className="flex items-center justify-end gap-2 relative h-5 w-full"
            >
              <span
                style={{ color: 'var(--ve-node-text)' }}
                className="text-xs mr-1 font-mono"
              >
                {pin.label}
              </span>
              <Handle
                type="source"
                position={Position.Right}
                id={pin.id}
                style={{
                  width: 14,
                  height: 14,
                  border: '2px solid var(--ve-node-bg)',
                  borderRadius: pin.type === 'exec' ? 2 : '50%',
                  backgroundColor: theme.pinColors[pin.type],
                  right: -15,
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
