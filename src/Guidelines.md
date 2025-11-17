# FlashMind Platform Development Guidelines

## Project Overview
FlashMind is an AI-powered learning platform that creates intelligent flashcards from various content types (PDFs, images, videos, text) and provides comprehensive analytics and study tracking.

## Design System Guidelines

### Color Palette (Light Theme)
- **Primary Background**: `#F8FAFC` (bg-light-bg) - Main page background
- **Card Background**: `#FFFFFF` (bg-light-card) - Card and component backgrounds
- **Primary Text**: `#1E293B` (text-light-primary) - Headings and primary content
- **Secondary Text**: `#64748B` (text-light-secondary) - Descriptions and secondary content
- **CTA Color**: `#3B82F6` (text-light-cta/bg-light-cta) - Primary buttons and links
- **Success**: `#22C55E` (text-light-positive) - Positive metrics and success states
- **Error**: `#EF4444` (text-light-negative) - Errors and negative states
- **Borders**: `#E2E8F0` (border-light-color) - Card borders and dividers
- **Hover**: `#F1F5F9` (bg-light-hover) - Hover states and subtle backgrounds

### Typography Standards
- **Base font size**: 14px (defined in globals.css)
- **Font family**: Inter, system-ui, sans-serif
- **Headings**: Always use the predefined heading styles from globals.css
- **Body text**: Use default paragraph styling (14px, light-secondary color)
- **Labels**: Use default label styling (14px, medium weight, light-primary color)
- **DO NOT override**: font-size, font-weight, or line-height classes unless specifically requested

### Component Standards

#### Cards
- **Class**: Use `light-card` utility class for consistent card styling
- **Structure**: Always include proper padding and border radius
- **Hover effects**: Use `hover:light-shadow-lg hover:scale-105` for interactive cards
- **Spacing**: Use `p-6` for card content padding

#### Buttons
- **Primary**: Use `light-button-primary` class with hover effects
- **Secondary**: Use `light-button-secondary` class
- **Padding**: Default button padding is handled by utility classes
- **Border radius**: Always use `rounded-xl` (12px)
- **Transitions**: Include `transition-all duration-200 ease-in-out`

#### Navigation
- **Items**: Use `light-nav-item` class for navigation items
- **Active state**: Use `light-nav-item-active` class
- **Icons**: Use 20px (w-5 h-5) for navigation icons
- **Gap**: Use `gap-3` between icon and text

#### Analytics Components
- **Metrics**: Use large text sizes (text-2xl, text-3xl) for key numbers
- **Positive trends**: Use `text-light-positive` class
- **Negative trends**: Use `text-light-negative` class
- **Charts**: Use chart color variables (--chart-1 through --chart-5)
- **Grid layouts**: Use responsive grids (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)

### Layout Guidelines
- **Max width**: Use `max-w-7xl mx-auto` for main content containers
- **Spacing**: Use consistent Tailwind spacing scale (4, 6, 8, 12, 16, 24)
- **Page background**: Always use `bg-light-bg` for page backgrounds
- **Responsive design**: Mobile-first approach with proper breakpoints
- **Sidebar**: Use headerless design for all pages except Dashboard

### Animation Guidelines
- **Page transitions**: Use fade-in and slide-in with staggered animations
- **Duration**: Use 700ms for page transitions, 200ms for micro-interactions
- **Hover effects**: Keep subtle (scale-105, shadow changes)
- **Loading states**: Use spinning loaders with blue accent color
- **Stagger delays**: Use 100ms, 200ms, 300ms increments for animation delays

### Accessibility Standards
- **Color contrast**: All text meets WCAG AA standards with our color palette
- **Focus states**: Include `focus:ring-2 focus:ring-blue-500` on interactive elements
- **Alt text**: Always include descriptive alt text for images
- **ARIA labels**: Use aria-label for buttons without visible text
- **Keyboard navigation**: Ensure all interactive elements are keyboard accessible

## FlashMind-Specific Guidelines

