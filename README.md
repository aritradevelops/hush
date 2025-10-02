<p align="center">
  <img src="./clients/web/public/logo.png" alt="Logo" width="150" />
</p>

#  Hush
> A modern, full-stack end-to-end encrypted chat application for secure communications

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue?style=for-the-badge)](https://hush.swiftgeek.in)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

[Hush](https://hush.swiftgeek.in) delivers privacy-first messaging with end-to-end encryption, ensuring your conversations remain completely private. Built with modern technologies for seamless performance across all devices.

---
## Backstory / Inspiration
  - When I started this project there were many questions in my head like how to manage socket, authentication, authorization, encryption, database layer, read receipts, file encryption, private chat, group chat, web workers, multipart upload, secure key exchange and many more. Of course there are many tutorials which covers chat application, mostly they does not cover any of the above mentioned, just the basic concepts. So with this repository I tend to share my findings and a decent implementation putting all the pieces together. I hope it guides the future me's :)

## ✨ Features

### 🔐 **Security & Privacy**
- **End-to-end encryption** - Messages encrypted with AES-GCM, media with AES-CTR
- **RSA key exchange** - Secure 2048-bit RSA key pairs for initial key establishment
- **Zero-knowledge architecture** - Server cannot read your messages or access encryption keys
- **Secure file sharing** - Documents, images, and media encrypted before upload

### 💬 **Messaging**
- **Direct messaging** - One-on-one conversations
- **Group messaging** - Secure group chats with multiple participants
- **Read status tracking** - Know when messages are delivered and read
- **Rich media support** - Share images, documents, and files securely

### 👥 **User Management**
- **Block users** - Control who can contact you
- **User profiles** - Customizable user information
- **Online status** - See when contacts are active

### 🎯 **Coming Soon**
- **Video conferencing** with scalable SFU architecture
- **Message reactions** and emoji responses
- **Message replies** and threading
- **Message deletion** and editing
- **Enhanced media preview** - In-app image and video preview

---

## 🚀 What Makes Hush Different

- **Client-Side Encryption**: All encryption happens in your browser using Web Crypto API
  - **AES-GCM** for message encryption with authenticated encryption
  - **AES-CTR** for media files with stream-based encryption
  - **RSA-2048** key pairs for secure key exchange protocols

- **Performance Optimizations**
  - **Web Workers**: Multipart uploads and chunk processing in background threads
  - **Smart File Handling**: Large files chunked, uploaded, and reassembled efficiently
  - **Progressive Downloads**: Media files downloaded in chunks and merged seamlessly

### **Scalable Architecture**
- **Horizontally Scalable**: Socket.io servers with Redis pub/sub for multi-instance support
- **JWT + RBAC**: Role-based access control with secure token management
- **Database Optimization**: Custom query generation and TypeORM for complex relationships

### **Developer Experience**
- **Auto-Generated CRUD**: CLI tools for rapid API development
- **Type Safety**: End-to-end TypeScript with custom type definitions
- **Background Processing**: Web Workers handle heavy crypto operations without blocking UI
- **Real-time Everything**: Socket.io for instant message delivery and presence updates

---

## 🚀 Quick Start

### Prerequisites

Choose one of the following setups:

**Option A: Local Development**
- [Node.js](https://nodejs.org/) (v18 or higher)
- [PostgreSQL](https://www.postgresql.org/) database
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

**Option B: Docker**
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

### 🖥️ Server Setup

#### Using Node.js
```bash
# Navigate to server directory
cd server

# Copy environment configuration
cp .env.example .env

# Install dependencies
npm ci

# Start PostgreSQL database (ensure it's running)
# Configure database connection in .env file

# Run database migrations
npm run migrate

# Start development server
npm run dev
```

#### Using Docker
```bash
# Navigate to server directory
cd server

# Copy environment configuration
cp .env.example .env

# Start all services (database + server)
docker-compose up
```

### 🌐 Client Setup

#### Using Node.js
```bash
# Navigate to web client directory
cd clients/web

# Copy environment configuration
cp example.env .env

# Install dependencies
npm ci

# Start development server
npm run dev
```

#### Using Docker
```bash
# Coming soon - Docker setup for client
# TODO: Add Docker configuration for web client
```

---

## 🛠️ Development

### Project Structure
```
hush/
├── server/             # Backend API server
│   ├── src/            # Source code
│   ├── @types/         # Global Types
│   ├── cli/            # CLI for generating CRUD & query
│   ├── db/             # Docker compose file for spinning postgres individually
│   ├── docs/           # Documentation
│   ├── local/          # Internationalization
│   ├── queries/        # Complex sql queries (code is auto-generated)
│   ├── migrations/     # Database migrations
│   └── docker-compose.yml
├── clients/
│   └── web/            # Frontend web application
└
```

### Environment Variables

#### Server (.env)
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/hush

# Server
PORT=3000
NODE_ENV=development

# Security
JWT_SECRET=your-super-secret-jwt-key
ENCRYPTION_KEY=your-encryption-key

# File Storage
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760  # 10MB
```

#### Client (.env)
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000

# App Configuration
NEXT_PUBLIC_APP_NAME=Hush
NEXT_PUBLIC_MAX_FILE_SIZE=10485760
```

### Available Scripts

#### Server
```bash
npm run dev          # Start development server
npm run prod         # Start production server
npm run prod:watch   # Start production server in watch mode
npm run build        # Build for production
npm run cli g:crud <ModuleName(In Pascal Case)> # Generate a new CRUD Module
npm run cli r:crud <ModuleName(In Pascal Case)> # Remove a CRUD Module
npm run cli g:query  # Generate code for SQL queries written in queries directory
```

#### Client
```bash
npm run dev           # Start development server
npm run build         # Build for production
npm run build:workers # Build the web workers
npm run watch:workers # Build the web workers in watch mode
npm run start         # Start production server
```

---

## 🔐 Security Architecture

### Client-Side Encryption
- **Message Encryption**: AES-GCM (Galois/Counter Mode) with authenticated encryption
  - 256-bit keys with built-in authentication
  - Prevents tampering and ensures message integrity
  - Unique nonce for each message
  
- **Media Encryption**: AES-CTR (Counter Mode) for streaming encryption
  - Efficient for large files with parallel processing
  - Stream cipher perfect for chunked uploads/downloads
  - No padding required, works with any file size

### Secure Key Exchange
- **RSA Key Pairs**: 2048-bit RSA encryption for initial key establishment
- **Secure Storage**: Keys stored in browser's IndexedDB with additional encryption layer

### Authentication & Authorization
- **JWT Authentication**: Stateless tokens with configurable expiration
- **Role-Based Access Control (RBAC)**: Granular permissions system
- **Refresh Token Rotation**: Automatic token refresh with security best practices
- **Session Management**: Secure logout and session invalidation

### Data Protection
- **Zero-Knowledge**: Server never has access to decryption keys or plaintext

---

## 🏗️ Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js with custom middleware
- **Database**: PostgreSQL with TypeORM
- **Real-time**: Socket.io with Redis pub/sub for horizontal scaling
- **Authentication**: JWT with RBAC implementation
- **File Storage**: Local filesystem / AWS S3 with multipart uploads
- **Video Infrastructure**: SFU (Selective Forwarding Unit) architecture

### Frontend
- **Framework**: Next.js with TypeScript
- **UI Library**: React with Tailwind CSS
- **State Management**: React Context + Custom hooks
- **Real-time**: Socket.io client with auto-reconnection
- **Encryption**: Web Crypto API with custom implementations
- **File Handling**: Web Workers for background processing
- **Performance**: Chunk-based uploads/downloads with progress tracking

### DevOps
- **Containerization**: Docker & Docker Compose
- **Development**: Hot reload, TypeScript, ESLint
- **Deployment**: Production-ready Docker images

---

## 📋 Roadmap

### Phase 1: Core Messaging ✅
- [x] End-to-end encrypted messaging
- [x] User authentication and profiles
- [x] Direct and group messaging
- [x] File sharing with encryption
- [x] Read status and user blocking
- [x] Database migrations

### Phase 2: Enhanced Features 🔄
- [ ] Message replies and threading
- [ ] Message reactions with emojis
- [ ] Message deletion and editing
- [ ] Enhanced media preview
- [ ] Push notifications

### Phase 3: Advanced Communication 🔮
- [ ] Video conferencing with SFU
- [ ] Voice messages
- [ ] Screen sharing
- [ ] File collaboration tools

### Phase 4: Platform Expansion 🚀
- [ ] Mobile applications (iOS/Android)
- [ ] Desktop applications (Electron)
- [ ] Browser extensions
- [ ] API for third-party integrations

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### 🎯 Hacktoberfest 2025

This project is participating in Hacktoberfest 2025! We welcome contributions from developers of all skill levels.

**Good First Issues**: Look for issues labeled with `good first issue`, `hacktoberfest`, or `help wanted`.

**Contribution Types**:
- 🐛 Bug fixes
- ✨ New features  
- 📚 Documentation improvements
- 🧪 Test coverage
- 🎨 UI/UX enhancements
- 🔒 Security improvements

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'feat: Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Code of Conduct
Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🌟 Support

### Community
- **Issues**: [GitHub Issues](https://github.com/aritradevelops/hush/issues)
- **Discussions**: [GitHub Discussions](https://github.com/aritradevelops/hush/discussions)
- **Security**: [Security Policy](SECURITY.md)
- **Contributing**: [Contributing Guide](CONTRIBUTING.md)
- **Code of Conduct**: [Code of Conduct](CODE_OF_CONDUCT.md)

### Maintainers
- **Lead Developer**: [@aritradevelops](https://github.com/aritradevelops)

### 🎯 Hacktoberfest 2025
This project is participating in Hacktoberfest 2025! We welcome contributions from developers of all skill levels. Check out our [Contributing Guide](CONTRIBUTING.md) to get started.

## Good To Know
- As only one instance of the server is running I have not implemented any code for synchronizing the server's socket state.
by default socket server's are not horizontally scalable. To achieve horizontal scalability please follow this official guide 
[here](https://socket.io/docs/v4/tutorial/step-9)

---

<div align="center">

**[🔒 Try Hush Live](https://hush.swiftgeek.in)** | **[🐛 Report Bug](https://github.com/aritradevelops/hush/issues)**

Made with ❤️ for privacy-conscious users worldwide

*Your conversations, truly private.*

</div>