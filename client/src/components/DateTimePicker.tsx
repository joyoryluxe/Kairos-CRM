import React, { useState, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';

interface DateTimePickerProps {
  value: string; // Expected format: 'YYYY-MM-DDTHH:mm' (local time)
  onChange: (value: string) => void;
  required?: boolean;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({ value, onChange, required }) => {
  const [dateStr, setDateStr] = useState('');
  const [hour, setHour] = useState('12');
  const [minute, setMinute] = useState('00');
  const [ampm, setAmpm] = useState('AM');

  useEffect(() => {
    if (value) {
      const [d, t] = value.split('T');
      setDateStr(d || '');
      if (t) {
        const [hStr, mStr] = t.split(':');
        let h = parseInt(hStr, 10);
        const m = mStr || '00';
        const isPm = h >= 12;
        if (h === 0) h = 12;
        if (h > 12) h -= 12;
        
        setHour(h.toString().padStart(2, '0'));
        setMinute(m.slice(0, 2)); // Ensure it's just mm
        setAmpm(isPm ? 'PM' : 'AM');
      }
    } else {
      setDateStr('');
      setHour('12');
      setMinute('00');
      setAmpm('AM');
    }
  }, [value]);

  const triggerChange = (newDate: string, newHour: string, newMinute: string, newAmpm: string) => {
    if (!newDate) {
      onChange('');
      return;
    }
    let h = parseInt(newHour, 10);
    if (newAmpm === 'PM' && h !== 12) h += 12;
    if (newAmpm === 'AM' && h === 12) h = 0;
    
    const hStr = h.toString().padStart(2, '0');
    const mStr = newMinute.padStart(2, '0');
    onChange(`${newDate}T${hStr}:${mStr}`);
  };

  return (
    <div className="datetime-picker-wrapper">
      <div className="date-input-container">
        <Calendar size={16} className="icon" />
        <input 
          type="date" 
          required={required}
          value={dateStr}
          onChange={(e) => {
            setDateStr(e.target.value);
            triggerChange(e.target.value, hour, minute, ampm);
          }}
          className="premium-input date-input"
        />
      </div>
      
      <div className="time-select-container">
        <Clock size={16} className="icon" style={{ marginRight: '4px' }} />
        
        <div className="select-wrapper">
          <select 
            value={hour} 
            onChange={e => {
              setHour(e.target.value);
              triggerChange(dateStr, e.target.value, minute, ampm);
            }}
            className="premium-select"
          >
            {Array.from({length: 12}, (_, i) => {
              const val = (i + 1).toString().padStart(2, '0');
              return <option key={val} value={val}>{val}</option>
            })}
          </select>
        </div>
        
        <span className="colon">:</span>
        
        <div className="select-wrapper">
          <select 
            value={minute} 
            onChange={e => {
              setMinute(e.target.value);
              triggerChange(dateStr, hour, e.target.value, ampm);
            }}
            className="premium-select"
          >
            {['00', '15', '30', '45'].map((val) => (
              <option key={val} value={val}>{val}</option>
            ))}
            <option disabled>---</option>
            {Array.from({length: 60}, (_, i) => {
              const val = i.toString().padStart(2, '0');
              if (['00', '15', '30', '45'].includes(val)) return null;
              return <option key={val} value={val}>{val}</option>
            })}
          </select>
        </div>
        
        <div className="divider" />
        
        <div className="select-wrapper ampm-wrapper">
          <select 
            value={ampm} 
            onChange={e => {
              setAmpm(e.target.value);
              triggerChange(dateStr, hour, minute, e.target.value);
            }}
            className="premium-select ampm-select"
          >
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </div>
      </div>

      <style>{`
        .datetime-picker-wrapper {
          display: flex;
          gap: 0.75rem;
          width: 100%;
          flex-wrap: wrap;
        }

        .date-input-container {
          position: relative;
          flex: 1 1 180px;
        }

        .time-select-container {
          display: flex;
          align-items: center;
          background: var(--bg-surface-3);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 0.6rem 0.8rem;
          flex: 1 1 200px;
          transition: all 0.3s ease;
        }

        .time-select-container:focus-within {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px var(--color-primary-glow);
        }

        .icon {
          color: var(--text-muted);
          flex-shrink: 0;
        }

        .date-input-container .icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
        }

        .premium-input.date-input {
          width: 100%;
          padding: 0.8rem 0.8rem 0.8rem 40px;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: var(--bg-surface-3);
          color: var(--text-primary);
          font-size: 0.95rem;
          outline: none;
          transition: all 0.3s ease;
          color-scheme: dark;
        }

        .premium-input.date-input:focus {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px var(--color-primary-glow);
        }

        .select-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          background: var(--bg-surface-2);
          border-radius: 8px;
          border: 1px solid transparent;
          transition: all 0.2s ease;
        }

        .select-wrapper:hover {
          background: var(--bg-surface);
          border-color: var(--border);
        }

        .select-wrapper:focus-within {
          border-color: var(--color-primary);
        }

        .premium-select {
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-primary);
          cursor: pointer;
          padding: 0.4rem 0.6rem;
          font-size: 0.95rem;
          font-weight: 600;
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          text-align: center;
        }

        .premium-select option {
          background: var(--bg-surface-2);
          color: var(--text-primary);
        }

        .colon {
          color: var(--text-muted);
          font-weight: 800;
          margin: 0 4px;
        }

        .divider {
          width: 1px;
          height: 24px;
          background: var(--border);
          margin: 0 0.6rem;
        }

        .ampm-wrapper {
          background: rgba(124, 58, 237, 0.1);
          border: 1px solid rgba(124, 58, 237, 0.2);
        }
        
        .ampm-wrapper:hover {
          background: rgba(124, 58, 237, 0.2);
          border-color: rgba(124, 58, 237, 0.4);
        }

        .ampm-select {
          color: var(--color-primary);
          font-weight: 800;
        }

        @media (max-width: 500px) {
          .datetime-picker-wrapper {
            flex-direction: column;
            gap: 0.5rem;
          }
          .time-select-container {
            justify-content: center;
            gap: 0.25rem;
          }
          .premium-select {
            padding: 0.5rem 0.6rem;
          }
        }
      `}</style>
    </div>
  );
};

export default DateTimePicker;
