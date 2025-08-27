# Hydra Platform - Complete Financial & Gaming Suite

A comprehensive web application that merges three major components into one unified platform:

1. **ApexPay Financial Dashboard** - Complete financial management system
2. **BitBetWin Gaming Platform** - Interactive gaming hub with coin flip and other games
3. **Code Explorer** - Development tools and project file viewer

## 🚀 Features

### Financial Management
- **Multi-Currency Wallets** - Support for USD and USDT (TRC-20)
- **Deposit System** - Fiat deposits via Cash App and crypto deposits
- **Withdrawal System** - Bank withdrawals and crypto transfers
- **Currency Exchange** - Real-time exchange between USD and USDT
- **Transaction History** - Complete audit trail of all activities
- **Admin Panel** - Administrative controls for hot/cold wallet management

### Gaming Platform
- **Coin Flip Game** - Classic 50/50 chance game with USDT betting
- **Gaming Statistics** - Track games played, total wagered, and P&L
- **Real-time Balance Updates** - Instant wallet updates after game results
- **Provably Fair** - Transparent game mechanics

### Development Tools
- **Code Explorer** - Browse and view project source code
- **File Tree Navigation** - Organized project structure viewer
- **Syntax Highlighting** - Color-coded JavaScript, HTML, and CSS
- **Copy Functionality** - Easy code copying with one-click

### Technical Features
- **Responsive Design** - Works on desktop and mobile devices
- **Dark Theme** - Modern dark UI with custom CSS variables
- **Real-time Updates** - Live charts and instant notifications
- **Local Storage** - Persistent user sessions
- **Mock API** - Complete simulated backend for demonstration

## 🛠 Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Tailwind CSS with custom CSS variables
- **Charts**: Chart.js for financial data visualization
- **Icons**: Lucide React icons
- **Fonts**: Inter & Roboto Mono from Google Fonts

## 📦 Installation & Setup

1. **Clone or download** the project files
2. **Ensure all files** are in the same directory:
   - `index.html`
   - `style.css`
   - `main.js`
   - `apiClient.js`
   - `fileData.js`

3. **Open** `index.html` in your web browser

## 🔐 Default Login Credentials

- **Email**: `admin@hydra.io`
- **Password**: `password123`

## 🎮 How to Use

### Getting Started
1. Open the application in your web browser
2. Log in using the default credentials
3. Explore the different sections using the sidebar navigation

### Financial Operations
- **Deposit Funds**: Go to Deposit → Choose Fiat or Crypto → Enter amount
- **Withdraw Funds**: Go to Withdraw → Enter amount and destination
- **Exchange Currency**: Go to Exchange → Set amounts and currencies → Execute
- **View Transactions**: Check the Dashboard for recent activity

### Gaming
- **Access Games**: Go to Gaming Hub → Select a game
- **Play Coin Flip**: Choose heads/tails → Enter bet amount → Place bet
- **View Stats**: Check Gaming Hub for your performance statistics

### Code Exploration
- **Browse Code**: Go to Code Explorer → Click on files in the tree
- **View Source**: See syntax-highlighted code in the main panel
- **Copy Code**: Use the copy button to copy code snippets

## 🏗 Architecture

### Frontend Architecture
```
Hydra Platform/
├── src/
│   ├── main.js          # Main application logic
│   ├── apiClient.js     # Simulated API layer
│   ├── components/      # UI components
│   └── utils/           # Utility functions
├── public/
│   ├── index.html       # Main HTML structure
│   └── style.css        # Custom styling
└── README.md           # Documentation
```

### Key Components
- **App State Management** - Centralized state in main.js
- **API Abstraction** - Clean separation with apiClient.js
- **Responsive UI** - Mobile-first design approach
- **Modular Code** - Separated concerns for maintainability

## 🔧 Customization

### Adding New Games
1. Create game logic in the Gaming class
2. Add UI components to the gaming dashboard view
3. Update the game selection interface
4. Implement game-specific betting and result handling

### Extending Financial Features
1. Add new currency support in apiClient.js
2. Update wallet rendering logic
3. Extend exchange rate calculations
4. Add new transaction types

### Styling Modifications
1. Update CSS variables in `:root` for theme changes
2. Modify component classes for layout changes
3. Add new utility classes as needed

## 🚀 Deployment

This is a static web application that can be deployed to:
- **GitHub Pages**
- **Netlify**
- **Vercel**
- **Any static web hosting service**

Simply upload all files to your hosting provider.

## 🔒 Security Notes

⚠️ **Important**: This is a demonstration application with simulated backend functionality.

- All transactions are simulated
- No real money is involved
- Data is stored locally in browser storage
- Not suitable for production use without proper backend integration

## 🤝 Contributing

This project combines multiple development efforts:
- **Project Hydra** - Financial platform base
- **BitBetWin** - Gaming platform integration
- **ApexPay** - Payment system simulation

## 📄 License

This project is for demonstration purposes. Please respect the original work and licenses of the integrated components.

## 🆘 Support

For questions or issues:
1. Check the browser console for error messages
2. Ensure all files are properly loaded
3. Verify browser compatibility (modern browsers required)
4. Clear browser cache if experiencing issues

---

**Built with ❤️ by the Hydra Platform Team**