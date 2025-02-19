# View current database version
npm run db:version

# List all versions
npm run db:list

# Rollback to a specific version
npm run db:rollback <version>
```

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Initialize the database: `npm run db:push`
5. Start the development server: `npm run dev`

## Environment Variables

Create a `.env` file with the following variables:

```
DATABASE_URL=postgresql://...
NODE_ENV=development
```

## GitHub Integration

### Initial Setup

1. Create a new repository on GitHub
2. Initialize the local repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

### Development Workflow

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit:
   ```bash
   git add .
   git commit -m "Description of changes"
   ```

3. Push changes and create a pull request:
   ```bash
   git push origin feature/your-feature-name