# VocAI - AI-Powered Call Analysis & Conversation Insights

VocAI is a modern web application that transforms phone calls into actionable business intelligence using advanced AI technology. The platform parses calls, extracts conversations in chat-like format, and provides deep analysis including sentiment analysis, key topics, and action items.

## 🎨 Design Philosophy

The design incorporates a carefully chosen color scheme that reflects the core concept:

- **Green (Primary)**: Represents growth, success, and positive outcomes from call analysis
- **Red (Accent)**: Symbolizes urgency, important insights, and attention-grabbing elements
- **White**: Provides clean, professional contrast and readability
- **Complementary Colors**: Subtle grays and accent colors for a polished, modern look

## ✨ Features

### Core Functionality

- **AI-Powered Call Parsing**: 99.2% accuracy in transcription and conversation extraction
- **Chat-Like Format**: Transform audio into structured, readable conversations
- **Real-time Processing**: Process calls in seconds with cloud-based AI infrastructure
- **Multi-language Support**: Handle calls in 50+ languages

### Analytics & Insights

- **Sentiment Analysis**: Track emotional tone and customer satisfaction
- **Key Topic Extraction**: Identify main discussion points and themes
- **Action Item Detection**: Automatically identify follow-up tasks and requirements
- **Performance Metrics**: Monitor call quality and agent performance over time

### Enterprise Features

- **Bank-level Security**: GDPR, HIPAA, and SOC 2 compliance
- **Team Collaboration**: Share insights and collaborate on analysis
- **API Integration**: Connect with existing CRM and analytics tools
- **Export Options**: Multiple format support for data portability

## 🚀 Technology Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion for smooth, engaging interactions
- **Icons**: Lucide React for consistent iconography
- **Responsive Design**: Mobile-first approach with modern UI/UX patterns

## 🛠️ Installation & Setup

### Prerequisites

- Node.js 18+
- npm or yarn package manager

### Quick Start

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd VocAI
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables**

   Copy the template and fill in your keys:

   ```bash
   cp .env.example .env.local
   ```

   For Supabase, make sure `NEXT_PUBLIC_SUPABASE_URL` is the **API URL** (format: `https://<project-ref>.supabase.co`), not a dashboard URL.

4. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## 📱 Responsive Design

The application is built with a mobile-first approach and includes:

- Responsive grid layouts that adapt to all screen sizes
- Touch-friendly interactions for mobile devices
- Optimized typography and spacing for readability
- Progressive enhancement for modern browsers

## 🎯 Key Components

### Header

- Fixed navigation with smooth scrolling
- Mobile-responsive menu
- Brand identity with animated logo

### Hero Section

- Compelling value proposition
- Interactive call-to-action buttons
- Key statistics and social proof

### Features Grid

- 8 core features with icons and descriptions
- Hover effects and smooth animations
- Consistent visual hierarchy

### How It Works

- Step-by-step process explanation
- Visual flow with connecting elements
- Interactive elements and call-to-actions

### Demo Section

- Interactive call analysis demonstration
- Real conversation examples
- Live insights and analytics display

### Footer

- Comprehensive site navigation
- Company information and contact details
- Social media integration

## 🎨 Design System

### Color Palette

```css
/* Primary Colors (Green) */
primary-50: #f0fdf4
primary-500: #22c55e
primary-600: #16a34a

/* Accent Colors (Red) */
accent-500: #ef4444
accent-600: #dc2626

/* Neutral Colors */
neutral-50: #fafafa
neutral-900: #171717
```

### Typography

- **Primary Font**: Inter (Google Fonts)
- **Monospace Font**: JetBrains Mono
- **Font Weights**: 300, 400, 500, 600, 700

### Animations

- **Fade In**: Smooth opacity transitions
- **Slide Up**: Subtle upward movements
- **Hover Effects**: Interactive feedback
- **Staggered Animations**: Sequential element reveals

## 🔧 Customization

### Adding New Features

1. Create new components in the `components/` directory
2. Import and integrate in `app/page.tsx`
3. Follow the established design patterns and color scheme

### Modifying Colors

1. Update `tailwind.config.js` with new color values
2. Modify `app/globals.css` for custom CSS classes
3. Ensure consistency across all components

### Adding Animations

1. Use Framer Motion for complex animations
2. Follow the established animation patterns
3. Maintain performance with proper transition timing

## 📊 Performance

- **Lighthouse Score**: Optimized for performance, accessibility, and SEO
- **Bundle Size**: Minimal JavaScript with tree-shaking
- **Image Optimization**: Next.js automatic image optimization
- **Code Splitting**: Automatic route-based code splitting

## 🌐 Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+
- **Progressive Enhancement**: Graceful degradation for older browsers

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

- **Email**: hello@vocai.com
- **Phone**: +1 (555) 123-4567
- **Documentation**: [docs.vocai.com](https://docs.vocai.com)
- **Status**: [status.vocai.com](https://status.vocai.com)

---

Built with ❤️ by the VocAI Team
