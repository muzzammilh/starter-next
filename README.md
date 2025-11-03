# Next.js Boilerplate

A modern, production-ready Next.js boilerplate with TypeScript and Tailwind CSS.

## Features

- ⚡️ Next.js 16 with App Router
- 🎨 Tailwind CSS 4
- 📘 TypeScript
- 🔍 ESLint configured
- 🌙 Dark mode ready
- 📦 Modular architecture

## Getting Started

### Prerequisites

- Node.js 20+ and npm

### Installation

1. Clone or use this template
2. Install dependencies:

```bash
npm install
```

3. Copy environment variables:

```bash
cp .env.example .env.local
```

4. Update `.env.local` with your configuration values

5. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app.

## Configuration

### Environment Variables

All configurable values should be stored in `.env.local`. See `.env.example` for available options.

### App Metadata

Update the following files with your app information:

- `app/layout.tsx` - Site metadata (title, description)
- `.env.local` - Environment-specific configuration
- `package.json` - Project name and details

### Customization Points

Look for `// TODO:` comments throughout the codebase for values you should customize.

## Project Structure

```
├── app/                # Next.js app directory
│   ├── layout.tsx     # Root layout with metadata
│   ├── page.tsx       # Home page
│   └── globals.css    # Global styles
├── public/            # Static assets
├── .env.example       # Environment variables template
└── .env.local         # Your local environment variables (create this)
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## License

See [LICENSE](LICENSE) file for details.
