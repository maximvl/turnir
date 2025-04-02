import React from 'react'
import { ActionLogEntry } from '../types'
import './ActionLog.css' // We'll create this CSS file

interface ActionLogProps {
  logEntries: ActionLogEntry[]
}

const ActionLog: React.FC<ActionLogProps> = ({ logEntries }) => {
  return (
    <div className="action-log">
      <h3>Лог действий</h3>
      <div className="log-entries">
        {logEntries.map((entry) => (
          <div key={entry.id} className="log-entry">
            <span className="log-timestamp">[{entry.timestamp}]</span>
            <span className="log-message">{entry.message}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ActionLog
