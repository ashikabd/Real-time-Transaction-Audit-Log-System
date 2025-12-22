// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Send, History, ArrowUpDown, RefreshCw, LogOut } from 'lucide-react';
import { transferAPI, auditAPI, setToken, getToken } from './services/api';
import LoginPage from './LoginPage';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [receiverId, setReceiverId] = useState('');
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [history, setHistory] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' });
  const [initialLoading, setInitialLoading] = useState(true);

  // Check if token exists on mount
  useEffect(() => {
    const token = getToken();
    if (token) {
      setIsLoggedIn(true);
      // You can decode the token to get user info or load from localStorage
      const storedUser = localStorage.getItem('loggedInUser');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setLoggedInUser(user);
        setCurrentUser(user.id);
      }
    }
    setInitialLoading(false);
  }, []);

  // Load users on mount
  useEffect(() => {
    if (isLoggedIn) {
      loadUsers();
    }
  }, [isLoggedIn]);

  // Load user data when current user changes
  useEffect(() => {
    if (currentUser && isLoggedIn) {
      loadUserData();
    }
  }, [currentUser, isLoggedIn]);

  const loadUsers = async () => {
    try {
      const response = await transferAPI.getUsers();
      // backend returns an array of users directly (or an object with `users`)
      const usersData = Array.isArray(response) ? response : (response.users || []);
      setUsers(usersData);
      if (usersData.length > 0 && !currentUser) {
        setCurrentUser(usersData[0].id);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      setMessage({
        type: 'error',
        text: 'Failed to load users. Please check if the backend is running.'
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      // Load user balance
      const userResponse = await transferAPI.getUser(currentUser);
      // `getUser` returns the user object directly from the backend
      if (userResponse) {
        setBalance(parseFloat(userResponse.balance));
      }

      // Load transaction history (backend returns rows array)
      const historyResponse = await auditAPI.getHistory(currentUser);
      if (Array.isArray(historyResponse)) {
        // map backend fields to the frontend-friendly shape
        const mapped = historyResponse.map((r) => ({
          transactionId: r.transaction_id,
          // keep original ISO string but also store numeric ms for robust sorting
          timestamp: r.created_at,
          timestampMs: r.created_at ? Date.parse(r.created_at) : 0,
          senderId: r.sender_id,
          receiverId: r.receiver_id,
          amount: parseFloat(r.amount),
          status: r.status,
          // try to resolve names from the loaded users list
          senderName: (users.find(u => u.id === r.sender_id) || {}).name || `User ${r.sender_id}`,
          receiverName: (users.find(u => u.id === r.receiver_id) || {}).name || `User ${r.receiver_id}`,
          id: r.transaction_id,
        }));
        setHistory(mapped);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const handleTransfer = async () => {
    if (!receiverId || !amount) return;

    setLoading(true);
    setMessage(null);

    try {
      const response = await transferAPI.transfer(
        currentUser,
        parseInt(receiverId),
        parseFloat(amount),
        currentUser
      );

      // backend returns { message, transactionId } on success
      setMessage({
        type: 'success',
        text: `${response.message} (ID: ${response.transactionId})`
      });

      // Refresh user data (balance + history)
      await loadUserData();
      setAmount('');
      setReceiverId('');
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || error.response?.data?.message || 'Transfer failed. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedHistory = [...history].sort((a, b) => {
    let aVal = a[sortConfig.key];
    let bVal = b[sortConfig.key];

    // handle timestamp sorting using numeric ms value
    if (sortConfig.key === 'timestamp') {
      aVal = a.timestampMs || (a.timestamp ? Date.parse(a.timestamp) : 0)
      bVal = b.timestampMs || (b.timestamp ? Date.parse(b.timestamp) : 0)
    }

    if (sortConfig.key === 'amount') {
      aVal = parseFloat(aVal || 0)
      bVal = parseFloat(bVal || 0)
    }

    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const availableReceivers = users.filter(u => u.id !== currentUser);
  const currentUserData = users.find(u => u.id === currentUser);

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={(user) => {
      setLoggedInUser(user);
      localStorage.setItem('loggedInUser', JSON.stringify(user));
      setIsLoggedIn(true);
      setCurrentUser(user.id);
    }} />;
  }

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('loggedInUser');
    setIsLoggedIn(false);
    setLoggedInUser(null);
    setCurrentUser(null);
    setHistory([]);
    setBalance(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Fund Transfer System</h1>
              <p className="text-gray-600">Real-time transactions with PostgreSQL and immutable audit logging</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-2">Logged in as: <strong>{loggedInUser?.name}</strong></p>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-800 rounded-lg transition-colors flex items-center gap-2 ml-auto"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4">

            <label className="text-sm font-medium text-gray-700">Current User:</label>
            <select
              value={currentUser || ''}
              onChange={(e) => setCurrentUser(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} (@{user.username})
                </option>
              ))}
            </select>
            <button
              onClick={loadUserData}
              className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <div className="ml-auto text-right">
              <div className="text-sm text-gray-600">Current Balance</div>
              <div className="text-2xl font-bold text-green-600">${balance.toFixed(2)}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Transfer Form */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Send className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-800">New Transfer</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Receiver
                </label>
                <select
                  value={receiverId}
                  onChange={(e) => setReceiverId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select receiver...</option>
                  {availableReceivers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} (@{user.username}) - ${parseFloat(user.balance).toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={handleTransfer}
                disabled={loading || !receiverId || !amount}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? 'Processing...' : 'Send Money'}
                <Send className="w-4 h-4" />
              </button>
            </div>

            {message && (
              <div className={`mt-4 p-4 rounded-lg flex items-start gap-3 ${
                message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                )}
                <span className="text-sm">{message.text}</span>
              </div>
            )}
          </div>

          {/* Transaction History */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <History className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-800">Transaction History</h2>
              <span className="ml-auto text-sm text-gray-500">{history.length} transactions</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th
                      onClick={() => handleSort('transactionId')}
                      className="text-left py-3 px-2 text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-1">
                        ID
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('timestamp')}
                      className="text-left py-3 px-2 text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-1">
                        Date
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">
                      Type
                    </th>
                    <th
                      onClick={() => handleSort('amount')}
                      className="text-right py-3 px-2 text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-end gap-1">
                        Amount
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('status')}
                      className="text-center py-3 px-2 text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-center gap-1">
                        Status
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedHistory.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-8 text-gray-500">
                        No transactions yet
                      </td>
                    </tr>
                  ) : (
                    sortedHistory.map((tx) => {
                      const isSender = tx.senderId === currentUser;
                      const otherParty = isSender ? tx.receiverName : tx.senderName;

                      return (
                        <tr key={tx.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-2 text-xs font-mono text-gray-600">
                            {tx.transactionId}
                          </td>
                          <td className="py-3 px-2 text-xs text-gray-600">
                            {new Date(tx.timestamp).toLocaleString()}
                          </td>
                          <td className="py-3 px-2 text-xs">
                            <div className={`font-medium ${isSender ? 'text-red-600' : 'text-green-600'}`}>
                              {isSender ? 'Sent to' : 'Received from'}
                            </div>
                            <div className="text-gray-500 truncate max-w-[100px]">
                              {otherParty}
                            </div>
                          </td>
                          <td className={`py-3 px-2 text-right font-semibold ${
                            isSender ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {isSender ? '-' : '+'}${tx.amount.toFixed(2)}
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                              tx.status === 'SUCCESS'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {tx.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;