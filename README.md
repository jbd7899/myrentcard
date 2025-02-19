DATABASE_URL=postgresql://...
NODE_ENV=development
```

## Testing

To run the integration tests:

```bash
npm run test
```

This will execute all tests, including database version control tests. Make sure you have a test database configured before running the tests.

## Database Version Control

The application includes database version control functionality. Available commands:

```bash
# View current database version
npm run db:version

# List all versions
npm run db:list

# Rollback to a specific version
npm run db:rollback <version>
```

## GitHub Integration

The project is configured to work with GitHub. To set up GitHub integration:

1. Create a GitHub Personal Access Token with repo permissions
2. Add the token to your environment variables as GITHUB_TOKEN
3. The repository is already connected to: https://github.com/jbd7899/myrentcard.git

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