### Dashboard Structure
- **5 Main Sections**: Dashboard, Upload Studio, Study Mode, Community, Analytics
- **Sidebar Navigation**: Always show active state with proper highlighting
- **Quick Actions**: Include prominent CTA buttons for main user flows
- **Progress Tracking**: Display learning metrics and progress bars
- **Responsive Cards**: Use grid layouts that adapt to screen size

### Upload Studio
- **Drag & Drop**: Large, prominent drop zone with visual feedback
- **File Types**: Support PDF, images, text files, Word documents
- **Processing States**: Show loading, processing, and success states
- **Card Generation**: Display AI-generated flashcards with preview
- **Error Handling**: Clear error messages for unsupported files

### Study Mode
- **Card Interface**: Clean, focused flashcard display
- **Spaced Repetition**: Implement confidence-based scheduling
- **Progress Tracking**: Show session progress and performance metrics
- **Interactive Elements**: Flip animations and smooth transitions
- **Mobile Optimized**: Ensure great experience on mobile devices

### Analytics Dashboard
- **Performance Metrics**: Track accuracy, retention, study time
- **AI Model Insights**: Show model performance and optimization data
- **Visual Charts**: Use Recharts with consistent color scheme
- **Knowledge Graphs**: Network-style visualizations for learning paths
- **Personalized Insights**: AI tutor recommendations and insights

### Community Features
- **Deck Discovery**: Grid layout with search and filtering
- **Social Elements**: User profiles, ratings, and sharing
- **Search & Filter**: Advanced filtering by subject, difficulty, tags
- **Responsive Design**: Card-based layout that works on all devices

## Code Standards

### File Organization
- **Components**: Place reusable components in `/components`
- **Pages**: Use existing page structure in `/components` for different sections
- **UI Components**: Use shadcn/ui components from `/components/ui`
- **Types**: Define TypeScript interfaces at component level
- **Utilities**: Helper functions in separate files when needed

### TypeScript Guidelines
- **Always use TypeScript**: All files should be `.tsx` format
- **Interface definitions**: Define props interfaces for all components
- **Type safety**: Use proper typing for all variables and functions
- **Component props**: Always destructure props with proper typing

### Import Standards
- **Group imports**: React first, then libraries, then local components
- **UI components**: Import shadcn components from `./components/ui/`
- **Icons**: Use lucide-react for all icons
- **Charts**: Use recharts for data visualization

### Performance Guidelines
- **Component splitting**: Keep components focused and split when necessary
- **Lazy loading**: Use React.lazy for page components when appropriate
- **Image optimization**: Use appropriate image sizes and formats
- **Animation performance**: Use CSS transforms instead of layout properties

## Development Workflow

### VS Code Setup
1. Install recommended extensions:
   - TypeScript Hero
   - Tailwind CSS IntelliSense
   - ES7+ React/Redux/React-Native snippets
   - Auto Rename Tag

2. Use integrated terminal for commands
3. Enable format on save for consistent code style
4. Use TypeScript strict mode for better type safety

### Testing Guidelines
- **Manual testing**: Test all interactive elements and animations
- **Responsive testing**: Verify layouts work on mobile, tablet, desktop
- **Accessibility testing**: Check keyboard navigation and screen reader support
- **Performance testing**: Monitor bundle size and load times

### Best Practices
- **Consistent naming**: Use PascalCase for components, camelCase for functions
- **Code organization**: Keep related functionality grouped together
- **Documentation**: Add comments for complex logic or business rules
- **Error handling**: Graceful error handling with user-friendly messages
- **Loading states**: Always provide feedback during async operations

## Quality Checklist

Before considering a feature complete:
- [ ] Responsive design works on all screen sizes
- [ ] Proper TypeScript typing throughout
- [ ] Consistent use of design system colors and spacing
- [ ] Smooth animations and transitions
- [ ] Accessibility standards met (focus states, ARIA labels)
- [ ] Error handling and loading states implemented
- [ ] Code is clean, commented, and follows conventions
- [ ] Performance is optimized (no unnecessary re-renders)
- [ ] User experience is intuitive and matches FlashMind's vision