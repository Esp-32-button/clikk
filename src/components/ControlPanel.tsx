import React, { useState, useEffect } from 'react';
import { Menu, X, Power, Loader2, Unlink, AlertTriangle, Activity, Clock, Settings2, Plus, ArrowRight, RefreshCw } from 'lucide-react';

interface ControlPanelProps {
  userId: string;
  userEmail: string;
}

interface Pair {
  id: string;
  email: string;
  paired_device: string | string[] | null;
  device_name?: string;
  reversed?: string | null;
  angle?: number;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ userId, userEmail }) => {
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPairModal, setShowPairModal] = useState(false);
  const [pairingCode, setPairingCode] = useState('');
  const [pairingEmail, setPairingEmail] = useState('');
  const [isPairing, setIsPairing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userEmail) {
      fetchPairs();
    }
  }, [userEmail]);

  const fetchPairs = async () => {
    try {
      setIsLoading(true);
      // Add cache-buster to prevent stale data
      const url = `https://pp-kcfa.onrender.com/get-devices?email=${encodeURIComponent(userEmail)}&_=${Date.now()}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('Raw API response:', data);

      // Enhanced empty response handling
      const isEmptyResponse = 
        !data ||
        (Array.isArray(data) && data.length === 0) ||
        (data.pairs && Array.isArray(data.pairs) && data.pairs.length === 0) ||
        (typeof data === 'object' && Object.keys(data).length === 0);
  
      if (isEmptyResponse) {
        console.log('Empty response detected');
        setPairs([]);
        setError(null);
        return;
      }
  
      // Unified normalization process
      const normalizeItem = (item: any): Pair[] => {
        if (!item) return [];
        
        const devices = item.paired_device 
          ? Array.isArray(item.paired_device)
            ? item.paired_device
            : [item.paired_device]
          : [];
  
        return devices.map(device => ({
          id: item.id || device.toString(),
          email: item.email || userEmail,
          paired_device: device,
          device_name: item.device_name || `Device ${device}`,
          reversed: item.reversed || 'no',
          angle: item.angle || 90
        }));
      };
  
      let pairsList: Pair[] = [];
  
      // Handle different response structures
      if (Array.isArray(data)) {
        pairsList = data.flatMap(normalizeItem);
      } else if (data.pairs && Array.isArray(data.pairs)) {
        pairsList = data.pairs.flatMap(normalizeItem);
      } else if (data.paired_device) {
        pairsList = normalizeItem(data);
      } else {
        console.warn('Unexpected response structure:', data);
        setPairs([]);
        return;
      }
  
      // Strict filtering
      const validPairs = pairsList.filter(pair => 
        pair?.paired_device && 
        typeof pair.paired_device === 'string' && 
        pair.paired_device.trim() !== ''
      );
  
      console.log('Valid pairs:', validPairs);
      setPairs(validPairs);
      setError(null);
  
    } catch (error) {
      console.error('Fetch error:', error);
      setError('Failed to load devices. Please try again.');
      setPairs([]); // Ensure empty state on error
    } finally {
      setIsLoading(false);
    }
  };
  
  

  const handlePairDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPairing(true);
    setError(null);

    const emailToUse = pairingEmail.trim() || userEmail;
    const code = pairingCode.trim();

    if (!emailToUse) {
      setError('Email is required');
      setIsPairing(false);
      return;
    }

    if (!code) {
      setError('Pairing code is required');
      setIsPairing(false);
      return;
    }

    try {
      const response = await fetch('https://pp-kcfa.onrender.com/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: emailToUse,
          pairingCode: code
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to pair device');
      }
      
      if (data.message === 'Device paired successfully') {
        // Create new pair object from response
        const newPair: Pair = {
          id: data.id || Date.now().toString(),
          email: emailToUse,
          paired_device: data.paired_device || code,
          device_name: data.device_name || null // Add this line
        
        };

        // Check for existing pair with same code
        if (pairs.some(pair => pair.paired_device === newPair.paired_device)) {
          throw new Error('This device is already paired');
        }

        // Add new pair to existing list
        setPairs(prev => [...prev, newPair]);
        
        setShowPairModal(false);
        setPairingCode('');
        setPairingEmail('');
      } else {
        throw new Error(data.message || 'Failed to pair device. Please check the code and try again.');
      }
    } catch (error) {
      console.error('Error pairing device:', error);
      setError(error instanceof Error ? error.message : 'Failed to pair device. Please try again.');
    } finally {
      setIsPairing(false);
    }
  };


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading your devices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-16">
          <div>
            <h1 className="text-5xl font-bold mb-4">Your Devices</h1>
            <p className="text-xl text-gray-600">
              Manage and control your smart switches
            </p>
          </div>
          <button
            onClick={() => setShowPairModal(true)}
            className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 flex items-center gap-3"
          >
            <Plus className="h-5 w-5" />
            Add Device
          </button>
        </div>

        {error && (
          <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-600">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : pairs.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] shadow-2xl card-shadow p-16 text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <Power className="h-10 w-10 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold mb-4">No Devices Paired</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
              Start by pairing your first smart switch to take control of your home
            </p>
            <button
              onClick={() => setShowPairModal(true)}
              className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 flex items-center gap-3 mx-auto"
            >
              <Plus className="h-5 w-5" />
              Pair a Device
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pairs.map((pair) => (
  <DeviceCard
    key={pair.id}
    pair={pair}
    userEmail={userEmail}
    onUnpair={fetchPairs}
    setPairs={setPairs}
  />
))}
            
          </div>
        )}

        {showPairModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-lg flex items-center justify-center p-4 z-50">
            <div className="relative max-w-md w-full">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[2.5rem] blur-3xl opacity-20"></div>
              
              <div className="relative bg-white rounded-[2.5rem] p-12 shadow-2xl card-shadow">
                <button
                  onClick={() => {
                    setShowPairModal(false);
                    setError(null);
                    setPairingCode('');
                    setPairingEmail('');
                  }}
                  className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors duration-300"
                >
                  <X className="h-6 w-6" />
                </button>

                <div className="text-center mb-12">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Settings2 className="h-8 w-8 text-blue-600" />
                  </div>
                  <h2 className="text-3xl font-bold mb-4">Pair New Device</h2>
                  <p className="text-gray-600">
                    Enter the pairing code shown on your device
                  </p>
                </div>

                <form onSubmit={handlePairDevice} className="space-y-8">
                  <div className="space-y-6">
                    

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pairing Code
                      </label>
                      <input
                        type="text"
                        value={pairingCode}
                        onChange={(e) => setPairingCode(e.target.value)}
                        className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-600 focus:ring focus:ring-blue-600/20 transition-all duration-300"
                        placeholder="Enter the code shown on your device"
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="text-red-600 text-sm flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isPairing}
                    className="group w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 font-semibold flex items-center justify-center gap-2"
                  >
                    {isPairing ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Pairing...
                      </>
                    ) : (
                      <>
                        <Settings2 className="h-5 w-5" />
                        Pair Device
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface DeviceCardProps {
  pair: Pair;
  onUnpair: () => void;
  userEmail: string;
  setPairs: React.Dispatch<React.SetStateAction<Pair[]>>;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ pair, onUnpair , userEmail, setPairs }) => {
  const [isOn, setIsOn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUnpairing, setIsUnpairing] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState(
    pair.device_name ? pair.device_name : `Device ${pair.paired_device}`
  );
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  const [currentAngle, setCurrentAngle] = useState(pair.angle || 90);
  const [isUpdatingAngle, setIsUpdatingAngle] = useState(false);

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [hours, setHours] = useState('00');
  const [minutes, setMinutes] = useState('00');
  const [seconds, setSeconds] = useState('00');
  const [scheduleDate, setScheduleDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  });
  const [isScheduleValid, setIsScheduleValid] = useState(true);
  const [scheduleAction, setScheduleAction] = useState('on');
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const openScheduleModal = () => {
    const { hours, minutes, seconds } = getCurrentISTTime();
    setHours(hours);
    setMinutes(minutes);
    setSeconds(seconds);
    setShowScheduleModal(true);
  };
  
  const getCurrentISTTime = () => {
    const now = new Date();
    const istTime = new Date(now.getTime() );
    return {
      hours: istTime.getHours().toString().padStart(2, '0'),
      minutes: istTime.getMinutes().toString().padStart(2, '0'),
      seconds: istTime.getSeconds().toString().padStart(2, '0'),
      isoString: istTime.toISOString().replace('Z', '+05:30'), // For database
    };
  };
  

  useEffect(() => {
    const validateScheduleTime = () => {
      if (scheduleDate && hours && minutes && seconds) {
        const selectedDate = new Date(
          `${scheduleDate}T${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`
        );
        setIsScheduleValid(selectedDate > new Date());
      }
    };
  
    validateScheduleTime();
  }, [scheduleDate, hours, minutes, seconds]);
  
  const handleSaveName = async () => {
    if (!editName.trim()) {
      setNameError('Device name cannot be empty');
      return;
    }
    
    setIsSavingName(true);
    setNameError(null);
  
    try {
      const response = await fetch('https://pp-kcfa.onrender.com/update-device-name', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email:userEmail, 
          pairingCode: Array.isArray(pair.paired_device) ? pair.paired_device[0] : pair.paired_device,
          deviceName: editName.trim()
        })
      });
  
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update device name');
      }
  
      // Force a refresh of the parent data
      onUnpair(); // This should trigger a refetch of pairs
      setShowEditModal(false);
      
    } catch (error) {
      console.error('Error updating device name:', error);
      setNameError(error instanceof Error ? error.message : 'Failed to update name');
    } finally {
      setIsSavingName(false);
    }
  };

  const handleAngleChange = async (newAngle: number) => {
    setIsUpdatingAngle(true);
    try {
      const response = await fetch('https://pp-kcfa.onrender.com/set-angle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pairingCode: pair.paired_device,
          mode: newAngle,
          email:userEmail
        })
      });

      if (!response.ok) throw new Error('Failed to update angle');
      
      setCurrentAngle(newAngle);
      onUnpair(); // Refresh pairs list
    } catch (error) {
      console.error('Error updating angle:', error);
      alert('Failed to update angle. Please try again.');
    } finally {
      setIsUpdatingAngle(false);
    }
  };
  const angleOptions = [1, 2, 3, 4, 5];


  useEffect(() => {
    if (pair.paired_device) {
      const fetchServoState = async () => {
        try {
          const response = await fetch(`https://pp-kcfa.onrender.com/isOnline?pairingCode=${pair.paired_device}`, {
            method: 'POST', // Changed to GET since you're using query parameters
          });
  
          if (!response.ok) {
            throw new Error('Failed to fetch servo state');
          }
  
          const data = await response.json();
  
          if(data.state === 'ONLINE')
            {
            setIsOnline(true); // Device is online
            }
          else{
          setIsOnline(false); // Device is offlin
          }
        } catch (error) {
          console.error('Error fetching servo state:', error);
          
        }
      };
  
      fetchServoState();
    }
  }, [pair.paired_device]);

  const handleReverse = async () => {
    try {
      const newReversed = pair.reversed === 'yes' ? 'no' : 'yes';
      
      const response = await fetch('https://pp-kcfa.onrender.com/update-reverse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pairingCode: pair.paired_device,
          reversed: newReversed,
          email:userEmail 
        })
      });
  
      if (!response.ok) throw new Error('Failed to update reverse state');
      
      // Refresh the pairs list to get updated state
      onUnpair();
    } catch (error) {
      console.error('Error reversing state:', error);
      alert('Failed to update reverse state. Please try again.');
    }
  };


  const handleToggle = async () => {
    setIsLoading(true);
    try {
      const actualState = pair.reversed === 'yes' ? !isOn : isOn;
      
      const response = await fetch('https://pp-kcfa.onrender.com/servo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          state: actualState ? 'OFF' : 'ON', // Invert if reversed
          pairingCode: pair.paired_device,
          
        })
      });
  
      if (!response.ok) throw new Error('Failed to toggle servo');
      
      // Update local state based on reversed flag
      setIsOn(prev => !prev);
    } catch (error) {
      console.error('Error toggling servo:', error);
      alert('Failed to toggle device. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnpair = async () => {
    if (!window.confirm('Are you sure you want to unpair this device?')) return;
  
    setIsUnpairing(true);
    try {
      // Optimistic update
      setPairs(prev => prev.filter(p => 
        Array.isArray(p.paired_device)
          ? !p.paired_device.includes(pair.paired_device as string)
          : p.paired_device !== pair.paired_device
      ));
  
      const response = await fetch('https://pp-kcfa.onrender.com/unpair', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          device_id: Array.isArray(pair.paired_device) 
            ? pair.paired_device[0] 
            : pair.paired_device,
          email: userEmail
        })
      });
  
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Unpair failed. Please try again.');
      }
  
      // Add delay before refresh
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Force fresh data fetch
      await onUnpair(); // Not await fetchPairs()
  
    } catch (error) {
      console.error('Unpair error:', error);
      setPairs(prev => [...prev, pair]); // Re-add device on error
    } finally {
      setIsUnpairing(false);
    }
  };

  const handleSaveSchedule = async () => {
  if (!hours || !minutes || !seconds) {
    setScheduleError('Please set a complete time for the schedule.');
    return;
  }

  const hr = hours.padStart(2, '0');
  const min = minutes.padStart(2, '0');
  const sec = seconds.padStart(2, '0');

  // Get the current date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0]; // e.g., "2025-03-09"

  // Combine date and time to form a valid timestamp
  const combinedDateTime = `${scheduleDate}T${hours}:${minutes}:${seconds}`;
  const scheduleTime = new Date(combinedDateTime).toISOString();
  
  // Capture the current time in UTC (for created_at)
  const createdAt = new Date().toISOString();

  setIsSavingSchedule(true);
  setScheduleError(null);

  try {
    const response = await fetch('https://pp-kcfa.onrender.com/schedule', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pairingCode: pair.paired_device, // Ensure this is the correct device code
        scheduleTime: scheduleTime,
        action: scheduleAction,
        createdAt,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save schedule');
    }

    alert('✅ Schedule saved successfully!');
    setShowScheduleModal(false);
    setHours('00');
    setMinutes('00');
    setSeconds('00');
  } catch (error) {
    console.error('❌ Error saving schedule:', error);
    setScheduleError(error.message);
  } finally {
    setIsSavingSchedule(false);
  }
};

  
  
  if (!pair.paired_device) {
    return (
      <div className="gradient-border">
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-yellow-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
          </div>
          <p className="text-gray-600 mb-6">Device pairing incomplete</p>
          <button
            onClick={handleUnpair}
            disabled={isUnpairing}
            className="inline-flex items-center gap-2 px-6 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-300"
          >
            {isUnpairing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Removing...
              </>
            ) : (
              <>
                <Unlink className="h-4 w-4" />
                Remove Device
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="gradient-border">
      <div className="p-8 space-y-8">
        <div className="flex justify-between items-center">
          
          <h2 className="text-2xl font-semibold">
  {pair.device_name || `Device ${pair.paired_device}`}
</h2>
         
          <button
      onClick={() => setShowEditModal(true)}
      className="text-gray-400 hover:text-blue-600 transition-colors duration-300"
      title="Edit device name"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
        <path d="M13.5 6.5l4 4" />
      </svg>
    </button>
          <div className="flex items-center gap-3">
          <div 
  className={`px-3 py-1.5 rounded-full border text-[0.925rem] font-medium flex items-center gap-1.5 transition-colors duration-200 ${
    isOnline 
      ? "bg-green-50 border-green-100 text-green-700" 
      : "bg-red-50 border-red-100 text-red-700"
  }`}
>

{showEditModal && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-lg flex items-center justify-center p-4 z-[100]">
    <div className="relative max-w-md w-full">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[2.5rem] blur-3xl opacity-20"></div>
      
      <div className="relative bg-white rounded-[2.5rem] p-12 shadow-2xl card-shadow">
        <button
          onClick={() => {
            setShowEditModal(false);
            setNameError(null);
            setEditName(pair.device_name || `Device ${pair.paired_device}`);
          }}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors duration-300"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Settings2 className="h-8 w-8 text-blue-600" />
          </div>
          <h2  className="text-3xl text-black font-bold mb-4">Edit Device Name</h2>
          <p className="text-gray-600">
            Choose a friendly name for your device
          </p>
        </div>

        <div className="space-y-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Device Name
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 text-black focus:border-blue-600 focus:ring focus:ring-blue-600/20 transition-all duration-300"
                placeholder="Enter device name"
                required
              />
            </div>
          </div>

          {nameError && (
            <div className="text-red-600 text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              {nameError}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => {
                setShowEditModal(false);
                setNameError(null);
                setEditName(pair.device_name || `Device ${pair.paired_device}`);
              }}
              className="flex-1 py-4 text-gray-600 rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition-all duration-300 font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveName}
              disabled={isSavingName}
              className={`flex-1 text-white py-4 rounded-xl transition-all duration-300 font-semibold flex items-center justify-center gap-2 ${
                isSavingName
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-xl hover:shadow-blue-500/20'
              }`}
            >
              {isSavingName ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Settings2 className="h-5 w-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

            )}

  {isOnline ? (
    <>
      <Activity className="h-[14px] w-[14px] flex-shrink-0 animate-pulse" />
      <span className="leading-tight">Online</span>
    </>
  ) : (
    <>
      <Unlink className="h-[14px] w-[14px] flex-shrink-0" />
      <span className="leading-tight">Offline</span>
    </>
  )}
</div>
<button
  onClick={handleReverse}
  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors duration-300"
  title={pair.reversed === 'yes' ? "Disable Reverse" : "Enable Reverse"}
>
  <RefreshCw className={`h-5 w-5 ${pair.reversed === 'yes' ? 'text-blue-600' : ''}`} />
</button>

            <button
              onClick={handleUnpair}
              disabled={isUnpairing}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-300"
              title="Unpair Device"
            >
              {isUnpairing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Unlink className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
        
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Power State</span>
            <button
              onClick={handleToggle}
              disabled={isLoading}
              className={`relative w-16 h-9 rounded-full transition-colors duration-300 ${
                isOn ? 'bg-green-500' : 'bg-gray-200'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span
                className={`absolute top-1 left-1 w-7 h-7 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                  isOn ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          

         


      
          <button
  onClick={openScheduleModal} // Updated here
  className="w-full flex items-center justify-center gap-2 text-gray-600 py-3 border-t border-gray-100 hover:text-blue-600 transition-colors duration-300"
>
  <Clock className="h-4 w-4" />
  Set Schedule
</button>
        </div>
      </div>

      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-lg flex items-center justify-center p-4 z-50">
          <div className="relative max-w-md w-full">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[2.5rem] blur-3xl opacity-20"></div>
            
            <div className="relative bg-white rounded-[2.5rem] p-12 shadow-2xl card-shadow">
              <button
                onClick={() => {
                  setShowScheduleModal(false);
                  setScheduleError(null);
                  setHours('00');
                  setMinutes('00');
                  setSeconds('00');
                }}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors duration-300"
              >
                <X className="h-6 w-6" />
              </button>

              <div className="text-center mb-12">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold mb-4">Set Device Schedule</h2>
                <p className="text-gray-600">
                  Schedule when your device should turn on or off
                </p>
              </div>
 <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Schedule Date
    </label>
    <input
  type="date"
  value={scheduleDate}
  min={new Date().toISOString().split('T')[0]}
  onChange={(e) => setScheduleDate(e.target.value)}
  className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-600 focus:ring focus:ring-blue-600/20 transition-all duration-300"
  required
/>
  </div>
              <div className="space-y-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Schedule Time (HH:MM:SS)
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">Hours</label>
                        <input
                          type="number"
                          min="0"
                          max="23"
                          value={hours}
                          onChange={(e) => {
                            const value = e.target.value;
                            const numValue = parseInt(value);
                            if (value === '' || (numValue >= 0 && numValue <= 23)) {
                              setHours(value.padStart(2, '0'));
                            }
                          }}
                          className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-600 focus:ring focus:ring-blue-600/20 transition-all duration-300"
                          placeholder="HH"
                          required
                        />
                      </div>
                      <div className="flex items-end pb-4">
                        <span className="text-2xl text-gray-400">:</span>
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">Minutes</label>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          value={minutes}
                          onChange={(e) => {
                            const value = e.target.value;
                            const numValue = parseInt(value);
                            if (value === '' || (numValue >= 0 && numValue <= 59)) {
                              setMinutes(value.padStart(2, '0'));
                            }
                          }}
                          className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-600 focus:ring focus:ring-blue-600/20 transition-all duration-300"
                          placeholder="MM"
                          required
                        />
                      </div>
                      <div className="flex items-end pb-4">
                        <span className="text-2xl text-gray-400">:</span>
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">Seconds</label>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          value={seconds}
                          onChange={(e) => {
                            const value = e.target.value;
                            const numValue = parseInt(value);
                            if (value === '' || (numValue >= 0 && numValue <= 59)) {
                              setSeconds(value.padStart(2, '0'));
                            }
                          }}
                          className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-600 focus:ring focus:ring-blue-600/20 transition-all duration-300"
                          placeholder="SS"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Action
                    </label>
                    <select
                      value={scheduleAction}
                      onChange={(e) => setScheduleAction(e.target.value)}
                      className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-600 focus:ring focus:ring-blue-600/20 transition-all duration-300"
                    >
                      <option value="ON">Turn ON</option>
                      <option value="OFF">Turn OFF</option>
                    </select>
                  </div>
                </div>

                {scheduleError && (
                  <div className="text-red-600 text-sm flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                    {scheduleError}
                  </div>
                )}



{!isScheduleValid && (
  <div className="text-red-500 mt-2">
    Cannot schedule in the past. Please select a future date and time.
  </div>
)}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowScheduleModal(false);
                      setScheduleError(null);
                    }}
                    className="flex-1 py-4 text-gray-600 rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition-all duration-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
  type="button"
  onClick={handleSaveSchedule}
  disabled={isSavingSchedule || !isScheduleValid}
  className={`flex-1 text-white py-4 rounded-xl transition-all duration-300 font-semibold flex items-center justify-center gap-2 ${
    isSavingSchedule || !isScheduleValid
      ? 'bg-gray-300 cursor-not-allowed'
      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-xl hover:shadow-blue-500/20'
  }`}
>
  {isSavingSchedule ? (
    <>
      <Loader2 className="h-5 w-5 animate-spin" />
      Saving...
    </>
  ) : (
    <>
      <Clock className="h-5 w-5" />
      Save Schedule
    </>
  )}
</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ControlPanel;