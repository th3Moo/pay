/**
 * apiClient.js
 *
 * This module simulates a client for an API backend.
 * It mimics network latency and returns mock data for a financial application.
 * Each function returns a Promise to simulate asynchronous operations.
 */
const apiClient = {
    _simulateLatency(callback) {
        return new Promise(resolve => setTimeout(() => resolve(callback()), 750));
    },
    
    login(email, password) {
        return this._simulateLatency(() => {
            if (email === 'admin@hydra.io' && password === 'password123') {
                return { 
                    success: true, 
                    user: { id: 'user-1', email: 'admin@hydra.io', role: 'admin' } 
                };
            }
            if (email === 'user@hydra.io' && password === 'password123') {
                return { 
                    success: true, 
                    user: { id: 'user-2', email: 'user@hydra.io', role: 'user' } 
                };
            }
            return { success: false, message: 'Invalid credentials' };
        });
    },

    fetchDashboardData(userId) {
        return this._simulateLatency(() => {
            return {
                success: true,
                data: {
                    wallets: [
                        { id: 'wallet-1', userId, currency: 'USD', balance: 1250.75, address: null },
                        { id: 'wallet-2', userId, currency: 'USDT', balance: 5310.50, address: null }
                    ],
                    transactions: [
                        { id: 'tx-1', date: '2025-08-26T14:30:00Z', type: 'Deposit', details: 'Cash App Deposit', amount: 1000, currency: 'USD', status: 'Completed' },
                        { id: 'tx-2', date: '2025-08-26T10:15:00Z', type: 'Exchange', details: 'USD to USDT', amount: -500, currency: 'USD', status: 'Completed' },
                        { id: 'tx-3', date: '2025-08-25T18:05:00Z', type: 'Withdrawal', details: 'to linked bank', amount: -250, currency: 'USDT', status: 'Completed' },
                        { id: 'tx-4', date: '2025-08-24T09:00:00Z', type: 'Deposit', details: 'Crypto Deposit', amount: 3000, currency: 'USDT', status: 'Completed' },
                        { id: 'tx-5', date: '2025-08-27T11:00:00Z', type: 'Deposit', details: 'Cash App Deposit', amount: 200, currency: 'USD', status: 'Pending' }
                    ].sort((a, b) => new Date(b.date) - new Date(a.date))
                }
            };
        });
    },

    initiateFiatDeposit(userId, amount) {
        return this._simulateLatency(() => {
            if(amount <= 0) return { success: false, message: 'Invalid deposit amount.' };
            return {
                success: true,
                transaction: { id: `tx-${Date.now()}`, date: new Date().toISOString(), type: 'Deposit', details: 'Cash App Deposit', amount: parseFloat(amount), currency: 'USD', status: 'Pending' }
            };
        });
    },
    
    generateCryptoAddress(userId, currency) {
         return this._simulateLatency(() => {
            return {
                success: true,
                address: 'T' + Array.from({length: 33}, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 62)]).join('')
            };
         });
    },
    
    initiateWithdrawal(userId, currency, amount) {
         return this._simulateLatency(() => {
            if(amount <= 0) return { success: false, message: 'Invalid withdrawal amount.' };
            return {
                success: true,
                transaction: { id: `tx-${Date.now()}`, date: new Date().toISOString(), type: 'Withdrawal', details: 'to linked bank', amount: -parseFloat(amount), currency, status: 'Pending' }
            };
         });
    },

    getExchangeRate(from, to) {
        return this._simulateLatency(() => {
            let rate = 1.0;
            if (from === 'USD' && to === 'USDT') rate = 0.998;
            if (from === 'USDT' && to === 'USD') rate = 1.001;
            return { success: true, rate };
        });
    },

    executeExchange(userId, fromCurrency, toCurrency, fromAmount) {
        return this._simulateLatency(() => {
            if(fromAmount <= 0) return { success: false, message: 'Invalid exchange amount.' };
             return {
                success: true,
                transaction: { id: `tx-${Date.now()}`, date: new Date().toISOString(), type: 'Exchange', details: `${fromCurrency} to ${toCurrency}`, amount: parseFloat(fromAmount), currency: fromCurrency, status: 'Completed' }
            };
        });
    },
    
     getSystemWallets() {
        return this._simulateLatency(() => ({
            success: true,
            wallets: [
                { currency: 'USD', balance: 150234.88, address: 'CashApp Hot Wallet' },
                { currency: 'USDT', balance: 345890.12, address: 'TW...hotwallet' }
            ]
        }));
    },
    
    initiateAdminWithdrawal(currency, amount, address) {
        return this._simulateLatency(() => {
            console.log(`ADMIN WITHDRAWAL: ${amount} ${currency} to ${address}`);
            return { success: true, message: 'Admin withdrawal initiated successfully.' };
        });
    }
};

export default apiClient;
