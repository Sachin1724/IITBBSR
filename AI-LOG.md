# AI-LOG.md
## How We Used AI in Our Project

**Project**: Cosmic Watch - Asteroid Tracking & Impact Simulation  
**Team Members**: Sachidananda Mallick, Dibyajyoti Parida, Sanedeep kumar Sahu  
**Team Name**: HACKX-V  
**Competition**: Web Hackathon  
**Date**: 8 February 2026

---

### Our Approach to AI
In building **Cosmic Watch**, our team utilized Large Language Models (LLMs) primarily as a "senior developer" or "pair programmer." We didn't want the AI to write the app for us; instead, we used it to speed up our workflow, debug tricky issues, and help us learn new technologies (like Three.js and Socket.io) much faster than we could have on our own.

Every piece of code in this project was reviewed, understood, and often heavily modified by us to fit our specific needs.

---

### Where AI Lent a Hand

#### 1. Architecting the "Cosmos"
We started with a vision of a real-time asteroid tracker. We used AI to bounce ideas off of regarding our project structure. It suggested using the **Next.js 14 App Router** for the frontend and a **Fastify/MongoDB** stack for the backend to keep things fast. It helped us organize our folders so that our routes, models, and socket logic stayed separated and clean.

#### 2. Wrangling NASA's Data
NASA's APIs provide incredible data, but their responses are quite complex. AI was a huge help in creating **TypeScript interfaces** that accurately mapped those responses. We also brainstormed with the AI on how to handle API failures—implementing a retry logic and a database fallback so the app wouldn't crash if NASA's servers were busy.

#### 3. Reaching "Zero Latency" in Chat
One of our biggest goals was making the real-time chat feel as fast as WhatsApp. 
*   **The Idea**: We wanted the message to appear *instantly* when you hit send.
*   **The AI Assist**: It suggested a clever trick—using `setImmediate()` in the backend to broadcast the message to everyone *first*, and then save it to the database in the background. This removed the "wait time" for the user. 
*   **The UI**: It also helped us write the logic to group consecutive messages from the same user, so you don't see the same avatar over and over again.

#### 4. Bringing the 3D Simulation to Life
We used **Three.js** for the Earth model and impact simulation. We had some trouble getting the fire particle effects to look "right." The AI helped us tweak the shader math for the fire colors (shifting from intense white to smoky orange) and suggested using `react-three-fiber` to make the 3D elements work seamlessly inside our React components.

#### 5. Tackling Authentication
Setting up **Google OAuth** and **JWT** can be a headache with all the redirect URIs and environment variables. AI acted as a great troubleshooting partner when we hit "missing client_id" errors, helping us double-check our `.env` configs and Google Console settings.

---

### What We Did Ourselves (The Human Effort)

While AI helped with the "how," the "what" and "why" came entirely from us:

*   **Core Innovation**: The entire concept of an "impact simulator" linked to live NASA data was our team's creative spark.
*   **UI Design Aesthetic**: We hand-picked the colors, designed the "glassmorphism" cards, and created the overall dark, cosmic vibe of the site.
*   **Feature Logic**: We decided which features mattered most to users—like the watchlist and the personal inbox.
*   **Debugging**: LLMs often guess wrong. We spent hours manually testing buttons, fixing layout issues on mobile, and ensuring the database was actually storing the right values.
*   **Prioritization**: We managed our own time, deciding when to focus on the 3D model and when to polish the chat.

---

### The Learning Curve
By working alongside AI, our team didn't just "get it done"—we learned. We now have a much deeper understanding of:
*   Real-time communication with **WebSockets**.
*   Managing complex **3D scenes** in a web browser.
*   Securing a modern app with **OAuth 2.0**.
*   Optimizing **database performance** for a smoother user experience.

---

### Our Promise of Originality
We certify that this project is our original work. AI was used as a tool to enhance our productivity, much like a calculator or a library, but the human decision-making and coding execution remain our own.

**Signed with Pride**:

Sachidananda Mallick  
Dibyajyoti Parida  
Sanedeep kumar Sahu  

**Team HACKX-V**  
*8 February 2026*
