<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Fight for Glory - Sports Management System

A comprehensive sports management application for tracking and managing multi-sport events with real-time scoring, team management, and administrative controls.

## 🏆 Features

### Core Functionality
- **Multi-Sport Support**: Manage matches across 12+ sports including Cricket, Football, Volleyball, Basketball, Kabaddi, and more
- **Real-Time Scoring**: Live score updates with instant UI updates
- **Team Management**: Create and manage teams with detailed information
- **Match Status Tracking**: Track matches through UPCOMING → LIVE → COMPLETED stages
- **Venue Management**: Multiple venue options for match scheduling

### Administrative Features
- **Admin Controls**: Secure admin authentication and management
- **Match Updates**: Click-to-edit interface for scores and match details
- **Winner Declaration**: Dynamic winner selection for completed matches
- **Sport-Specific Details**: Editable sport metrics (overs, wickets, sets, periods, etc.)
- **Filtering System**: Advanced filtering by sport, gender, venue, and batch

### User Interface
- **Modern Glass-morphism Design**: Sleek, contemporary UI with glass effects
- **Responsive Layout**: Optimized for desktop, tablet, and mobile devices
- **Winner Highlighting**: Visual crown icons and color-coded winner display
- **Real-Time Updates**: Live status indicators and animated transitions
- **Dark Theme**: Professional dark color scheme with gradient accents

### Sports Supported
- **Cricket**: Overs, wickets, current innings tracking
- **Football**: Half-time scores, period tracking
- **Volleyball**: Sets won, current set scores
- **Badminton**: Sets and current set tracking
- **Kabaddi**: Raid points, tackle points
- **Basketball**: Quarters, fouls tracking
- **Musical Chair**: Rounds completed
- **Kho-Kho**: Innings tracking
- **LUDO**: Coins and dice tracking
- **Chess**: Move tracking
- **Carrom**: Points and strikes
- **Race**: Distance tracking
- **Shot Put**: Distance measurements
- **Needle & Thread**: Completion status
- **Spoon Race**: Rounds tracking
- **Tug of War**: Rounds and duration

## 🚀 Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Fight-for-glory
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env.local`
   - Set the `GEMINI_API_KEY` in `.env.local` to your Gemini API key
   - Configure `BASE_URL` for your backend API

4. **Run the application**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🎯 Admin Features

### Match Management
- **Create Matches**: Add new matches with team details, venue, and sport-specific information
- **Update Scores**: Click on scores to edit them directly
- **Edit Details**: Click on any sport-specific detail to update it
- **Change Status**: Toggle between UPCOMING, LIVE, and COMPLETED states
- **Declare Winners**: Select winners from dropdown for completed matches

### Update Mode
- **Single Update Button**: One-click activation of edit mode
- **Click-to-Edit**: Click on any field to update it
- **Visual Feedback**: Hover effects and cursor indicators for editable fields
- **Persistent Instructions**: Update message stays visible while in edit mode

### Filtering System
- **Sport Filter**: Filter matches by specific sports
- **Gender Filter**: Separate Boys/Girls categories
- **Venue Filter**: Filter by playground locations
- **Batch Filter**: Organize matches by batches

## 🏗️ Technical Architecture

### Frontend Technologies
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Font Awesome**: Icon library for UI elements

### State Management
- **React Hooks**: useState, useEffect, useMemo for state management
- **Local State**: Component-level state for UI interactions
- **API Integration**: RESTful API calls for data persistence

### Design System
- **Glass-morphism**: Modern glass effect UI
- **Responsive Grid**: Flexible grid layouts
- **Color Palette**: Slate-based dark theme with amber accents
- **Typography**: Oswald and Orbitron fonts for sports aesthetic

## 🎨 UI/UX Features

### Visual Design
- **Glass Cards**: Frosted glass effect for match cards
- **Gradient Accents**: Glory gradient for important elements
- **Status Indicators**: Color-coded match status with animations
- **Winner Display**: Golden crown icons and highlighting for winners

### Interactions
- **Hover Effects**: Smooth transitions and hover states
- **Click Feedback**: Visual feedback for interactive elements
- **Loading States**: Proper loading indicators
- **Error Handling**: User-friendly error messages

### Accessibility
- **Semantic HTML**: Proper HTML structure
- **Keyboard Navigation**: Accessible keyboard interactions
- **Screen Reader Support**: ARIA labels and descriptions
- **Color Contrast**: WCAG compliant color schemes

## 📱 Responsive Design

### Breakpoints
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

### Adaptive Layout
- **Grid System**: Responsive grid layouts
- **Flexible Typography**: Scalable font sizes
- **Touch-Friendly**: Large touch targets for mobile
- **Optimized Images**: Responsive image handling

## 🔧 Configuration

### Environment Variables
```env
GEMINI_API_KEY=your_gemini_api_key
BASE_URL=http://localhost:8000
ADMIN_KEY=your_admin_key
```

### API Endpoints
- `GET /matches` - Fetch all matches
- `POST /matches` - Create new match
- `PUT /matches/:id` - Update match
- `DELETE /matches/:id` - Delete match

## 🎮 Usage Guide

### For Admins
1. **Login**: Use admin credentials to access management features
2. **Create Matches**: Click "Add Match" to create new matches
3. **Update Matches**: Click "Update Match" button, then click on any field to edit
4. **Manage Scores**: Click on scores to update them in real-time
5. **Declare Winners**: Use winner dropdown for completed matches

### For Viewers
1. **View Matches**: Browse all matches with real-time updates
2. **Filter Results**: Use filters to find specific matches
3. **Track Progress**: Watch matches progress through different stages
4. **View Results**: See completed matches with winner information

## 🤝 Contributing

### Developers
- **Md Al Fahad Ahmed**
- **Seraj Muneer Faridy**
- **Sharique Raza** 

### Development Guidelines
- Follow TypeScript best practices
- Use semantic HTML5 elements
- Implement responsive design principles
- Write clean, maintainable code
- Add proper error handling
- Include accessibility features

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **React Team** - For the amazing React framework
- **Tailwind CSS** - For the excellent CSS framework
- **Font Awesome** - For the comprehensive icon library
- **Sports Community** - For the inspiration and feedback

---

**Built with ❤️ by the Fight for Glory Development Team**
