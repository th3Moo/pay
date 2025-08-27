import apiClient from './apiClient.js';

document.addEventListener('DOMContentLoaded', () => {

    const App = {
        state: {
            user: null,
            wallets: [],
            transactions: [],
            currentView: 'dashboard-view',
            chart: null,
        },

        selectors: {
            app: document.getElementById('app'),
            loginSection: document.getElementById('login-section'),
            dashboardSection: document.getElementById('dashboard-section'),
            loginForm: document.getElementById('login-form'),
            loginError: document.getElementById('login-error'),
            sidebar: document.getElementById('sidebar'),
            viewContainer: document.getElementById('view-container'),
            viewTitle: document.getElementById('view-title'),
            userInitials: document.getElementById('user-initials'),
            userEmailDisplay: document.getElementById('user-email-display'),
            logoutButton: document.getElementById('logout-button'),
            mainDepositBtn: document.getElementById('main-deposit-btn'),
            adminNavLink: document.getElementById('admin-nav-link'),
            totalBalanceUsd: document.getElementById('total-balance-usd'),
            walletBalancesContainer: document.getElementById('wallet-balances-container'),
            transactionsTableBody: document.getElementById('transactions-table-body'),
            activityChart: document.getElementById('activity-chart').getContext('2d'),
            toast: document.getElementById('toast'),
            toastIcon: document.getElementById('toast-icon'),
            toastMessage: document.getElementById('toast-message'),
            modalOverlay: document.getElementById('modal-overlay'),
            modalContent: document.getElementById('modal-content'),
            
            depositView: {
                fiatTab: document.getElementById('deposit-fiat-tab'),
                cryptoTab: document.getElementById('deposit-crypto-tab'),
                fiatContent: document.getElementById('deposit-fiat-content'),
                cryptoContent: document.getElementById('deposit-crypto-content'),
                fiatForm: document.getElementById('fiat-deposit-form'),
                fiatAmount: document.getElementById('fiat-amount'),
                generateAddressBtn: document.getElementById('generate-address-btn'),
                cryptoAddressContainer: document.getElementById('crypto-address-container'),
                cryptoAddress: document.getElementById('crypto-address'),
                copyAddressBtn: document.getElementById('copy-address-btn'),
                cryptoDepositDone: document.getElementById('crypto-deposit-done'),
            },
            withdrawView: {
                form: document.getElementById('withdraw-form'),
                amount: document.getElementById('withdraw-amount'),
            },
            exchangeView: {
                fromAmount: document.getElementById('from-amount'),
                fromCurrency: document.getElementById('from-currency'),
                fromBalance: document.getElementById('from-balance'),
                toAmount: document.getElementById('to-amount'),
                toCurrency: document.getElementById('to-currency'),
                toBalance: document.getElementById('to-balance'),
                swapBtn: document.getElementById('swap-currencies-btn'),
                executeBtn: document.getElementById('execute-exchange-btn'),
                quoteContainer: document.getElementById('quote-container'),
            },
            adminView: {
                walletBalances: document.getElementById('admin-wallet-balances'),
                form: document.getElementById('admin-withdraw-form'),
            }
        },

        init() {
            lucide.createIcons();
            this.addEventListeners();
        },

        addEventListeners() {
            this.selectors.loginForm.addEventListener('submit', this.handleLogin.bind(this));
            this.selectors.logoutButton.addEventListener('click', this.handleLogout.bind(this));
            this.selectors.sidebar.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', (e) => this.showView(e.currentTarget.dataset.view));
            });
            this.selectors.mainDepositBtn.addEventListener('click', () => this.showView('deposit-view'));
            
            const dv = this.selectors.depositView;
            dv.fiatTab.addEventListener('click', () => this.switchDepositTab('fiat'));
            dv.cryptoTab.addEventListener('click', () => this.switchDepositTab('crypto'));
            dv.fiatForm.addEventListener('submit', this.handleFiatDeposit.bind(this));
            dv.generateAddressBtn.addEventListener('click', this.handleGenerateCryptoAddress.bind(this));
            dv.copyAddressBtn.addEventListener('click', this.handleCopyAddress.bind(this));
            dv.cryptoDepositDone.addEventListener('click', () => this.showView('dashboard-view'));

            this.selectors.withdrawView.form.addEventListener('submit', this.handleWithdrawal.bind(this));

            const ev = this.selectors.exchangeView;
            ev.swapBtn.addEventListener('click', this.handleSwapCurrencies.bind(this));
            [ev.fromAmount, ev.fromCurrency, ev.toCurrency].forEach(el => {
                el.addEventListener('input', () => this.getExchangeQuote());
                el.addEventListener('change', () => this.getExchangeQuote());
            });
            ev.executeBtn.addEventListener('click', this.handleExecuteExchange.bind(this));

            this.selectors.adminView.form.addEventListener('submit', this.handleAdminWithdrawal.bind(this));
        },

        async handleLogin(e) {
            e.preventDefault();
            const button = e.target.querySelector('button[type="submit"]');
            this.toggleButtonLoading(button, true, 'Signing In...');
            this.selectors.loginError.classList.add('hidden');
            
            const { email, password } = this.selectors.loginForm;
            const response = await apiClient.login(email.value, password.value);

            if (response.success) {
                this.state.user = response.user;
                this.selectors.loginSection.classList.add('hidden');
                this.selectors.dashboardSection.classList.remove('hidden');
                this.setupDashboard();
                await this.updateDashboardData();
                this.showToast('Login successful!', 'success');
            } else {
                this.selectors.loginError.textContent = response.message;
                this.selectors.loginError.classList.remove('hidden');
            }
            this.toggleButtonLoading(button, false, 'Sign In');
        },
        
        handleLogout(e) {
            e.preventDefault();
            this.state = { ...this.state, user: null, wallets: [], transactions: [], currentView: 'dashboard-view' };
            if (this.state.chart) {
                this.state.chart.destroy();
                this.state.chart = null;
            }
            this.selectors.dashboardSection.classList.add('hidden');
            this.selectors.loginSection.classList.remove('hidden');
            this.selectors.loginForm.reset();
            this.showToast('You have been logged out.', 'info');
        },
        
        setupDashboard() {
            this.selectors.userEmailDisplay.textContent = this.state.user.email;
            this.selectors.userInitials.textContent = this.state.user.email.substring(0, 2).toUpperCase();
            this.selectors.adminNavLink.classList.toggle('hidden', this.state.user.role !== 'admin');
            this.showView('dashboard-view');
        },

        async updateDashboardData() {
            if(this.state.currentView === 'dashboard-view') this.renderSkeletons();

            const response = await apiClient.fetchDashboardData(this.state.user.id);
            if (response.success) {
                this.state.wallets = response.data.wallets;
                this.state.transactions = response.data.transactions;
                await this.renderAll();
            } else {
                this.showToast('Failed to load dashboard data.', 'error');
                this.selectors.walletBalancesContainer.innerHTML = '<p class="text-sm text-muted-foreground">Could not load wallet data.</p>';
                this.selectors.transactionsTableBody.innerHTML = '<tr><td colspan="5" class="text-center p-4 text-muted-foreground">Could not load transactions.</td></tr>';
            }
        },
        
        async renderAll() {
            this.renderWallets();
            this.renderTransactions();
            this.updateChart();
            await this.updateTotalBalance();
        },

        renderWallets() {
            const container = this.selectors.walletBalancesContainer;
            container.innerHTML = '';
            if (this.state.wallets.length === 0) {
                 container.innerHTML = `<p class="text-sm text-muted-foreground p-4">No wallets found.</p>`;
                 return;
            }
            this.state.wallets.forEach(wallet => {
                const walletDiv = document.createElement('div');
                walletDiv.className = 'flex justify-between items-center';
                walletDiv.innerHTML = `
                    <div>
                        <p class="font-semibold text-primary-foreground">${wallet.currency}</p>
                        <p class="text-xs text-muted-foreground">Balance</p>
                    </div>
                    <p class="font-mono text-lg">${wallet.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                `;
                container.appendChild(walletDiv);
            });
        },

        renderTransactions() {
            const tbody = this.selectors.transactionsTableBody;
            tbody.innerHTML = '';
             if (this.state.transactions.length === 0) {
                 tbody.innerHTML = `<tr><td colspan="5" class="text-center p-8 text-muted-foreground">No transactions yet.</td></tr>`;
                 return;
            }
            this.state.transactions.slice(0, 10).forEach(tx => {
                const statusClass = `status-${tx.status.toLowerCase()}`;
                const amountClass = tx.amount > 0 ? 'text-green-400' : 'text-red-400';
                const amountPrefix = tx.amount > 0 ? '+' : '';

                const row = document.createElement('tr');
                row.className = 'border-b border-border hover:bg-card-hover';
                row.innerHTML = `
                    <td class="p-4 whitespace-nowrap">${new Date(tx.date).toLocaleDateString()}</td>
                    <td class="p-4 whitespace-nowrap">${tx.type}</td>
                    <td class="p-4">${tx.details}</td>
                    <td class="p-4 text-right font-mono ${amountClass} whitespace-nowrap">${amountPrefix}${Math.abs(tx.amount).toLocaleString('en-US', {minimumFractionDigits: 2})} ${tx.currency}</td>
                    <td class="p-4 text-center"><span class="status-badge ${statusClass}">${tx.status}</span></td>
                `;
                tbody.appendChild(row);
            });
        },

        async updateTotalBalance() {
            let totalUsd = 0;
            for (const wallet of this.state.wallets) {
                let rate = 1;
                if (wallet.currency !== 'USD') {
                    const rateResponse = await apiClient.getExchangeRate(wallet.currency, 'USD');
                    if(rateResponse.success) rate = rateResponse.rate;
                }
                totalUsd += wallet.balance * rate;
            }
            this.selectors.totalBalanceUsd.textContent = totalUsd.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        },

        updateChart() {
            if (this.state.chart) this.state.chart.destroy();
            const labels = this.state.transactions.map(tx => new Date(tx.date).toLocaleDateString()).reverse();
            const data = this.state.transactions.map(tx => Math.abs(tx.amount)).reverse();
            
            this.state.chart = new Chart(this.selectors.activityChart, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Transaction Volume',
                        data: data,
                        borderColor: 'var(--primary)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        fill: true,
                        tension: 0.4,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'var(--muted-foreground)' } },
                        x: { grid: { display: false }, ticks: { color: 'var(--muted-foreground)' } }
                    },
                    plugins: { legend: { display: false } }
                }
            });
        },

        showView(viewId) {
            this.selectors.viewContainer.querySelectorAll('.view-content').forEach(view => view.classList.add('hidden'));
            document.getElementById(viewId).classList.remove('hidden');
            
            this.selectors.sidebar.querySelectorAll('.nav-link').forEach(link => {
                link.classList.toggle('active', link.dataset.view === viewId);
            });
            
            const newTitle = this.selectors.sidebar.querySelector(`.nav-link[data-view="${viewId}"]`).textContent.trim();
            this.selectors.viewTitle.textContent = newTitle;

            if (viewId === 'exchange-view') this.updateExchangeBalances();
            if (viewId === 'admin-view' && this.state.user.role === 'admin') this.loadAdminData();
            this.state.currentView = viewId;
        },

        toggleButtonLoading(button, isLoading, loadingText = '') {
            if (!button) return;
            button.disabled = isLoading;
            if (isLoading) {
                const originalText = button.innerHTML;
                button.dataset.originalText = originalText;
                button.innerHTML = `<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> ${loadingText}`;
            } else {
                button.innerHTML = button.dataset.originalText || 'Submit';
            }
        },

        showToast(message, type = 'info') {
            const icons = {
                success: '<i data-lucide="check-circle" class="text-green-400"></i>',
                error: '<i data-lucide="x-circle" class="text-red-400"></i>',
                info: '<i data-lucide="info" class="text-blue-400"></i>'
            };
            this.selectors.toastIcon.innerHTML = icons[type];
            this.selectors.toastMessage.textContent = message;
            lucide.createIcons();
            this.selectors.toast.classList.remove('opacity-0', 'translate-y-[-20px]');
            setTimeout(() => {
                this.selectors.toast.classList.add('opacity-0', 'translate-y-[-20px]');
            }, 3000);
        },
        
        switchDepositTab(tab) {
            const dv = this.selectors.depositView;
            dv.fiatTab.classList.toggle('active', tab === 'fiat');
            dv.cryptoTab.classList.toggle('active', tab === 'crypto');
            dv.fiatContent.classList.toggle('hidden', tab !== 'fiat');
            dv.cryptoContent.classList.toggle('hidden', tab !== 'crypto');
        },

        async handleFiatDeposit(e) {
            e.preventDefault();
            const button = e.target.querySelector('button[type="submit"]');
            this.toggleButtonLoading(button, true, 'Initiating...');
            
            const amount = this.selectors.depositView.fiatAmount.value;
            const response = await apiClient.initiateFiatDeposit(this.state.user.id, amount);

            if (response.success) {
                this.state.transactions.unshift(response.transaction);
                await this.renderAll();
                this.showToast(`Deposit of $${amount} initiated.`, 'success');
                this.selectors.depositView.fiatAmount.value = '';
                this.showView('dashboard-view');
            } else {
                this.showToast(response.message, 'error');
            }
            this.toggleButtonLoading(button, false, 'Initiate Deposit');
        },

        async handleGenerateCryptoAddress() {
            const button = this.selectors.depositView.generateAddressBtn;
            this.toggleButtonLoading(button, true, 'Generating...');
            const response = await apiClient.generateCryptoAddress(this.state.user.id, 'USDT');

            if (response.success) {
                const dv = this.selectors.depositView;
                dv.cryptoAddress.textContent = response.address;
                dv.cryptoAddressContainer.classList.remove('hidden');
                dv.generateAddressBtn.classList.add('hidden');
            } else {
                this.showToast('Failed to generate address.', 'error');
            }
            this.toggleButtonLoading(button, false, 'Generate Deposit Address');
        },
        
        handleCopyAddress() {
            const address = this.selectors.depositView.cryptoAddress.textContent;
            navigator.clipboard.writeText(address).then(() => {
                this.showToast('Address copied to clipboard!', 'success');
            });
        },

        async handleWithdrawal(e) {
            e.preventDefault();
            const button = e.target.querySelector('button[type="submit"]');
            const amount = parseFloat(this.selectors.withdrawView.amount.value);
            const currency = 'USDT';

            const wallet = this.state.wallets.find(w => w.currency === currency);
            if (!wallet || wallet.balance < amount) {
                this.showToast(`Insufficient ${currency} balance.`, 'error');
                return;
            }

            this.toggleButtonLoading(button, true, 'Processing...');
            const response = await apiClient.initiateWithdrawal(this.state.user.id, currency, amount);
            
            if (response.success) {
                this.state.transactions.unshift(response.transaction);
                this.showToast(`Withdrawal of ${amount} USDT initiated.`, 'success');
                e.target.reset();
                await this.updateDashboardData();
                this.showView('dashboard-view');
            } else {
                this.showToast(response.message, 'error');
            }
            this.toggleButtonLoading(button, false, 'Initiate Withdrawal');
        },

        updateExchangeBalances() {
            const ev = this.selectors.exchangeView;
            const fromWallet = this.state.wallets.find(w => w.currency === ev.fromCurrency.value);
            const toWallet = this.state.wallets.find(w => w.currency === ev.toCurrency.value);
            
            ev.fromBalance.textContent = `Balance: ${fromWallet ? fromWallet.balance.toFixed(2) : '0.00'}`;
            ev.toBalance.textContent = `Balance: ${toWallet ? toWallet.balance.toFixed(2) : '0.00'}`;
        },

        handleSwapCurrencies() {
            const ev = this.selectors.exchangeView;
            [ev.fromCurrency.value, ev.toCurrency.value] = [ev.toCurrency.value, ev.fromCurrency.value];
            this.updateExchangeBalances();
            this.getExchangeQuote();
        },
        
        async getExchangeQuote() {
            const ev = this.selectors.exchangeView;
            const fromAmount = parseFloat(ev.fromAmount.value);

            if (!fromAmount || fromAmount <= 0) {
                ev.toAmount.value = '';
                ev.quoteContainer.classList.add('hidden');
                ev.executeBtn.disabled = true;
                return;
            }
            
            const response = await apiClient.getExchangeRate(ev.fromCurrency.value, ev.toCurrency.value);
            if (response.success) {
                const toAmount = fromAmount * response.rate;
                ev.toAmount.value = toAmount.toFixed(6);
                ev.quoteContainer.textContent = `1 ${ev.fromCurrency.value} ≈ ${response.rate.toFixed(4)} ${ev.toCurrency.value}`;
                ev.quoteContainer.classList.remove('hidden');
                
                const fromWallet = this.state.wallets.find(w => w.currency === ev.fromCurrency.value);
                ev.executeBtn.disabled = !fromWallet || fromWallet.balance < fromAmount;
            }
        },
        
        async handleExecuteExchange() {
            const ev = this.selectors.exchangeView;
            const button = ev.executeBtn;
            const fromAmount = parseFloat(ev.fromAmount.value);
            const { fromCurrency, toCurrency } = ev;

            const fromWallet = this.state.wallets.find(w => w.currency === fromCurrency.value);
            if (!fromWallet || fromWallet.balance < fromAmount) {
                this.showToast(`Insufficient ${fromCurrency.value} balance.`, 'error');
                return;
            }

            this.toggleButtonLoading(button, true, 'Exchanging...');
            const response = await apiClient.executeExchange(this.state.user.id, fromCurrency.value, toCurrency.value, fromAmount);
            
            if (response.success) {
                this.showToast(`Successfully exchanged ${fromAmount} ${fromCurrency.value}.`, 'success');
                ev.fromAmount.value = '';
                ev.toAmount.value = '';
                ev.quoteContainer.classList.add('hidden');
                button.disabled = true;
                await this.updateDashboardData();
                this.showView('dashboard-view');
            } else {
                this.showToast(response.message, 'error');
            }
            this.toggleButtonLoading(button, false, 'Exchange');
        },
        
        handleAdminWithdrawal(e) {
            e.preventDefault();
            const form = e.target;
            const currency = form.querySelector('#admin-withdraw-currency').value;
            const amount = form.querySelector('#admin-withdraw-amount').value;
            const address = form.querySelector('#admin-withdraw-address').value;

            if (!amount || !address) {
                this.showToast('Please fill all fields.', 'error');
                return;
            }

            const modalHTML = `
                <h3 class="text-lg font-bold text-primary-foreground mb-4">Confirm Withdrawal</h3>
                <p class="text-sm text-muted-foreground mb-4">
                    Are you sure you want to withdraw <strong>${amount} ${currency}</strong> to the address <strong class="break-all">${address}</strong>? This action cannot be undone.
                </p>
                <div class="flex justify-end space-x-3 mt-6">
                    <button id="modal-cancel-btn" class="btn-secondary">Cancel</button>
                    <button id="modal-confirm-btn" class="btn-danger">Confirm Withdrawal</button>
                </div>
            `;
            this.showModal(modalHTML);

            document.getElementById('modal-confirm-btn').onclick = async () => {
                const confirmBtn = document.getElementById('modal-confirm-btn');
                this.toggleButtonLoading(confirmBtn, true, 'Processing...');
                
                const response = await apiClient.initiateAdminWithdrawal(currency, amount, address);
                
                this.hideModal();
                if (response.success) {
                    this.showToast(response.message, 'success');
                    form.reset();
                    await this.loadAdminData();
                } else {
                    this.showToast(response.message || 'An error occurred.', 'error');
                }
            };
            
            document.getElementById('modal-cancel-btn').onclick = () => this.hideModal();
        },

        async loadAdminData() {
            const container = this.selectors.adminView.walletBalances;
            container.innerHTML = Array(2).fill('').map(() => `
                <div class="flex justify-between items-center p-3 bg-background rounded-md animate-pulse">
                    <div>
                        <div class="h-6 bg-gray-700 rounded w-20 mb-2"></div>
                        <div class="h-3 bg-gray-700 rounded w-32"></div>
                    </div>
                    <div class="h-7 bg-gray-700 rounded w-40"></div>
                </div>
            `).join('');

            const response = await apiClient.getSystemWallets();
            container.innerHTML = '';
            if (response.success) {
                response.wallets.forEach(wallet => {
                    const div = document.createElement('div');
                    div.className = 'flex justify-between items-center p-3 bg-background rounded-md';
                    div.innerHTML = `
                        <div>
                            <p class="font-bold text-lg">${wallet.currency}</p>
                            <p class="text-xs text-muted-foreground">${wallet.address}</p>
                        </div>
                        <p class="font-mono text-xl">${wallet.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    `;
                    container.appendChild(div);
                });
            } else {
                container.innerHTML = `<p class="text-sm text-muted-foreground">Could not load system wallet data.</p>`;
            }
        },

        renderSkeletons() {
            const { walletBalancesContainer, transactionsTableBody } = this.selectors;
            walletBalancesContainer.innerHTML = Array(2).fill('').map(() => `
                <div class="flex justify-between items-center animate-pulse space-y-4">
                    <div>
                        <div class="h-4 bg-gray-700 rounded w-16 mb-2"></div>
                        <div class="h-3 bg-gray-700 rounded w-12"></div>
                    </div>
                    <div class="h-6 bg-gray-700 rounded w-24"></div>
                </div>
            `).join('<div class="h-px bg-border"></div>');
            transactionsTableBody.innerHTML = Array(5).fill('').map(() => `
                <tr class="border-b border-border animate-pulse">
                    <td class="p-4"><div class="h-4 bg-gray-700 rounded w-20"></div></td>
                    <td class="p-4"><div class="h-4 bg-gray-700 rounded w-16"></div></td>
                    <td class="p-4"><div class="h-4 bg-gray-700 rounded w-24"></div></td>
                    <td class="p-4"><div class="h-4 bg-gray-700 rounded w-28 ml-auto"></div></td>
                    <td class="p-4 text-center"><div class="h-6 bg-gray-700 rounded-full w-20 mx-auto"></div></td>
                </tr>
            `).join('');
        },

        showModal(htmlContent) {
            const { modalOverlay, modalContent } = this.selectors;
            modalContent.innerHTML = htmlContent;
            modalOverlay.classList.remove('hidden');
        },

        hideModal() {
            this.selectors.modalOverlay.classList.add('hidden');
            this.selectors.modalContent.innerHTML = '';
        }
    };

    App.init();
});
