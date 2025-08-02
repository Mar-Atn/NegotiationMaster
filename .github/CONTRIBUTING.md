# Contributing to NegotiationMaster

## Git Branching Strategy

We follow a Git Flow branching model for organized development:

### Branch Types

- **main**: Production-ready code only. All releases are tagged here.
- **develop**: Integration branch for features. Always stable and ready for release.
- **feature/**: Individual feature development (e.g., `feature/voice-integration`)
- **hotfix/**: Critical bug fixes for production (e.g., `hotfix/security-patch`)
- **release/**: Preparation for new releases (e.g., `release/v1.2.0`)

### Workflow

1. **Feature Development**:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   # Develop your feature
   git push origin feature/your-feature-name
   # Create PR to develop
   ```

2. **Hotfixes**:
   ```bash
   git checkout main
   git checkout -b hotfix/fix-description
   # Fix the issue
   git push origin hotfix/fix-description
   # Create PR to main AND develop
   ```

3. **Releases**:
   ```bash
   git checkout develop
   git checkout -b release/v1.x.x
   # Prepare release (version bumps, changelog)
   git push origin release/v1.x.x
   # Create PR to main, then merge main to develop
   ```

## Commit Message Standards

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format
```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, semicolons, etc.)
- **refactor**: Code refactoring without feature changes
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Build process, dependencies, tooling

### Examples
```bash
feat(auth): implement JWT refresh token rotation
fix(socket): resolve connection timeout issues
docs(api): update endpoint documentation
chore(deps): update dependencies to latest versions
```

### Scopes
- **auth**: Authentication system
- **socket**: Real-time functionality
- **api**: Backend API endpoints
- **ui**: Frontend components
- **db**: Database operations
- **config**: Configuration changes

## Pull Request Guidelines

1. **Title**: Use conventional commit format
2. **Description**: Explain what and why, not how
3. **Testing**: Include test results and coverage
4. **Documentation**: Update relevant docs
5. **Review**: At least one approval required

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings/errors
```

## Code Review Process

1. **Automated Checks**: All CI/CD checks must pass
2. **Code Review**: At least one team member review
3. **Testing**: Comprehensive test coverage required
4. **Documentation**: Update docs for new features
5. **Merge**: Squash and merge to keep history clean

## Release Process

1. Create release branch from develop
2. Update version numbers and changelog
3. Run full test suite
4. Create PR to main
5. Tag release after merge
6. Merge main back to develop
7. Deploy to production

## Git Hooks

Pre-commit hooks run automatically:
- ESLint for code quality
- Prettier for formatting
- Test suite execution
- Commit message validation