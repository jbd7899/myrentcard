# Make your changes in Replit
   # Then run the sync script
   bash scripts/sync-github.sh
   ```

3. The repository is connected to: https://github.com/jbd7899/myrentcard.git

### Development Workflow

1. Make changes in Replit
2. Test your changes thoroughly
3. Run the sync script to push to GitHub:
   ```bash
   bash scripts/sync-github.sh
   ```

4. Verify changes are reflected in the GitHub repository


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

## Testing

To run the integration tests:

```bash
npm run test