# Admin Dashboard Documentation

## Overview
The secure admin dashboard provides comprehensive CRUD operations for match management in the Fight for Glory sports management system.

## Features

### 🔐 Authentication
- Secure admin key authentication using `X-MACET-ADMIN` header
- Session-based login system
- Auto-logout functionality

### 📊 Dashboard Overview
- **Real-time Statistics**: Total matches, live matches, upcoming, and completed
- **Quick Actions**: Create new matches, refresh data
- **Visual Indicators**: Color-coded status badges and progress indicators

### ⚡ Match Management

#### Create Match
- Sport selection from predefined categories
- Team name input (Team A vs Team B)
- Initial score setting
- Status selection (UPCOMING, LIVE, COMPLETED)

#### Edit Match
- Update scores in real-time
- Change match status
- Modify team information
- Instant API synchronization

#### Delete Match
- Soft delete functionality
- Confirmation dialog to prevent accidental deletion
- Immediate UI updates

#### View Matches
- **Filtering**: By sport and status
- **Sorting**: By creation date and status
- **Search**: Real-time match filtering
- **Pagination**: Handle large datasets efficiently

## API Integration

### Endpoints Used
- `GET /api/matches` - Fetch all matches
- `POST /api/matches` - Create new match (Admin only)
- `PUT /api/matches/{id}` - Update match (Admin only)
- `DELETE /api/matches/{id}` - Delete match (Admin only)
- `GET /api/matches/live` - Fetch live matches
- `GET /api/matches/sport/{sport}` - Filter by sport

### Authentication
All admin operations require the `X-MACET-ADMIN` header with a valid admin key.

## Component Structure

```
components/
├── AdminDashboard.tsx     # Main dashboard container
├── MatchForm.tsx         # Create/edit match form
├── MatchList.tsx         # Match listing with filters
└── AdminPanel.tsx        # Authentication and entry point
```

## Usage Instructions

### Accessing the Dashboard
1. Click the admin icon (🔒) in the bottom-right corner
2. Enter your admin access key
3. Click "Authorize Access"
4. The dashboard will open automatically

### Creating a Match
1. Click "Create New Match" button
2. Fill in the required fields:
   - Select sport from dropdown
   - Enter Team A and Team B names
   - Set initial scores (optional)
   - Choose match status
3. Click "Create Match"

### Editing a Match
1. Find the match in the list
2. Click the "Edit" button
3. Modify the desired fields
4. Click "Update Match"

### Deleting a Match
1. Find the match in the list
2. Click "Delete" button
3. Confirm the deletion in the popup
4. Click "Confirm" to permanently delete

## Security Features

### Authentication
- Admin key validation
- Session management
- Automatic logout on session expiry

### Data Validation
- Frontend validation for all inputs
- Team name uniqueness checks
- Score validation (non-negative numbers)
- Required field enforcement

### Error Handling
- Graceful error messages
- API error feedback
- Network failure recovery

## Technical Implementation

### State Management
- React hooks for local state
- Real-time data synchronization
- Optimistic updates for better UX

### UI/UX Features
- Responsive design for all screen sizes
- Loading states and skeletons
- Smooth transitions and animations
- Color-coded status indicators
- Hover effects and micro-interactions

### Performance Optimizations
- Efficient data fetching
- Component memoization
- Debounced search/filter operations
- Lazy loading for large datasets

## Supported Sports

The dashboard supports all sports defined in the system:
- Cricket
- Volleyball
- Carrom
- Kabaddi
- Football
- Badminton
- Chess
- Race
- Tug of War
- Ludo
- Musical Chair
- Kho-Kho

## Match Status Types

- **UPCOMING**: Match scheduled but not started
- **LIVE**: Match currently in progress
- **COMPLETED**: Match finished with final scores

## Styling and Design

### Color Scheme
- **Primary**: Rose/Orange gradient for actions
- **Status**: Green (Live), Blue (Upcoming), Slate (Completed)
- **Background**: Dark slate theme with glass morphism effects

### Responsive Design
- Mobile-first approach
- Adaptive layouts for tablets and desktops
- Touch-friendly controls

## Future Enhancements

### Planned Features
- Bulk match operations
- Advanced analytics and reporting
- Match scheduling system
- Team management module
- Live score updates via WebSocket
- Export functionality (CSV, PDF)
- Audit logs for admin actions

### Technical Improvements
- Real-time updates using WebSockets
- Offline functionality
- Advanced search capabilities
- Customizable dashboard widgets

## Troubleshooting

### Common Issues
1. **Authentication Failed**: Verify admin key is correct
2. **Match Not Creating**: Check all required fields are filled
3. **Data Not Refreshing**: Use manual refresh button
4. **Delete Not Working**: Ensure you have admin privileges

### Error Messages
- "Failed to fetch matches": Check network connection
- "Operation failed": Verify admin permissions
- "All fields are required": Complete the form properly

## Support

For technical support or feature requests, please contact the development team or create an issue in the project repository.
