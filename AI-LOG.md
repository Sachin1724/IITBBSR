# AI-LOG.md
## Large Language Model (LLM) Usage Documentation

**Project**: Cosmic Watch - Asteroid Tracking & Impact Simulation Platform  
**Team Member**: Sachin  
**Competition**: NASA Space Apps Challenge 2025  
**Date**: February 2026

---

## Purpose of This Document

This document serves as a transparent log of how Large Language Models (LLMs) were used throughout the development of this project. As per competition guidelines, this log demonstrates that **AI was used as an assistive tool to enhance productivity and learning**, not as a replacement for original coding efforts.

---

## Project Overview

**Cosmic Watch** is a full-stack web application for tracking near-Earth asteroids and simulating their potential Earth impacts. The project consists of:
- **Backend**: Node.js, TypeScript, Fastify, MongoDB, Socket.IO
- **Frontend**: Next.js 14, React, TypeScript, Three.js, Tailwind CSS
- **Real-time Features**: WebSocket-based chat, live notifications
- **Data Visualization**: 3D impact simulations, interactive asteroid data

---

## How LLMs Were Used (Assistant Role)

### 1. **Architecture Planning & Design Decisions**
**Original Effort**: Team designed the overall system architecture, chose the tech stack, and defined feature requirements.

**LLM Assistance**:
- Suggested best practices for Next.js 14 App Router structure
- Recommended Socket.IO for real-time chat implementation
- Advised on MongoDB schema design patterns
- Helped structure the codebase with clear separation of concerns (routes, models, services, sockets)

**Outcome**: Team made final decisions on architecture; LLM provided options and trade-offs.

---

### 2. **NASA API Integration**
**Original Effort**: Team researched NASA's NeoWs API documentation, determined data requirements, and designed the caching strategy.

**LLM Assistance**:
- Helped write TypeScript interfaces for NASA API responses
- Suggested error handling patterns for API failures
- Recommended caching mechanisms using Redis and database fallbacks
- Assisted with date formatting and query parameter construction

**Code Example** (`backend/src/services/nasa.service.ts`):
```typescript
// Original design: Team decided to use try-catch with fallbacks
// LLM assistance: Helped implement the caching logic and error messages
```

---

### 3. **Real-Time Chat System with Zero Latency**
**Original Effort**: Team identified the need for instant messaging, researched Socket.IO, and designed the message flow.

**LLM Assistance**:
- **Performance Optimization**: Suggested emitting messages before database writes using `setImmediate()`
- **WebSocket Configuration**: Recommended websocket-only transport to eliminate polling overhead
- **Message Grouping**: Helped implement WhatsApp-style consecutive message grouping logic
- Assisted with TypeScript interfaces for chat messages and conversations

**Key Innovation** (`backend/src/sockets/chat.socket.ts`):
```typescript
// Original idea: Team wanted instant messaging
// LLM contribution: Suggested async database writes for zero latency
setImmediate(async () => {
    await chatMessage.save()
})
```

---

### 4. **3D Impact Visualization with Three.js**
**Original Effort**: Team conceptualized the 3D Earth model, impact visualization, and fire particle effects.

**LLM Assistance**:
- Helped debug Three.js shader issues
- Suggested particle system implementation for realistic fire effects
- Assisted with color gradients (white → orange → smoke)
- Recommended using `react-three-fiber` for React integration

**Creative Work** (`frontend/components/simulation/FireParticles.tsx`):
- Team designed the visual aesthetic
- LLM helped translate physics concepts into code

---

### 5. **Google OAuth Integration**
**Original Effort**: Team registered the app with Google Cloud Console, obtained credentials, and designed the authentication flow.

**LLM Assistance**:
- Debugged "missing client_id" errors
- Helped configure OAuth redirect URIs for local and production environments
- Suggested proper environment variable management
- Assisted with JWT token generation and validation

**Configuration Work**:
- Team manually configured Google Cloud Console
- LLM helped troubleshoot configuration issues

---

### 6. **UI/UX Design**
**Original Effort**: Team designed the cosmic/space theme, color palette, and user workflows.

**LLM Assistance**:
- Helped implement Tailwind CSS utility classes
- Suggested animation patterns using `framer-motion`
- Assisted with responsive design breakpoints
- Recommended icon libraries (react-icons)

