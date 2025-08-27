import { apiClient } from './apiClient.js';

// Application state and DOM elements
const App = {
    state: {
        user: null,
        wallets: [],
        transactions: [],
        currentView: 'dashboard-view',
        chart: null,
        gameStats: {
            gamesPlayed: 0,
            totalWagered: 0,
            netPnL: 0
        }
    },
    
    selectors: {},
    
    // Initialize the application
    async init() {
        this.cacheSelectors();
        this.setupEventListeners();
        this.initializeIcons();
        
        // Check for existing session
        const savedUser = localStorage.getItem('hydra_user');
        if (savedUser) {
            this.state.user = JSON.parse(savedUser);
            await this.showDashboard();
        }
    },
    
    // Cache DOM selectors for performance
    cacheSelectors() {
        this.selectors = {
            loginSection: document.getElementById('login-section'),
            dashboardSection: document.getElementById('dashboard-section'),
            loginForm: document.getElementById('login-form'),
            loginError: document.getElementById('login-error'),
            userInitials: document.getElementById('user-initials'),
            userEmailDisplay: document.getElementById('user-email-display'),
            logoutButton: document.getElementById('logout-button'),
            viewTitle: document.getElementById('view-title'),
            totalBalanceUsd: document.getElementById('total-balance-usd'),
            walletBalancesContainer: document.getElementById('wallet-balances-container'),
            transactionsTableBody: document.getElementById('transactions-table-body'),
            activityChart: document.getElementById('activity-chart'),
            toast: document.getElementById('toast'),
            toastMessage: document.getElementById('toast-message'),
            toastIcon: document.getElementById('toast-icon'),
            modalOverlay: document.getElementById('modal-overlay'),
            modalContent: document.getElementById('modal-content'),
            viewContainer: document.getElementById('view-container'),
            navLinks: document.querySelectorAll('.nav-link'),
            viewContents: document.querySelectorAll('.view-content')
        };
    },
    
    // Set up event listeners
    setupEventListeners() {
        // Login form
        this.selectors.loginForm.addEventListener('submit', this.handleLogin.bind(this));
        
        // Logout
        this.selectors.logoutButton.addEventListener('click', this.handleLogout.bind(this));
        
        // Navigation
        this.selectors.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const viewId = link.dataset.view;
                this.showView(viewId);
            });
        });
        
        // Deposit forms
        const fiatDepositForm = document.getElementById('fiat-deposit-form');
        const withdrawForm = document.getElementById('withdraw-form');
        const adminWithdrawForm = document.getElementById('admin-withdraw-form');
        
        if (fiatDepositForm) fiatDepositForm.addEventListener('submit', this.handleFiatDeposit.bind(this));
        if (withdrawForm) withdrawForm.addEventListener('submit', this.handleWithdraw.bind(this));
        if (adminWithdrawForm) adminWithdrawForm.addEventListener('submit', this.handleAdminWithdraw.bind(this));
        
        // Deposit tabs
        const depositFiatTab = document.getElementById('deposit-fiat-tab');
        const depositCryptoTab = document.getElementById('deposit-crypto-tab');
        
        if (depositFiatTab) depositFiatTab.addEventListener('click', () => this.switchDepositTab('fiat'));
        if (depositCryptoTab) depositCryptoTab.addEventListener('click', () => this.switchDepositTab('crypto'));
        
        // Crypto deposit buttons
        const generateAddressBtn = document.getElementById('generate-address-btn');
        const copyAddressBtn = document.getElementById('copy-address-btn');
        const cryptoDepositDone = document.getElementById('crypto-deposit-done');
        
        if (generateAddressBtn) generateAddressBtn.addEventListener('click', this.generateCryptoAddress.bind(this));
        if (copyAddressBtn) copyAddressBtn.addEventListener('click', this.copyAddress.bind(this));
        if (cryptoDepositDone) cryptoDepositDone.addEventListener('click', () => this.showView('dashboard-view'));
        
        // Exchange functionality
        const fromAmountInput = document.getElementById('from-amount');
        const fromCurrencySelect = document.getElementById('from-currency');
        const toCurrencySelect = document.getElementById('to-currency');
        const swapButton = document.getElementById('swap-currencies-btn');
        const executeExchangeBtn = document.getElementById('execute-exchange-btn');
        
        if (fromAmountInput) fromAmountInput.addEventListener('input', this.updateExchangeQuote.bind(this));
        if (fromCurrencySelect) fromCurrencySelect.addEventListener('change', this.updateExchangeQuote.bind(this));
        if (toCurrencySelect) toCurrencySelect.addEventListener('change', this.updateExchangeQuote.bind(this));
        if (swapButton) swapButton.addEventListener('click', this.swapCurrencies.bind(this));
        if (executeExchangeBtn) executeExchangeBtn.addEventListener('click', this.executeExchange.bind(this));
        
        // Gaming functionality
        const gameCards = document.querySelectorAll('.game-card');
        gameCards.forEach(card => {
            card.addEventListener('click', () => {
                const game = card.dataset.game;
                if (game === 'coin-flip') {
                    this.showView('coin-flip-view');
                }
            });
        });
        
        // Coin flip game
        const betHeadsBtn = document.getElementById('bet-heads');
        const betTailsBtn = document.getElementById('bet-tails');
        
        if (betHeadsBtn) betHeadsBtn.addEventListener('click', () => this.playCoinFlip('heads'));
        if (betTailsBtn) betTailsBtn.addEventListener('click', () => this.playCoinFlip('tails'));
        
        // Main deposit button
        const mainDepositBtn = document.getElementById('main-deposit-btn');
        if (mainDepositBtn) mainDepositBtn.addEventListener('click', () => this.showView('deposit-view'));
        
        // Modal close
        this.selectors.modalOverlay.addEventListener('click', (e) => {
            if (e.target === this.selectors.modalOverlay) {
                this.hideModal();
            }
        });
        
        // Code explorer functionality
        this.setupCodeExplorer();
    },
    
    // Initialize Lucide icons
    initializeIcons() {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    },
    
    // Handle user login
    async handleLogin(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');
        
        try {
            this.toggleButtonLoading(e.target.querySelector('button[type="submit"]'), true);
            
            const user = await apiClient.login(email, password);
            this.state.user = user;
            
            // Save user session
            localStorage.setItem('hydra_user', JSON.stringify(user));
            
            await this.showDashboard();
            this.showToast('Login successful!', 'success');
            
        } catch (error) {
            this.selectors.loginError.textContent = error.message;
            this.selectors.loginError.classList.remove('hidden');
            this.showToast('Login failed', 'error');
        } finally {
            this.toggleButtonLoading(e.target.querySelector('button[type="submit"]'), false);
        }
    },
    
    // Handle user logout
    handleLogout(e) {
        e.preventDefault();
        localStorage.removeItem('hydra_user');
        this.state.user = null;
        this.selectors.loginSection.classList.remove('hidden');
        this.selectors.dashboardSection.classList.add('hidden');
        this.showToast('Logged out successfully', 'success');
    },
    
    // Show dashboard after login
    async showDashboard() {
        this.selectors.loginSection.classList.add('hidden');
        this.selectors.dashboardSection.classList.remove('hidden');
        
        // Update user display
        const initials = this.state.user.email.split('@')[0].substring(0, 2).toUpperCase();
        this.selectors.userInitials.textContent = initials;
        this.selectors.userEmailDisplay.textContent = this.state.user.email;
        
        // Load dashboard data
        await this.loadDashboardData();
        this.initializeIcons();
    },
    
    // Load dashboard data
    async loadDashboardData() {
        try {
            // Load wallets and transactions
            this.state.wallets = await apiClient.getWallets(this.state.user.id);
            this.state.transactions = await apiClient.getTransactions(this.state.user.id);
            
            // Update UI
            this.renderWallets();
            this.renderTransactions();
            this.updateTotalBalance();
            this.updateChart();
            this.updateGamingStats();
            
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            this.showToast('Failed to load dashboard data', 'error');
        }
    },
    
    // Render wallet balances
    renderWallets() {
        const container = this.selectors.walletBalancesContainer;
        container.innerHTML = '';
        
        this.state.wallets.forEach(wallet => {
            const walletDiv = document.createElement('div');
            walletDiv.className = 'flex items-center justify-between p-3 bg-background rounded-md border border-border';
            walletDiv.innerHTML = `
                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                        ${wallet.currency}
                    </div>
                    <div>
                        <p class="font-medium">${wallet.currency}</p>
                        <p class="text-xs text-muted-foreground">${wallet.currency === 'USD' ? 'US Dollar' : 'Tether USD'}</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="font-semibold">${wallet.balance.toLocaleString()} ${wallet.currency}</p>
                </div>
            `;
            container.appendChild(walletDiv);
        });
    },
    
    // Render transactions table
    renderTransactions() {
        const tbody = this.selectors.transactionsTableBody;
        tbody.innerHTML = '';
        
        const recentTransactions = this.state.transactions.slice(-10).reverse();
        
        recentTransactions.forEach(transaction => {
            const row = document.createElement('tr');
            row.className = 'border-b border-border';
            
            const statusClass = transaction.status === 'completed' ? 'status-completed' :
                              transaction.status === 'pending' ? 'status-pending' : 'status-failed';
            
            const amountColor = transaction.type === 'deposit' || transaction.type === 'exchange_in' ? 'text-green-400' : 'text-red-400';
            const amountPrefix = transaction.type === 'deposit' || transaction.type === 'exchange_in' ? '+' : '-';
            
            row.innerHTML = `
                <td class="p-4 text-muted-foreground">${new Date(transaction.timestamp).toLocaleDateString()}</td>
                <td class="p-4 capitalize">${transaction.type.replace('_', ' ')}</td>
                <td class="p-4 text-muted-foreground">${transaction.details || '-'}</td>
                <td class="p-4 text-right ${amountColor}">${amountPrefix}${transaction.amount} ${transaction.currency}</td>
                <td class="p-4 text-center">
                    <span class="status-badge ${statusClass}">${transaction.status}</span>
                </td>
            `;
            
            tbody.appendChild(row);
        });
    },
    
    // Update total balance display
    updateTotalBalance() {
        const totalUsd = this.state.wallets.reduce((sum, wallet) => {
            // Simple 1:1 conversion for demo purposes
            return sum + wallet.balance;
        }, 0);
        
        this.selectors.totalBalanceUsd.textContent = `$${totalUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    },
    
    // Update activity chart
    updateChart() {
        if (this.state.chart) {
            this.state.chart.destroy();
        }
        
        const ctx = this.selectors.activityChart.getContext('2d');
        
        // Prepare chart data from transactions
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        
        const dailyVolume = last7Days.map(day => {
            return this.state.transactions
                .filter(t => new Date(t.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) === day)
                .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        });
        
        this.state.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: last7Days,
                datasets: [{
                    label: 'Transaction Volume',
                    data: dailyVolume,
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    }
                }
            }
        });
    },
    
    // Update gaming statistics
    updateGamingStats() {
        const gamesPlayed = document.getElementById('games-played');
        const totalWagered = document.getElementById('total-wagered');
        const netPnL = document.getElementById('net-pnl');
        
        if (gamesPlayed) gamesPlayed.textContent = this.state.gameStats.gamesPlayed;
        if (totalWagered) totalWagered.textContent = `$${this.state.gameStats.totalWagered.toFixed(2)}`;
        if (netPnL) {
            const pnl = this.state.gameStats.netPnL;
            netPnL.textContent = `$${pnl.toFixed(2)}`;
            netPnL.className = `font-semibold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`;
        }
    },
    
    // Show specific view
    showView(viewId) {
        // Hide all views
        this.selectors.viewContents.forEach(view => {
            view.classList.add('hidden');
        });
        
        // Show selected view
        const targetView = document.getElementById(viewId);
        if (targetView) {
            targetView.classList.remove('hidden');
        }
        
        // Update navigation
        this.selectors.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.view === viewId) {
                link.classList.add('active');
            }
        });
        
        // Update title
        const titles = {
            'dashboard-view': 'Dashboard',
            'deposit-view': 'Deposit Funds',
            'withdraw-view': 'Withdraw Funds',
            'exchange-view': 'Exchange',
            'gaming-dashboard-view': 'Gaming Hub',
            'coin-flip-view': 'Coin Flip Game',
            'code-explorer-view': 'Code Explorer',
            'admin-view': 'Admin Panel'
        };
        
        this.selectors.viewTitle.textContent = titles[viewId] || 'Dashboard';
        this.state.currentView = viewId;
        
        // Special handling for code explorer
        if (viewId === 'code-explorer-view') {
            this.initializeCodeExplorer();
        }
    },
    
    // Play coin flip game
    async playCoinFlip(choice) {
        const betAmountInput = document.getElementById('coin-bet-amount');
        const betAmount = parseFloat(betAmountInput.value);
        
        if (!betAmount || betAmount <= 0) {
            this.showToast('Please enter a valid bet amount', 'error');
            return;
        }
        
        // Check USDT balance
        const usdtWallet = this.state.wallets.find(w => w.currency === 'USDT');
        if (!usdtWallet || usdtWallet.balance < betAmount) {
            this.showToast('Insufficient USDT balance', 'error');
            return;
        }
        
        const coin = document.getElementById('coin');
        const resultDiv = document.getElementById('game-result');
        const resultText = document.getElementById('result-text');
        
        // Animate coin flip
        coin.classList.add('coin-flipping');
        coin.textContent = '?';
        
        try {
            // Simulate coin flip
            const result = Math.random() < 0.5 ? 'heads' : 'tails';
            const won = result === choice;
            
            setTimeout(() => {
                coin.classList.remove('coin-flipping');
                coin.textContent = result === 'heads' ? 'H' : 'T';
                
                // Update balance
                if (won) {
                    usdtWallet.balance += betAmount * 0.95; // 95% payout (5% house edge)
                    resultText.textContent = `🎉 You won! The coin landed on ${result}. You won ${(betAmount * 0.95).toFixed(2)} USDT!`;
                    resultDiv.className = 'text-center p-4 rounded-lg bg-green-500/10 border border-green-500/20';
                    this.state.gameStats.netPnL += betAmount * 0.95;
                } else {
                    usdtWallet.balance -= betAmount;
                    resultText.textContent = `😔 You lost! The coin landed on ${result}. Better luck next time!`;
                    resultDiv.className = 'text-center p-4 rounded-lg bg-red-500/10 border border-red-500/20';
                    this.state.gameStats.netPnL -= betAmount;
                }
                
                // Update stats
                this.state.gameStats.gamesPlayed++;
                this.state.gameStats.totalWagered += betAmount;
                
                resultDiv.classList.remove('hidden');
                
                // Update UI
                this.renderWallets();
                this.updateTotalBalance();
                this.updateGamingStats();
                
                // Clear form
                betAmountInput.value = '';
                
                // Hide result after 5 seconds
                setTimeout(() => {
                    resultDiv.classList.add('hidden');
                    coin.textContent = '?';
                }, 5000);
                
            }, 1000);
            
        } catch (error) {
            coin.classList.remove('coin-flipping');
            this.showToast('Game error occurred', 'error');
        }
    },
    
    // Show toast notification
    showToast(message, type = 'info') {
        const toast = this.selectors.toast;
        const toastMessage = this.selectors.toastMessage;
        const toastIcon = this.selectors.toastIcon;
        
        // Set icon based on type
        const icons = {
            success: '<i data-lucide="check-circle" class="w-4 h-4 text-green-400"></i>',
            error: '<i data-lucide="x-circle" class="w-4 h-4 text-red-400"></i>',
            info: '<i data-lucide="info" class="w-4 h-4 text-blue-400"></i>'
        };
        
        toastIcon.innerHTML = icons[type] || icons.info;
        toastMessage.textContent = message;
        
        // Show toast
        toast.classList.remove('opacity-0', 'translate-y-[-20px]');
        toast.classList.add('opacity-100', 'translate-y-0');
        
        // Re-initialize icons
        this.initializeIcons();
        
        // Hide after 3 seconds
        setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-y-[-20px]');
            toast.classList.remove('opacity-100', 'translate-y-0');
        }, 3000);
    },
    
    // Show modal
    showModal(content) {
        this.selectors.modalContent.innerHTML = content;
        this.selectors.modalOverlay.classList.remove('hidden');
    },
    
    // Hide modal
    hideModal() {
        this.selectors.modalOverlay.classList.add('hidden');
    },
    
    // Toggle button loading state
    toggleButtonLoading(button, loading) {
        if (loading) {
            button.disabled = true;
            button.classList.add('loading');
            const originalText = button.innerHTML;
            button.dataset.originalText = originalText;
            button.innerHTML = '<span class="spinner mr-2"></span>Loading...';
        } else {
            button.disabled = false;
            button.classList.remove('loading');
            button.innerHTML = button.dataset.originalText || button.innerHTML;
        }
    },
    
    // Setup code explorer
    setupCodeExplorer() {
        // This will be implemented when code explorer view is shown
    },
    
    // Initialize code explorer
    initializeCodeExplorer() {
        const fileTreeContainer = document.getElementById('file-tree-container');
        if (!fileTreeContainer) return;
        
        // Sample file structure
        const fileStructure = {
            'src/': {
                type: 'folder',
                children: {
                    'main.js': { type: 'file', content: 'console.log("Main application file");' },
                    'apiClient.js': { type: 'file', content: 'export const apiClient = { /* API methods */ };' },
                    'components/': {
                        type: 'folder',
                        children: {
                            'Dashboard.js': { type: 'file', content: '// Dashboard component' },
                            'Wallet.js': { type: 'file', content: '// Wallet component' }
                        }
                    }
                }
            },
            'index.html': { type: 'file', content: '<!DOCTYPE html><html>...</html>' },
            'style.css': { type: 'file', content: '/* Stylesheet */' }
        };
        
        this.renderFileTree(fileStructure, fileTreeContainer);
    },
    
    // Render file tree
    renderFileTree(structure, container, path = '') {
        container.innerHTML = '';
        
        Object.entries(structure).forEach(([name, item]) => {
            const itemElement = document.createElement('div');
            const fullPath = path ? `${path}/${name}` : name;
            
            if (item.type === 'folder') {
                itemElement.className = 'folder-item';
                itemElement.innerHTML = `
                    <i data-lucide="folder" class="w-4 h-4 mr-2 text-blue-400"></i>
                    ${name}
                `;
                
                itemElement.addEventListener('click', () => {
                    // Toggle folder expansion (simplified for demo)
                    console.log('Folder clicked:', fullPath);
                });
            } else {
                itemElement.className = 'file-item';
                itemElement.innerHTML = `
                    <i data-lucide="file-text" class="w-4 h-4 mr-2 text-gray-400"></i>
                    ${name}
                `;
                
                itemElement.addEventListener('click', () => {
                    this.showFileContent(fullPath, item.content);
                    
                    // Update selection
                    container.querySelectorAll('.file-item').forEach(el => el.classList.remove('selected'));
                    itemElement.classList.add('selected');
                });
            }
            
            container.appendChild(itemElement);
        });
        
        this.initializeIcons();
    },
    
    // Show file content in code viewer
    showFileContent(filePath, content) {
        const filePathElement = document.getElementById('file-path');
        const codeContainer = document.getElementById('code-container');
        
        if (filePathElement) filePathElement.textContent = filePath;
        if (codeContainer) {
            codeContainer.innerHTML = `<code class="language-js">${this.escapeHtml(content)}</code>`;
        }
    },
    
    // Escape HTML for safe display
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Export for module usage
export default App;