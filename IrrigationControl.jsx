import React, { useState, useEffect } from 'react';
import FirebaseService from '../services/firebase-service';

const IrrigationControl = () => {
  const [isIrrigating, setIsIrrigating] = useState(false);
  const [duration, setDuration] = useState(10); // minutes
  const [threshold, setThreshold] = useState(30); // soil moisture percentage
  const [autoMode, setAutoMode] = useState(true);
  const [lastIrrigation, setLastIrrigation] = useState(null);

  useEffect(() => {
    // Listen for irrigation status updates
    FirebaseService.getIrrigationHistory((history) => {
      if (history.length > 0) {
        const latest = history[history.length - 1];
        setLastIrrigation(latest);
        setIsIrrigating(latest.status === 'active');
      }
    });
  }, []);

  const handleManualIrrigation = async () => {
    try {
      const command = {
        type: 'manual',
        duration: duration,
        status: 'start'
      };

      const result = await FirebaseService.sendIrrigationCommand(command);
      if (result.success) {
        setIsIrrigating(true);
        alert('Irrigation started successfully!');
      }
    } catch (error) {
      alert('Failed to start irrigation');
    }
  };

  const handleStopIrrigation = async () => {
    try {
      const command = {
        type: 'stop',
        status: 'stop'
      };

      const result = await FirebaseService.sendIrrigationCommand(command);
      if (result.success) {
        setIsIrrigating(false);
        alert('Irrigation stopped successfully!');
      }
    } catch (error) {
      alert('Failed to stop irrigation');
    }
  };

  const updateAutoSettings = async () => {
    try {
      const settings = {
        type: 'auto_settings',
        threshold: threshold,
        enabled: autoMode
      };

      await FirebaseService.sendIrrigationCommand(settings);
      alert('Auto irrigation settings updated!');
    } catch (error) {
      alert('Failed to update settings');
    }
  };

  return (
    <div className="irrigation-control">
      <h3>💧 Irrigation Control</h3>

      {/* Manual Control */}
      <div className="manual-control">
        <h4>Manual Control</h4>
        <div className="control-group">
          <label>
            Duration (minutes):
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              min="1"
              max="60"
            />
          </label>
        </div>

        <div className="control-buttons">
          {!isIrrigating ? (
            <button
              onClick={handleManualIrrigation}
              className="start-btn"
            >
              🚿 Start Irrigation
            </button>
          ) : (
            <button
              onClick={handleStopIrrigation}
              className="stop-btn"
            >
              🛑 Stop Irrigation
            </button>
          )}
        </div>
      </div>

      {/* Auto Control */}
      <div className="auto-control">
        <h4>Automatic Control</h4>
        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={autoMode}
              onChange={(e) => setAutoMode(e.target.checked)}
            />
            Enable Auto Irrigation
          </label>
        </div>

        <div className="control-group">
          <label>
            Moisture Threshold (%):
            <input
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(parseInt(e.target.value))}
              min="0"
              max="100"
              disabled={!autoMode}
            />
          </label>
        </div>

        <button
          onClick={updateAutoSettings}
          className="update-btn"
          disabled={!autoMode}
        >
          Update Settings
        </button>
      </div>

      {/* Status */}
      <div className="irrigation-status">
        <h4>Status</h4>
        <p>Current Status: <strong>{isIrrigating ? 'Active' : 'Inactive'}</strong></p>
        {lastIrrigation && (
          <p>Last Irrigation: {new Date(lastIrrigation.timestamp).toLocaleString()}</p>
        )}
      </div>
    </div>
  );
};

export default IrrigationControl;