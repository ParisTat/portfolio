# Portfolio Website

A modern, responsive portfolio website built with React, TypeScript, and Vite. This project showcases my development skills and featured projects in a clean, professional design.

## 🚀 Features

- **Modern Design**: Clean, professional layout with dark theme
- **Responsive**: Fully responsive design that works on all devices
- **Interactive Elements**: Smooth scrolling, hover effects, and animations
- **Project Showcase**: Featured projects with live demos and source code links
- **Contact Section**: Easy ways to get in touch
- **Performance Optimized**: Built with Vite for fast development and production builds

## 🛠️ Tech Stack

- **Frontend**: React 19.1.1
- **Language**: TypeScript 5.8.2
- **Build Tool**: Vite 6.2.0
- **Styling**: Tailwind CSS (implied from project structure)
- **Icons**: Custom SVG components

## 📁 Project Structure

```
Portfolio/
├── components/          # React components
│   ├── Header.tsx      # Navigation header
│   ├── Hero.tsx        # Hero section
│   ├── ProjectsSection.tsx  # Featured projects
│   ├── ContactSection.tsx   # Contact form
│   ├── Footer.tsx      # Footer component
│   ├── ProjectCard.tsx # Individual project cards
│   └── icons/          # Custom SVG icons
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── assets/             # Static assets
│   ├── images/         # Project images
│   ├── documents/      # CV and documents
│   └── favicons/       # Website favicons
├── types.ts            # TypeScript type definitions
└── App.tsx             # Main application component
```

## 🚀 Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/portfolio.git
   cd portfolio
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## 🎨 Customization

### Adding New Projects

1. Add your project image to `assets/images/`
2. Import the image in `components/ProjectsSection.tsx`
3. Add your project to the `projects` array with the following structure:

```typescript
{
  id: number,
  title: string,
  description: string,
  imageUrl: string,
  tags: string[],
  liveUrl?: string,
  sourceUrl?: string
}
```

### Styling

The project uses Tailwind CSS for styling. You can customize the design by modifying the classes in the component files.

## 📱 Responsive Design

The portfolio is fully responsive and optimized for:

- Mobile devices (320px+)
- Tablets (768px+)
- Desktop (1024px+)
- Large screens (1280px+)

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Code Structure

- **Components**: Reusable React components in the `components/` directory
- **Hooks**: Custom React hooks in the `hooks/` directory
- **Utils**: Utility functions in the `utils/` directory
- **Types**: TypeScript type definitions in `types.ts`

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📞 Contact

- **Email**: [your-email@example.com](mailto:your-email@example.com)
- **LinkedIn**: [Your LinkedIn Profile](https://linkedin.com/in/yourprofile)
- **GitHub**: [Your GitHub Profile](https://github.com/yourusername)

---

Built with ❤️ by Paris-Rafail Tataridis
