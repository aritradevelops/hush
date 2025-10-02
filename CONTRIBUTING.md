# Contributing to Hush

Thank you for your interest in contributing to Hush! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Issues

Before creating an issue, please:
1. Check if the issue already exists
2. Use the appropriate issue template
3. Provide as much detail as possible

### Suggesting Features

We welcome feature suggestions! Please:
1. Use the feature request template
2. Explain the use case and benefits
3. Consider if it aligns with our privacy-first mission

### Code Contributions

#### Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/hush.git
   cd hush
   ```

3. **Set up development environment**
   ```bash
   # Server setup
   cd server
   cp .env.example .env
   npm ci
   
   # Client setup
   cd ../clients/web
   cp example.env .env
   npm ci
   ```

4. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

#### Development Guidelines

##### Code Style
- Follow existing code patterns and conventions
- Use TypeScript for all new code
- Write meaningful commit messages following [Conventional Commits](https://www.conventionalcommits.org/)
- Ensure all code is properly typed

##### Testing
- Test your changes thoroughly
- Ensure existing functionality isn't broken
- Add tests for new features when possible

##### Security Considerations
- **Never commit encryption keys or secrets**
- Follow security best practices for crypto operations
- Be extra careful with authentication and authorization code
- Review encryption implementations with maintainers

#### Commit Guidelines

Use conventional commit format:
```
type(scope): description

Examples:
feat(auth): add OAuth2 integration
fix(encryption): resolve key generation issue
docs(readme): update installation instructions
refactor(socket): improve connection handling
```

#### Pull Request Process

1. **Update your branch**
   ```bash
   git checkout main
   git pull origin main
   git checkout your-feature-branch
   git rebase main
   ```

2. **Test your changes**
   - Run the development server
   - Test the web client
   - Verify encryption/decryption works
   - Check for any console errors

3. **Create a Pull Request**
   - Use the PR template
   - Provide a clear description
   - Link related issues
   - Include screenshots for UI changes

4. **Respond to feedback**
   - Address review comments promptly
   - Make requested changes
   - Keep the PR focused and atomic

## 🏗️ Project Structure

### Backend (`/server`)
- **Controllers**: Handle HTTP requests and responses
- **Services**: Business logic and data processing
- **Entities**: Database models and relationships
- **Repositories**: Data access layer
- **Socket**: Real-time communication handlers
- **CLI**: Code generation tools

### Frontend (`/clients/web`)
- **Components**: Reusable UI components
- **Hooks**: Custom React hooks
- **Contexts**: State management
- **Workers**: Background processing for encryption
- **Lib**: Utility functions and helpers

## 🔐 Security Guidelines

### Encryption Implementation
- All encryption must happen client-side
- Use Web Crypto API for cryptographic operations
- Never store encryption keys on the server
- Follow established patterns for key exchange

### Authentication & Authorization
- Implement proper RBAC checks
- Validate all user inputs
- Use secure session management
- Follow JWT best practices

### File Handling
- Validate file types and sizes
- Implement proper sanitization
- Use secure upload/download patterns
- Handle encryption/decryption in workers

## 🧪 Development Workflow

### Local Development
1. Start PostgreSQL database
2. Run server migrations
3. Start the backend server
4. Start the frontend development server
5. Test your changes

### Code Generation
The project includes CLI tools for generating CRUD operations:
```bash
# Generate new CRUD module
npm run cli g:crud ModuleName

# Remove CRUD module
npm run cli r:crud ModuleName

# Generate query code
npm run cli g:query
```

## 📋 Hacktoberfest Guidelines

### Good First Issues
Look for issues labeled with:
- `good first issue`
- `hacktoberfest`
- `help wanted`

### Contribution Types
We welcome various types of contributions:
- **Bug fixes**: Resolve existing issues
- **Feature additions**: Implement new functionality
- **Documentation**: Improve docs and examples
- **Testing**: Add test coverage
- **Performance**: Optimize existing code
- **Security**: Improve security measures

### Hacktoberfest Requirements
- PRs must be submitted between October 1-31
- Must be accepted by maintainers
- Should be meaningful contributions
- Follow our code of conduct

## 🐛 Bug Reports

When reporting bugs, please include:
- **Environment**: OS, Node.js version, browser
- **Steps to reproduce**: Clear, numbered steps
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Screenshots**: If applicable
- **Console errors**: Any error messages

## 💡 Feature Requests

For feature requests, please include:
- **Use case**: Why is this feature needed?
- **Proposed solution**: How should it work?
- **Alternatives**: Other approaches considered
- **Additional context**: Any other relevant information

## 📞 Getting Help

- **GitHub Discussions**: For questions and general discussion
- **GitHub Issues**: For bugs and feature requests

## 📄 License

By contributing to Hush, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- GitHub contributor graphs

Thank you for contributing to Hush! Together, we're building a more private and secure communication platform.
