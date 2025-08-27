// Simulated API client for the Hydra Platform
// This module provides a mock backend API to demonstrate the platform functionality

export const apiClient = {
    // Simulate network latency
    _simulateLatency: (min = 300, max = 1000) => {
        return new Promise(resolve => {
            const delay = Math.random() * (max - min) + min;
            setTimeout(resolve, delay);
        });
    },

    // Mock user authentication
    async login(email, password) {
        await this._simulateLatency();
        
        // Simulate login validation
        if (email === 'admin@hydra.io' && password === 'password123') {
            return {
                id: 'user_001',
                email: email,
                name: 'Admin User',
                role: 'admin',
                createdAt: new Date().toISOString()
            };
        } else {
            throw new Error('Invalid credentials');
        }
    },

    // Get user wallets
    async getWallets(userId) {
        await this._simulateLatency();
        
        // Return mock wallet data
        return [
            {
                id: 'wallet_usd',
                currency: 'USD',
                balance: 2500.00,
                address: null
            },
            {
                id: 'wallet_usdt',
                currency: 'USDT',
                balance: 1750.50,
                address: 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE'
            }
        ];
    },

    // Get user transactions
    async getTransactions(userId) {
        await this._simulateLatency();
        
        // Generate mock transaction history
        const transactions = [];
        const types = ['deposit', 'withdraw', 'exchange', 'game_bet', 'game_win'];
        const currencies = ['USD', 'USDT'];
        const statuses = ['completed', 'pending', 'failed'];
        
        // Generate 20 sample transactions
        for (let i = 0; i < 20; i++) {
            const type = types[Math.floor(Math.random() * types.length)];
            const currency = currencies[Math.floor(Math.random() * currencies.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const amount = parseFloat((Math.random() * 1000 + 10).toFixed(2));
            
            const transaction = {
                id: `tx_${Date.now()}_${i}`,
                type,
                currency,
                amount,
                status,
                timestamp: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString(),
                details: this._getTransactionDetails(type, amount, currency)
            };
            
            transactions.push(transaction);
        }
        
        return transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    },

    // Helper to generate transaction details
    _getTransactionDetails(type, amount, currency) {
        const details = {
            deposit: `Cash App deposit of ${amount} ${currency}`,
            withdraw: `Bank withdrawal of ${amount} ${currency}`,
            exchange: `Currency exchange ${amount} ${currency}`,
            game_bet: `Coin flip bet ${amount} ${currency}`,
            game_win: `Game win ${amount} ${currency}`
        };
        
        return details[type] || `${type} ${amount} ${currency}`;
    },

    // Initiate fiat deposit
    async initiateFiatDeposit(userId, amount) {
        await this._simulateLatency();
        
        return {
            id: `tx_${Date.now()}`,
            type: 'deposit',
            currency: 'USD',
            amount: amount,
            status: 'completed',
            timestamp: new Date().toISOString(),
            details: `Cash App deposit of ${amount} USD`,
            confirmationCode: `CA${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        };
    },

    // Initiate withdrawal
    async initiateWithdrawal(userId, amount, currency, method, destination) {
        await this._simulateLatency();

        let details = '';
        if (method === 'trc20') {
            details = `TRC20 withdrawal of ${amount} ${currency} to ${destination.substring(0, 8)}...`;
        } else if (method === 'cashapp') {
            details = `Cash App withdrawal of ${amount} ${currency} to ${destination}`;
        } else {
            throw new Error('Invalid withdrawal method');
        }
        
        return {
            id: `tx_${Date.now()}`,
            type: 'withdraw',
            currency: currency,
            amount: amount,
            status: 'pending',
            timestamp: new Date().toISOString(),
            details: details,
            method: method,
            destination: destination,
            estimatedCompletion: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        };
    },

    // Initiate admin withdrawal
    async initiateAdminWithdrawal(userId, amount, currency, address) {
        await this._simulateLatency();
        
        return {
            id: `tx_${Date.now()}`,
            type: 'admin_withdraw',
            currency: currency,
            amount: amount,
            status: 'pending',
            timestamp: new Date().toISOString(),
            details: `Admin withdrawal of ${amount} ${currency} to ${address.substring(0, 8)}...`,
            destinationAddress: address
        };
    },

    // Generate crypto deposit address
    async generateDepositAddress(userId, currency) {
        await this._simulateLatency();
        
        // Generate a mock TRON address for USDT deposits
        const addresses = {
            'USDT': 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE',
            'USD': null // USD doesn't have crypto addresses
        };
        
        if (!addresses[currency]) {
            throw new Error(`Address generation not supported for ${currency}`);
        }
        
        return addresses[currency];
    },

    // Get exchange quote
    async getExchangeQuote(fromAmount, fromCurrency, toCurrency) {
        await this._simulateLatency(100, 300); // Faster for real-time quotes
        
        // Mock exchange rates (simplified 1:1 for USD/USDT)
        const rates = {
            'USD_USDT': 0.999,
            'USDT_USD': 1.001
        };
        
        const rateKey = `${fromCurrency}_${toCurrency}`;
        const rate = rates[rateKey] || 1;
        const fee = fromAmount * 0.005; // 0.5% fee
        const toAmount = (fromAmount - fee) * rate;
        
        return {
            fromAmount,
            fromCurrency,
            toCurrency,
            rate,
            fee,
            toAmount: Math.max(0, toAmount),
            validUntil: new Date(Date.now() + 30000).toISOString() // Valid for 30 seconds
        };
    },

    // Execute currency exchange
    async executeExchange(userId, fromAmount, fromCurrency, toCurrency) {
        await this._simulateLatency();
        
        const quote = await this.getExchangeQuote(fromAmount, fromCurrency, toCurrency);
        
        // Create exchange transactions
        const transactions = [
            {
                id: `tx_${Date.now()}_out`,
                type: 'exchange_out',
                currency: fromCurrency,
                amount: fromAmount,
                status: 'completed',
                timestamp: new Date().toISOString(),
                details: `Exchange ${fromAmount} ${fromCurrency} to ${toCurrency}`
            },
            {
                id: `tx_${Date.now()}_in`,
                type: 'exchange_in',
                currency: toCurrency,
                amount: quote.toAmount,
                status: 'completed',
                timestamp: new Date().toISOString(),
                details: `Received ${quote.toAmount.toFixed(6)} ${toCurrency} from exchange`
            }
        ];
        
        return {
            fromAmount,
            fromCurrency,
            toCurrency,
            toAmount: quote.toAmount,
            fee: quote.fee,
            rate: quote.rate,
            transactions
        };
    },

    // Game-related API methods
    async placeBet(userId, gameType, amount, choice) {
        await this._simulateLatency();
        
        const gameResults = {
            'coin-flip': () => {
                const result = Math.random() < 0.5 ? 'heads' : 'tails';
                const won = result === choice;
                return {
                    result,
                    won,
                    payout: won ? amount * 1.95 : 0 // 95% payout, 5% house edge
                };
            }
        };
        
        const gameResult = gameResults[gameType]();
        
        return {
            id: `game_${Date.now()}`,
            gameType,
            amount,
            choice,
            result: gameResult.result,
            won: gameResult.won,
            payout: gameResult.payout,
            timestamp: new Date().toISOString()
        };
    },

    // Get system wallet balances (admin)
    async getSystemWallets() {
        await this._simulateLatency();
        
        return [
            {
                currency: 'USD',
                balance: 150000.00,
                hotBalance: 25000.00,
                coldBalance: 125000.00
            },
            {
                currency: 'USDT',
                balance: 87500.50,
                hotBalance: 12500.50,
                coldBalance: 75000.00
            }
        ];
    },

    // Health check
    async healthCheck() {
        await this._simulateLatency(50, 200);
        
        return {
            status: 'operational',
            timestamp: new Date().toISOString(),
            services: {
                database: 'operational',
                payments: 'operational',
                gaming: 'operational'
            }
        };
    }
};

// Export default for ES6 compatibility
export default apiClient;