**Design Decisions**: Team made all final UI/UX choices; LLM helped with implementation.

---

### 7. **Database Schema Design**
**Original Effort**: Team identified data entities (User, Asteroid, ChatMessage, Conversation, etc.) and relationships.

**LLM Assistance**:
- Helped write Mongoose schemas with TypeScript types
- Suggested indexing strategies for performance
- Recommended virtual fields and populate patterns
- Assisted with validation rules

**Example** (`backend/src/models/User.ts`):
```typescript
// Team designed the User model structure
// LLM helped with Mongoose syntax and TypeScript integration
```

---

### 8. **Error Handling & Edge Cases**
**Original Effort**: Team identified potential failure points through testing.

**LLM Assistance**:
- Suggested try-catch patterns
- Helped implement fallback mechanisms (e.g., database fallback when NASA API fails)
- Assisted with user-friendly error messages
- Recommended validation patterns

---

### 9. **Deployment Configuration**
**Original Effort**: Team chose hosting platforms (Netlify for frontend, Render for backend).

**LLM Assistance**:
- Helped configure environment variables for production
- Suggested CORS configuration for cross-origin requests
- Assisted with deployment troubleshooting
- Recommended caching headers and optimization strategies

---

## What LLMs Did NOT Do

To maintain academic integrity, the following remained entirely the team's original work:

1. **Concept & Innovation**: All project ideas, features, and creative decisions
2. **Problem Definition**: Identifying what features to build and why
3. **User Research**: Understanding asteroid tracking needs and simulation requirements
4. **Testing & Debugging**: Manual testing, finding bugs, and verifying fixes
5. **Design Aesthetic**: Color schemes, layouts, and user experience flows
6. **Data Analysis**: Interpreting asteroid data and impact calculations
7. **Feature Prioritization**: Deciding what to build first and what to defer

---

## Learning Outcomes

Through this AI-assisted development process, the team learned:

1. **Modern Web Development**: Next.js 14 App Router, Server Components, and API Routes
2. **Real-Time Systems**: WebSocket implementation and performance optimization
3. **3D Graphics**: Three.js, shader programming, and particle systems
4. **Database Design**: MongoDB schema patterns and indexing strategies
5. **Authentication**: OAuth 2.0 flows and JWT token management
6. **DevOps**: Environment configuration, deployment, and production optimization

**Key Insight**: Using AI as a learning accelerator helped the team understand complex concepts faster while still requiring hands-on implementation and debugging.

---

## Code Ownership & Originality

### Original Code (100% Team Effort)
- All business logic and feature implementations
- Database models tailored to project requirements
- Custom impact simulation algorithms
- UI/UX design and component structure
- Real-time chat message grouping logic
- NASA API integration strategy

### AI-Assisted Code (Team Design + LLM Implementation Help)
- TypeScript type definitions
- Error handling patterns
- Socket.IO event handlers
- Three.js particle system physics
- Tailwind CSS utility combinations

### No Direct Code Copying
- **Zero code was copied directly from LLM outputs without understanding**
- All code was reviewed, tested, and modified by the team
- Team members understand every line of code in the project

---

## Transparency Statement

This project was developed with the assistance of Large Language Models as a **productivity and learning tool**. The core ideas, architecture decisions, feature design, and final implementation are **100% the original work of the team**.

We used AI to:
- ✅ Accelerate development
- ✅ Learn best practices
- ✅ Debug complex issues
- ✅ Implement industry-standard patterns

We did NOT use AI to:
- ❌ Generate entire features without understanding
- ❌ Copy solutions blindly
- ❌ Replace original thinking and problem-solving
- ❌ Avoid learning the underlying technologies

---

## Verification

**Reviewers can verify our work by**:
1. Asking questions about any part of the codebase - we can explain all design decisions
2. Requesting live demonstrations of features and debugging sessions
3. Reviewing our Git commit history showing iterative development
4. Testing our knowledge of the technologies used

---

## Conclusion

This AI-LOG.md demonstrates that **Large Language Models were used responsibly as assistive tools**, not as replacements for original coding effort. The team maintains full ownership and understanding of the codebase, and all creative and technical decisions were made by human team members.

**Signed**:  
Sachin  
Team: IITBBSR  
Date: February 8, 2026
