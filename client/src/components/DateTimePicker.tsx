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
        setMinute(m.slice(0, 2));
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
    <div className="dt-picker-root">
      <div className="dt-date-container">
        <Calendar size={15} className="dt-icon" />
        <input 
          type="date" 
          required={required}
          value={dateStr}
          onChange={(e) => {
            setDateStr(e.target.value);
            triggerChange(e.target.value, hour, minute, ampm);
          }}
          className="dt-date-input"
        />
      </div>
      
      <div className="dt-time-container">
        <div className="dt-time-grid">
          <Clock size={15} className="dt-icon-fixed" />
          
          <select 
            value={hour} 
            onChange={e => {
              setHour(e.target.value);
              triggerChange(dateStr, e.target.value, minute, ampm);
            }}
            className="dt-select"
          >
            {Array.from({length: 12}, (_, i) => {
              const val = (i + 1).toString().padStart(2, '0');
              return <option key={val} value={val}>{val}</option>
            })}
          </select>
          
          <span className="dt-sep">:</span>
          
          <select 
            value={minute} 
            onChange={e => {
              setMinute(e.target.value);
              triggerChange(dateStr, hour, e.target.value, ampm);
            }}
            className="dt-select"
          >
            {['00', '15', '30', '45'].map((val) => (
              <option key={val} value={val}>{val}</option>
            ))}
            <option disabled>──</option>
            {Array.from({length: 60}, (_, i) => {
              const val = i.toString().padStart(2, '0');
              if (['00', '15', '30', '45'].includes(val)) return null;
              return <option key={val} value={val}>{val}</option>
            })}
          </select>

          <div className="dt-ampm-toggle">
            <button 
              type="button" 
              className={ampm === 'AM' ? 'active' : ''} 
              onClick={() => { setAmpm('AM'); triggerChange(dateStr, hour, minute, 'AM'); }}
            >AM</button>
            <button 
              type="button" 
              className={ampm === 'PM' ? 'active' : ''} 
              onClick={() => { setAmpm('PM'); triggerChange(dateStr, hour, minute, 'PM'); }}
            >PM</button>
          </div>
        </div>
      </div>

      <style>{`
        .dt-picker-root {
          display: flex;
          gap: 1rem;
          width: 100%;
          align-items: stretch;
          box-sizing: border-box;
        }

        .dt-date-container {
          position: relative;
          flex: 1;
          min-width: 160px;
          box-sizing: border-box;
        }

        .dt-date-input {
          width: 100%;
          height: 100%;
          padding: 0.75rem 0.75rem 0.75rem 2.5rem;
          border-radius: 0.85rem;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(15, 23, 42, 0.4);
          color: #f8fafc;
          font-size: 0.95rem;
          font-weight: 600;
          outline: none;
          transition: all 0.3s ease;
          color-scheme: dark;
          cursor: pointer;
          box-sizing: border-box;
        }

        /* Make entire input clickable for calendar and hide default icon */
        .dt-date-input::-webkit-calendar-picker-indicator {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
          cursor: pointer;
          opacity: 0;
        }

        .dt-date-input:focus {
          border-color: var(--color-primary);
          background: rgba(15, 23, 42, 0.6);
          box-shadow: 0 0 0 4px var(--color-primary-glow);
        }

        .dt-icon {
          position: absolute;
          left: 1.25rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-primary);
          pointer-events: none;
          z-index: 10;
          opacity: 0.8;
        }

        .dt-time-container {
          flex: 1.3;
          min-width: 240px;
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 0.85rem;
          padding: 0 0.75rem 0 1.25rem;
          display: flex;
          align-items: center;
          transition: all 0.3s ease;
          box-sizing: border-box;
          max-width: 100%;
        }
        
        .dt-time-container:focus-within {
          border-color: var(--color-primary);
          background: rgba(15, 23, 42, 0.6);
          box-shadow: 0 0 0 4px var(--color-primary-glow);
        }

        .dt-time-grid {
          display: flex;
          align-items: center;
          width: 100%;
          box-sizing: border-box;
        }

        .dt-icon-fixed {
          color: var(--color-primary);
          margin-right: 0.75rem;
          flex-shrink: 0;
          opacity: 0.8;
        }

        .dt-select {
          background: transparent;
          border: none;
          color: #f8fafc;
          font-size: 1.15rem;
          font-weight: 800;
          padding: 0.75rem 0;
          outline: none;
          cursor: pointer;
          appearance: none;
          text-align: center;
          width: 2.2rem;
          transition: all 0.2s;
          font-family: inherit;
        }
        
        .dt-select:hover {
          color: var(--color-primary);
          transform: scale(1.1);
        }

        .dt-select option {
          background: #0f172a;
          color: white;
          padding: 12px;
          font-size: 1rem;
        }

        .dt-sep {
          color: #475569;
          font-weight: 900;
          font-size: 1.15rem;
          margin: 0 0.15rem;
          opacity: 0.5;
        }

        .dt-ampm-toggle {
          display: flex;
          background: rgba(15, 23, 42, 0.8);
          padding: 4px;
          border-radius: 10px;
          margin-left: auto;
          border: 1px solid rgba(255, 255, 255, 0.1);
          flex-shrink: 0;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
          box-sizing: border-box;
        }

        .dt-ampm-toggle button {
          border: none;
          background: transparent;
          color: #64748b;
          font-size: 0.7rem;
          font-weight: 900;
          padding: 0.45rem 0.85rem;
          border-radius: 7px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .dt-ampm-toggle button.active {
          background: linear-gradient(135deg, var(--color-primary) 0%, #7c3aed 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
        }

        @media (max-width: 640px) {
          .dt-picker-root { flex-direction: column; gap: 0.75rem; width: 100%; }
          .dt-time-container { min-width: 0; width: 100%; max-width: 100%; margin-left: 0; padding: 0 0.5rem 0 0.75rem; box-sizing: border-box; }
          .dt-ampm-toggle { margin-left: auto; flex-shrink: 0; }
          .dt-time-grid { justify-content: flex-start; width: 100%; max-width: 100%; }
          .dt-select { font-size: 1rem; width: 1.8rem; }
          .dt-ampm-toggle button { padding: 0.35rem 0.65rem; font-size: 0.65rem; }
          .dt-icon-fixed { margin-right: 0.4rem; }
        }
      `}</style>
    </div>
  );
};

export default DateTimePicker;
